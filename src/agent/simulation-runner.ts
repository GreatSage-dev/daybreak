import { AgentDecision, TradeEvent } from '../types/index.js';
import { BitgetMcpAdapter } from '../adapters/bitget-mcp.js';
import { BitgetSignalAdapter } from '../adapters/bitget-signal.js';
import { BitgetAgentHubClient } from '../adapters/agent-hub.js';
import { DaybreakAgent } from './daybreak-agent.js';
import { NaiveAgent } from './naive-agent.js';

export interface SimulationEventConfig {
  event: TradeEvent;
  mondayOpenPrice: number;
  referenceTime: number; // millisecond timestamp
  baseSizeUsd?: number;
}

export interface SimulationTradeComparison {
  tradeId: string;
  symbol: string;
  headline: string;
  mondayOpenPrice: number;
  daybreak: {
    decision: AgentDecision;
    pnlUsd: number;
    slippageBps: number;
    capitalPreservedUsd: number;
  };
  naive: {
    decision: AgentDecision;
    pnlUsd: number;
    slippageBps: number;
    capitalPreservedUsd: number;
  };
}

export interface AgentPerformanceSummary {
  agentName: string;
  tradesAttempted: number;
  tradesExecuted: number;
  tradesRefused: number;
  totalPnlUsd: number;
  totalSlippageBps: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  capitalPreservedUsd: number;
}

export interface SimulationResult {
  comparisons: SimulationTradeComparison[];
  daybreakSummary: AgentPerformanceSummary;
  naiveSummary: AgentPerformanceSummary;
  alphaAdvantageUsd: number;
  totalBasisPointsSaved: number;
}

