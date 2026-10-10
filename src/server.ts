import Fastify from 'fastify';
import cors from '@fastify/cors';
import { BitgetMcpAdapter } from './adapters/bitget-mcp.js';
import { BitgetSignalAdapter } from './adapters/bitget-signal.js';
import { LiveMarketDataService } from './adapters/live-market-data.js';
import { BitgetTestnetClient } from './adapters/bitget-testnet.js';
import { calculateTrust } from './engine/trust-calculator.js';
import { calculatePhaseFromDeltaHours, evaluateTemporalCurve } from './engine/temporal-curve.js';
import { SimulationRunner, BENCHMARK_SIMULATION_EVENTS } from './agent/simulation-runner.js';
import { PaperLogEntry } from './types/index.js';

export function buildServer() {
  const server = Fastify({ logger: false });
  const mcpAdapter = new BitgetMcpAdapter({ forceOfflineFixtures: true });
  const signalAdapter = new BitgetSignalAdapter();
  const testnetClient = new BitgetTestnetClient();
  const simulationRunner = new SimulationRunner(mcpAdapter, signalAdapter);

  // Global in-memory paper log store
  const globalPaperLogs: PaperLogEntry[] = [];

  // Register CORS
  server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // GET /api/health
  server.get('/api/health', async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      engine: 'DAYBREAK_PRICE_TRUST_ENGINE',
      testnet: testnetClient.getStatus(),
    };
  });

  // GET /api/system-status (Real vs Testnet Live Telemetry)
  server.get('/api/system-status', async () => {
    const currentTemporal = evaluateTemporalCurve();
    const liveTokens = await LiveMarketDataService.getLiveTokens();
    const macroCrypto = await LiveMarketDataService.fetchLiveMacroCrypto();

    return {
      status: 'ONLINE',
      marketDataFeed: 'LIVE (Yahoo Finance Equity Feeds + CoinGecko Macro)',
      testnetStatus: testnetClient.getStatus(),
      currentPhase: currentTemporal.phase,
      phaseDescription: currentTemporal.phaseDescription,
      cmeFuturesActive: currentTemporal.cmeFuturesActive,
      baseTemporalScore: currentTemporal.baseTemporalScore,
      liveBenchmarks: {
        btcUsd: macroCrypto.btcUsd,
        ethUsd: macroCrypto.ethUsd,
        tokenQuotes: liveTokens.map((t) => ({
          symbol: t.symbol,
          underlying: t.underlying,
          price: t.price,
          lastClose: t.lastClose,
          changePct: Number((((t.price - t.lastClose) / t.lastClose) * 100).toFixed(2)),
        })),
      },
    };
  });

  // GET /api/tokens (Streams Real Live Prices)
  server.get('/api/tokens', async () => {
    // Fetch live market data
    const liveTokens = await LiveMarketDataService.getLiveTokens();
    const currentTemporal = evaluateTemporalCurve();
    const macro = await signalAdapter.getMacroAnalysis(currentTemporal.cmeFuturesActive);

    const enrichedTokens = liveTokens.map((token) => {
      const evaluation = calculateTrust(token, {
        referenceTime: Date.now(),
        macro,
      });

      return {
        ...token,
        trustEvaluation: evaluation,
      };
    });

    return {
      count: enrichedTokens.length,
      currentPhase: currentTemporal.phase,
      tokens: enrichedTokens,
    };
  });

  // GET /api/trust-curve/:symbol
  server.get<{ Params: { symbol: string } }>('/api/trust-curve/:symbol', async (req, reply) => {
    const symbol = req.params.symbol;
    const liveTokens = await LiveMarketDataService.getLiveTokens();
    const token = liveTokens.find((t) => t.symbol === symbol) || (await mcpAdapter.getToken(symbol));

    if (!token) {
      reply.status(404);
      return { error: `Token ${symbol} not found in Bitget registry.` };
    }

    // Generate curve coordinates from deltaHours = 0 to 65.5h (step = 2.5h)
    const points = [];
    for (let delta = 0; delta <= 65.5; delta += 2.5) {
      const phaseInfo = calculatePhaseFromDeltaHours(delta);
      const isCmeOpen = phaseInfo.cmeFuturesActive;
      const evaluation = calculateTrust(token, {
        referenceTime: Date.UTC(2026, 9, 9, 20, 0, 0) + delta * 3600 * 1000,
        macro: { cmeGlobexOpen: isCmeOpen },
      });

      points.push({
        deltaHours: delta,
        phase: phaseInfo.phase,
        cmeFuturesActive: isCmeOpen,
        baseTemporalScore: phaseInfo.baseTemporalScore,
        compositeTrustScore: evaluation.score,
        trustGrade: evaluation.grade,
        depthScore: evaluation.components.depthScore,
        washScore: evaluation.components.washScore,
      });
    }

    return {
      symbol: token.symbol,
      underlying: token.underlying,
      currentPrice: token.price,
      points,
    };
  });

  // POST /api/simulate
  server.post('/api/simulate', async (req) => {
    const body = (req.body as { customEvents?: typeof BENCHMARK_SIMULATION_EVENTS }) || {};
    const eventsToRun = body.customEvents ?? BENCHMARK_SIMULATION_EVENTS;

    const result = await simulationRunner.runSimulation(eventsToRun);

    // Place and register each simulated trade with the Testnet client
    for (const comp of result.comparisons) {
      if (comp.daybreak.decision.action !== 'REFUSE') {
        const testnetOrder = await testnetClient.placeOrder({
          symbol: comp.symbol,
          side: comp.daybreak.decision.action === 'BUY' ? 'buy' : 'sell',
          orderType: comp.daybreak.decision.action === 'PASSIVE_PEG' ? 'limit' : 'market',
          size: comp.daybreak.decision.sizeUsd.toString(),
          price: comp.daybreak.decision.targetPrice.toString(),
        });

        // Add testnet metadata
        (comp.daybreak.decision as any).testnetOrderId = testnetOrder.orderId;
        (comp.daybreak.decision as any).testnetStatus = testnetOrder.status;
      }

      globalPaperLogs.push({
        id: `paper-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        eventType: comp.daybreak.decision.action === 'REFUSE' ? 'TRADE_REFUSED' : 'TRADE_EXECUTED',
        agent: 'DAYBREAK_AGENT',
        symbol: comp.symbol,
        payload: {
          headline: comp.headline,
          action: comp.daybreak.decision.action,
          sizeUsd: comp.daybreak.decision.sizeUsd,
          pnlUsd: comp.daybreak.pnlUsd,
          refusalReceipt: comp.daybreak.decision.refusalReceipt,
        },
        voteOutcome: comp.daybreak.decision.action === 'REFUSE' ? 'REJECTED' : 'PASSED',
        metrics: {
          trustScore: comp.daybreak.decision.trustScore,
          grade: comp.daybreak.decision.trustGrade,
          pnlDeltaUsd: comp.daybreak.pnlUsd,
        },
      });

      globalPaperLogs.push({
        id: `paper-sim-nv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        eventType: 'TRADE_EXECUTED',
        agent: 'NAIVE_AGENT',
        symbol: comp.symbol,
        payload: {
          headline: comp.headline,
          action: comp.naive.decision.action,
          sizeUsd: comp.naive.decision.sizeUsd,
          pnlUsd: comp.naive.pnlUsd,
        },
        voteOutcome: 'PASSED',
        metrics: {
          trustScore: 0.15,
          grade: 'F',
          pnlDeltaUsd: comp.naive.pnlUsd,
        },
      });
    }

    return result;
  });

  // GET /api/paper-log
  server.get('/api/paper-log', async () => {
    return {
      count: globalPaperLogs.length,
      logs: globalPaperLogs,
    };
  });

  return server;
}

export async function startServer() {
  const server = buildServer();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const HOST = '0.0.0.0';

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`[DAYBREAK] Price Trust Engine API active at http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  startServer();
}
