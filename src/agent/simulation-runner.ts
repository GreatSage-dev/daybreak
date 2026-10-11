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

/**
 * Core 4 benchmark scenarios preserved for unit test verification
 */
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

/**
 * 18 Continuous Weekend Stress Scenarios spanning Friday 16:00 to Monday 09:30 EDT
 */
export const EXTENDED_WEEKEND_SCENARIOS: SimulationEventConfig[] = [
  // 1. Friday Post-Close (deltaHours = 1.5h) - Momentum Chase without SEC 8-K
  {
    event: {
      id: 'shock-aapl-friday-close-chase',
      timestamp: Date.UTC(2026, 9, 9, 21, 30, 0),
      headline: 'Apple after-hours retail chatter following product launch teaser',
      affectedSymbol: 'AAPL-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.75,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 9, 21, 30, 0),
    mondayOpenPrice: 229.90,
    baseSizeUsd: 10_000,
  },
  // 2. Friday Post-Close (deltaHours = 2.5h) - Unverified Earnings Leak
  {
    event: {
      id: 'shock-nvda-friday-earnings-rumor',
      timestamp: Date.UTC(2026, 9, 9, 22, 30, 0),
      headline: 'NVIDIA unverified discord leak claiming datacenter revenue outperformance',
      affectedSymbol: 'NVDA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.80,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 9, 22, 30, 0),
    mondayOpenPrice: 128.40,
    baseSizeUsd: 10_000,
  },
  // 3. Friday Night (deltaHours = 6.5h) - Liquidity Evaporation & Spread Blowout
  {
    event: {
      id: 'shock-amc-spread-cross',
      timestamp: Date.UTC(2026, 9, 10, 2, 30, 0),
      headline: 'AMC weekend meme speculation with bid-ask spread widened beyond 140 bps',
      affectedSymbol: 'AMC-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.85,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 10, 2, 30, 0),
    mondayOpenPrice: 4.15,
    baseSizeUsd: 10_000,
  },
  // 4. Saturday Dark (deltaHours = 12h) - Dark Hours Market Order on Grade D Asset
  {
    event: {
      id: 'shock-amc-dark-market-order',
      timestamp: Date.UTC(2026, 9, 10, 8, 0, 0),
      headline: 'Aggressive Saturday 04:00 AM market order sweep triggered by algorithmic bot',
      affectedSymbol: 'AMC-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.90,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 10, 8, 0, 0),
    mondayOpenPrice: 4.10,
    baseSizeUsd: 10_000,
  },
  // 5. Saturday Dark (deltaHours = 20h) - AMC Telegram Short Squeeze Churn Anomaly (Benchmark #1)
  {
    event: {
      id: 'shock-amc-saturday-wash',
      timestamp: Date.UTC(2026, 9, 10, 16, 0, 0),
      headline: 'AMC short squeeze rumours trending on Telegram, weekend token price surging',
      affectedSymbol: 'AMC-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.95,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 10, 16, 0, 0),
    mondayOpenPrice: 4.12,
    baseSizeUsd: 10_000,
  },
  // 6. Saturday Dark (deltaHours = 22h) - MSTR Token Desync vs Underlying Crypto
  {
    event: {
      id: 'shock-mstr-saturday-desync',
      timestamp: Date.UTC(2026, 9, 10, 18, 0, 0),
      headline: 'MicroStrategy synthetic token surges +9.2% while Bitcoin price remains flat',
      affectedSymbol: 'MSTR-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.88,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 10, 18, 0, 0),
    mondayOpenPrice: 192.30,
    baseSizeUsd: 10_000,
  },
  // 7. Saturday Dark (deltaHours = 24h) - TSLA Social Media Claim on Thin Book (Benchmark #3)
  {
    event: {
      id: 'shock-tsla-saturday-thin',
      timestamp: Date.UTC(2026, 9, 10, 20, 0, 0),
      headline: 'Tesla unverified social media claim of breakthrough battery density',
      affectedSymbol: 'TSLA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.80,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 10, 20, 0, 0),
    mondayOpenPrice: 244.20,
    baseSizeUsd: 10_000,
  },
  // 8. Saturday Dark (deltaHours = 26h) - Large Unhedged Weekend Position Attempt
  {
    event: {
      id: 'shock-mstr-weekend-overnight-whale',
      timestamp: Date.UTC(2026, 9, 10, 22, 0, 0),
      headline: 'Institutional algorithmic attempt to allocate $35,000 unhedged position in MSTR',
      affectedSymbol: 'MSTR-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.85,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 10, 22, 0, 0),
    mondayOpenPrice: 193.00,
    baseSizeUsd: 35_000, // Triggers Forbidden State #8 (> $25K in Saturday Dark)
  },
  // 9. Saturday Dark (deltaHours = 28h) - Negative Depth Order Sweep
  {
    event: {
      id: 'shock-tsla-depth-sweep',
      timestamp: Date.UTC(2026, 9, 11, 0, 0, 0),
      headline: 'Aggressive buy order exceeding 50% of available top-5 book depth',
      affectedSymbol: 'TSLA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.82,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 11, 0, 0, 0),
    mondayOpenPrice: 244.50,
    baseSizeUsd: 15_000,
  },
  // 10. Sunday Pre-Futures (deltaHours = 40h) - Supply Chain Geopolitical Rumor
  {
    event: {
      id: 'shock-aapl-sunday-geopolitical',
      timestamp: Date.UTC(2026, 9, 11, 12, 0, 0),
      headline: 'Unverified weekend rumor of Asian tech component supply chain bottleneck',
      affectedSymbol: 'AAPL-rToken',
      sentiment: 'BEARISH',
      rawUrgency: 0.70,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 11, 12, 0, 0),
    mondayOpenPrice: 230.10,
    baseSizeUsd: 10_000,
  },
  // 11. Sunday Pre-Futures (deltaHours = 46h) - Speculative Trade Before CME Futures Open
  {
    event: {
      id: 'shock-nvda-pre-futures-spec',
      timestamp: Date.UTC(2026, 9, 11, 18, 0, 0),
      headline: 'Speculative directional buying prior to Sunday 6:00 PM CME Globex reopening',
      affectedSymbol: 'NVDA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.78,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 11, 18, 0, 0),
    mondayOpenPrice: 128.30,
    baseSizeUsd: 10_000,
  },
  // 12. Sunday Futures Reopen (deltaHours = 50.5h) - CME Globex Index Futures Re-anchor
  {
    event: {
      id: 'shock-mstr-sunday-futures-rally',
      timestamp: Date.UTC(2026, 9, 11, 22, 30, 0),
      headline: 'CME Globex equity index futures open green (+1.2%), BTC climbs to $84K',
      affectedSymbol: 'MSTR-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.85,
      hasOfficialFiling: true,
    },
    referenceTime: Date.UTC(2026, 9, 11, 22, 30, 0),
    mondayOpenPrice: 199.50,
    baseSizeUsd: 10_000,
  },
  // 13. Sunday Futures Active (deltaHours = 51h) - Confirmed NVDA SEC 8-K (Benchmark #2)
  {
    event: {
      id: 'shock-nvda-sunday-futures',
      timestamp: Date.UTC(2026, 9, 11, 23, 0, 0),
      headline: 'NVIDIA files SEC 8-K confirming major sovereign AI infrastructure contract',
      affectedSymbol: 'NVDA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.85,
      hasOfficialFiling: true,
    },
    referenceTime: Date.UTC(2026, 9, 11, 23, 0, 0),
    mondayOpenPrice: 133.50,
    baseSizeUsd: 10_000,
  },
  // 14. Sunday Futures Active (deltaHours = 53h) - Tesla Regulatory Release with Asian Macro
  {
    event: {
      id: 'shock-tsla-sunday-futures-reopen',
      timestamp: Date.UTC(2026, 9, 12, 1, 0, 0),
      headline: 'Tesla verified quarterly production numbers released via official investor relations',
      affectedSymbol: 'TSLA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.82,
      hasOfficialFiling: true,
    },
    referenceTime: Date.UTC(2026, 9, 12, 1, 0, 0),
    mondayOpenPrice: 248.50,
    baseSizeUsd: 10_000,
  },
  // 15. Monday Pre-Market (deltaHours = 63h) - Apple European Regulatory Approval (Benchmark #4)
  {
    event: {
      id: 'shock-aapl-monday-premarket',
      timestamp: Date.UTC(2026, 9, 12, 11, 0, 0),
      headline: 'Apple regulatory approval in Europe for new hardware service architecture',
      affectedSymbol: 'AAPL-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.70,
      hasOfficialFiling: true,
    },
    referenceTime: Date.UTC(2026, 9, 12, 11, 0, 0),
    mondayOpenPrice: 232.00,
    baseSizeUsd: 10_000,
  },
  // 16. Monday Pre-Market (deltaHours = 64.5h) - Wall Street Institutional Upgrade
  {
    event: {
      id: 'shock-nvda-monday-premarket-rally',
      timestamp: Date.UTC(2026, 9, 12, 12, 30, 0),
      headline: 'Morgan Stanley raises NVIDIA price target to $155 citing enterprise demand',
      affectedSymbol: 'NVDA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.85,
      hasOfficialFiling: true,
    },
    referenceTime: Date.UTC(2026, 9, 12, 12, 30, 0),
    mondayOpenPrice: 131.20,
    baseSizeUsd: 10_000,
  },
  // 17. Monday Pre-Market (deltaHours = 65.3h) - 12-Minute Cash Opening Front-Run Trap
  {
    event: {
      id: 'shock-tsla-monday-frontrun',
      timestamp: Date.UTC(2026, 9, 12, 13, 18, 0),
      headline: 'Algorithmic market buy placed at 09:18 AM EDT, 12 minutes prior to NYSE opening cross',
      affectedSymbol: 'TSLA-rToken',
      sentiment: 'BULLISH',
      rawUrgency: 0.90,
      hasOfficialFiling: false,
    },
    referenceTime: Date.UTC(2026, 9, 12, 13, 18, 0),
    mondayOpenPrice: 244.10,
    baseSizeUsd: 10_000, // Triggers Forbidden State #10
  },
  // 18. Monday 09:30 AM Opening Cross (deltaHours = 65.5h) - Cash Market Discovery Reconciles
  {
    event: {
      id: 'shock-opening-cross-reconcile',
      timestamp: Date.UTC(2026, 9, 12, 13, 30, 0),
      headline: 'NYSE & NASDAQ Official Opening Cross executed; full weekend self-audit completed',
      affectedSymbol: 'AAPL-rToken',
      sentiment: 'NEUTRAL',
      rawUrgency: 0.60,
      hasOfficialFiling: true,
    },
    referenceTime: Date.UTC(2026, 9, 12, 13, 30, 0),
    mondayOpenPrice: 232.00,
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

  public async evaluateSingle(item: SimulationEventConfig): Promise<SimulationTradeComparison> {
    const hubDaybreak = new BitgetAgentHubClient({ paperTrading: true });
    const hubNaive = new BitgetAgentHubClient({ paperTrading: true });

    const daybreakAgent = new DaybreakAgent(this.mcp, this.signal, hubDaybreak);
    const naiveAgent = new NaiveAgent(this.mcp, hubNaive);

    const baseSize = item.baseSizeUsd ?? 10_000;

    const dbDecision = await daybreakAgent.processEvent(item.event, baseSize, item.referenceTime);
    const nvDecision = await naiveAgent.processEvent(item.event, baseSize, item.referenceTime);

    let dbPnl = 0;
    let dbSlippage = 0;
    const dbCapPreserved = dbDecision.mondayRiskProtectionUsd;

    if (dbDecision.action === 'REFUSE') {
      dbPnl = 0;
    } else {
      const priceReturn = (item.mondayOpenPrice - dbDecision.targetPrice) / dbDecision.targetPrice;
      const slippageCostUsd = dbDecision.sizeUsd * 0.0008;
      dbSlippage = 8;
      dbPnl = dbDecision.sizeUsd * priceReturn - slippageCostUsd;
    }

    const nvSlippageBps = (baseSize / 10000) * 12 + 15;
    const nvSlippageCostUsd = baseSize * (nvSlippageBps / 10000);
    const nvPriceReturn = (item.mondayOpenPrice - nvDecision.targetPrice) / nvDecision.targetPrice;
    const nvPnl = baseSize * nvPriceReturn - nvSlippageCostUsd;

    return {
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
    };
  }

  public async runSimulation(events: SimulationEventConfig[] = EXTENDED_WEEKEND_SCENARIOS): Promise<SimulationResult> {
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
      const dbCapPreserved = dbDecision.mondayRiskProtectionUsd;

      if (dbDecision.action === 'REFUSE') {
        daybreakRefused++;
        dbPnl = 0;
      } else {
        daybreakExecuted++;
        const priceReturn = (item.mondayOpenPrice - dbDecision.targetPrice) / dbDecision.targetPrice;
        const slippageCostUsd = dbDecision.sizeUsd * 0.0008;
        dbSlippage = 8;
        dbPnl = dbDecision.sizeUsd * priceReturn - slippageCostUsd;
      }

      // Compute PnL for Naive
      naiveExecuted++;
      const nvSlippageBps = (baseSize / 10000) * 12 + 15;
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

    const daybreakSummary = this.calculateSummary(
      'Daybreak Autonomous Agent',
      daybreakPnls,
      daybreakExecuted,
      daybreakRefused,
      comparisons.map((c) => c.daybreak.slippageBps),
      comparisons.reduce((acc, c) => acc + c.daybreak.capitalPreservedUsd, 0)
    );
    const naiveSummary = this.calculateSummary(
      'Naive Baseline Median Bot',
      naivePnls,
      naiveExecuted,
      naiveRefused,
      comparisons.map((c) => c.naive.slippageBps),
      0
    );

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