export const BENCHMARK_SIMULATION_EVENTS: SimulationEventConfig[] = [
  {
    // Event 1: AMC Saturday dark-hours wash trading pump (+18.3% synthetic spike, no 8-K)
    event: {
      id: 'shock-amc-saturday-wash',
      timestamp: Date.UTC(2026, 9, 10, 16, 0, 0), // Saturday 12:00 EDT (deltaHours = 20)
      headline: 'AMC short squeeze rumours trending on Telegram, weekend token price surging',
      affectedSymbol: 'AMC-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.95,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 10, 16, 0, 0),
    mondayOpenPrice: 4.12, // Snaps back Monday 9:30 AM close to Friday close of 4.10!
    baseSizeUsd: 10_000,
  },
  {
    // Event 2: NVDA Sunday Globex futures reopen with confirmed institutional AI compliance clearance
    event: {
      id: 'shock-nvda-sunday-futures',
      timestamp: Date.UTC(2026, 9, 11, 23, 0, 0), // Sunday 19:00 EDT (deltaHours = 51)
      headline: 'NVIDIA files SEC 8-K confirming major sovereign AI infrastructure contract',
      affectedSymbol: 'NVDA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.85,
      hasOfficialFiling: true,
    },
    referenceTime: Date.UTC(2026, 9, 11, 23, 0, 0),
    mondayOpenPrice: 133.50, // Legit gap up from 128.50!
    baseSizeUsd: 10_000,
  },
  {
    // Event 3: TSLA Saturday illiquid flash rumor on thin book
    event: {
      id: 'shock-tsla-saturday-thin',
      timestamp: Date.UTC(2026, 9, 10, 20, 0, 0), // Saturday 16:00 EDT (deltaHours = 24)
      headline: 'Tesla unverified social media claim of breakthrough battery density',
      affectedSymbol: 'TSLA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.80,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 10, 20, 0, 0),
    mondayOpenPrice: 244.20, // Reverts back to Friday baseline 244.50
    baseSizeUsd: 10_000,
  },
  {
    // Event 4: AAPL Monday pre-market institutional positioning
    event: {
      id: 'shock-aapl-monday-premarket',
      timestamp: Date.UTC(2026, 9, 12, 11, 0, 0), // Monday 07:00 EDT (deltaHours = 63)
      headline: 'Apple regulatory approval in Europe for new hardware service architecture',
      affectedSymbol: 'AAPL-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.70,
      hasOfficialFiling: true,
    },
    referenceTime: Date.UTC(2026, 9, 12, 11, 0, 0),
    mondayOpenPrice: 232.00, // Moves up from 230.15
    baseSizeUsd: 10_000,
  },
];

export class SimulationRunner {
  private mcp: BitgetMcpAdapter;
  private signal: BitgetSignalAdapter;

  constructor(mcp?: BitgetMcpAdapter, signal?: BitgetSignalAdapter) {
    this.mcp = mcp ?? new BitgetMcpAdapter({ forceOfflineFixtures: true });
    this.signal = signal ?? new BitgetSignalAdapter();
  }

  public async runSimulation(events: SimulationEventConfig[] = BENCHMARK_SIMULATION_EVENTS): Promise<SimulationResult> {
    const hubDaybreak = new BitgetAgentHubClient({ paperTrading: true });
    const hubNaive = new BitgetAgentHubClient({ paperTrading: true });

    const daybreakAgent = new DaybreakAgent(this.mcp, this.signal, hubDaybreak);
    const naiveAgent = new NaiveAgent(this.mcp, hubNaive);

    const comparisons: SimulationTradeComparison[] = [];
    const daybreakPnls: number[] = [];
    const naivePnls: number[] = [];

    let daybreakExecuted = 0;
    let daybreakRefused = 0;
    let naiveExecuted = 0;
    let naiveRefused = 0;
    let totalBasisPointsSaved = 0;

    for (const item of events) {
      const baseSize = item.baseSizeUsd ?? 10_000;

      // 1. Run Daybreak Agent
      const dbDecision = await daybreakAgent.processEvent(item.event, baseSize, item.referenceTime);

      // 2. Run Naive Agent
      const nvDecision = await naiveAgent.processEvent(item.event, baseSize, item.referenceTime);

      // Compute PnL for Daybreak
      let dbPnl = 0;
      let dbSlippage = 0;
      let dbCapPreserved = dbDecision.mondayRiskProtectionUsd;

      if (dbDecision.action === 'REFUSE') {
        daybreakRefused++;
        dbPnl = 0;
      } else {
        daybreakExecuted++;
        // PnL based on monday open price
        const priceReturn = (item.mondayOpenPrice - dbDecision.targetPrice) / dbDecision.targetPrice;
        const slippageCostUsd = dbDecision.sizeUsd * 0.0008; // minimal peg/scaled slippage
        dbSlippage = 8;
        dbPnl = dbDecision.sizeUsd * priceReturn - slippageCostUsd;
      }

      // Compute PnL for Naive
      naiveExecuted++;
      // Naive bought at market price + aggressive spread slippage
      const nvSlippageBps = (baseSize / 10000) * 12 + 15; // wide dark-hours slippage
      const nvSlippageCostUsd = baseSize * (nvSlippageBps / 10000);
      const nvPriceReturn = (item.mondayOpenPrice - nvDecision.targetPrice) / nvDecision.targetPrice;
      const nvPnl = baseSize * nvPriceReturn - nvSlippageCostUsd;

      daybreakPnls.push(dbPnl);
      naivePnls.push(nvPnl);
      totalBasisPointsSaved += dbDecision.basisPointsSaved;

      comparisons.push({
        tradeId: item.event.id,
        symbol: item.event.affectedSymbol,
        headline: item.event.headline,
        mondayOpenPrice: item.mondayOpenPrice,
        daybreak: {
          decision: dbDecision,
          pnlUsd: Number(dbPnl.toFixed(2)),
          slippageBps: dbSlippage,
          capitalPreservedUsd: dbCapPreserved,
        },
        naive: {
          decision: nvDecision,
          pnlUsd: Number(nvPnl.toFixed(2)),
          slippageBps: Number(nvSlippageBps.toFixed(2)),
          capitalPreservedUsd: 0,
        },
      });
    }

    const daybreakSummary = this.calculateSummary('Daybreak Autonomous Agent', daybreakPnls, daybreakExecuted, daybreakRefused, comparisons.map((c) => c.daybreak.slippageBps), comparisons.reduce((acc, c) => acc + c.daybreak.capitalPreservedUsd, 0));
    const naiveSummary = this.calculateSummary('Naive Baseline Median Bot', naivePnls, naiveExecuted, naiveRefused, comparisons.map((c) => c.naive.slippageBps), 0);

    const alphaAdvantageUsd = Number((daybreakSummary.totalPnlUsd - naiveSummary.totalPnlUsd).toFixed(2));

    return {
      comparisons,
      daybreakSummary,
      naiveSummary,
      alphaAdvantageUsd,
      totalBasisPointsSaved: Number(totalBasisPointsSaved.toFixed(1)),
    };
  }

  private calculateSummary(
    agentName: string,
    pnls: number[],
    executed: number,
    refused: number,
    slippages: number[],
    capitalPreservedUsd: number
  ): AgentPerformanceSummary {
    const totalPnlUsd = Number(pnls.reduce((a, b) => a + b, 0).toFixed(2));
    const totalSlippageBps = Number(slippages.reduce((a, b) => a + b, 0).toFixed(1));

    // Calculate Max Drawdown
    let peak = 0;
    let maxDrawdownUsd = 0;
    let cumulative = 0;
    for (const pnl of pnls) {
      cumulative += pnl;
      if (cumulative > peak) peak = cumulative;
      const dd = peak - cumulative;
      if (dd > maxDrawdownUsd) maxDrawdownUsd = dd;
    }
    const maxDrawdownPct = Number(((maxDrawdownUsd / 20000) * 100).toFixed(2));

    // Calculate Sharpe Ratio
    const n = pnls.length;
    const mean = n > 0 ? pnls.reduce((a, b) => a + b, 0) / n : 0;
    const variance = n > 1
      ? pnls.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
      : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? Number((mean / stdDev).toFixed(2)) : (mean > 0 ? 5.0 : 0.0);

    return {
      agentName,
      tradesAttempted: n,
      tradesExecuted: executed,
      tradesRefused: refused,
      totalPnlUsd,
      totalSlippageBps,
      maxDrawdownPct,
      sharpeRatio,
      capitalPreservedUsd: Number(capitalPreservedUsd.toFixed(2)),
    };
  }
}
