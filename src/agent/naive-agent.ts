import { AgentDecision, PaperLogEntry, TradeEvent } from '../types/index.js';
import { BitgetMcpAdapter } from '../adapters/bitget-mcp.js';
import { BitgetAgentHubClient } from '../adapters/agent-hub.js';

export class NaiveAgent {
  private mcp: BitgetMcpAdapter;
  private hub: BitgetAgentHubClient;
  private paperLogs: PaperLogEntry[] = [];

  constructor(mcp: BitgetMcpAdapter, hub: BitgetAgentHubClient) {
    this.mcp = mcp;
    this.hub = hub;
  }

  public getPaperLogs(): PaperLogEntry[] {
    return [...this.paperLogs];
  }

  public clearPaperLogs(): void {
    this.paperLogs = [];
  }

  public async processEvent(
    event: TradeEvent,
    baseSizeUsd = 10_000,
    referenceTime?: Date | number
  ): Promise<AgentDecision> {
    const timestamp = typeof referenceTime === 'number'
      ? referenceTime
      : referenceTime instanceof Date
      ? referenceTime.getTime()
      : event.timestamp || Date.now();

    const marketData = await this.mcp.getToken(event.affectedSymbol);
    if (!marketData) {
      throw new Error(`Symbol ${event.affectedSymbol} not found in Bitget MCP registry.`);
    }

    const side = event.sentiment === 'BEARISH' ? 'SELL' : 'BUY';

    // Naive Bot blindly executes 100% of base size via MARKET order crossing spread
    const execution = await this.hub.submitOrder({
      symbol: marketData.symbol,
      side,
      price: marketData.price,
      sizeUsd: baseSizeUsd,
      orderType: 'MARKET',
      agentId: 'naive-median-bot',
      clientOrderId: `naive-${event.id}`,
    });

    const decision: AgentDecision = {
      tradeId: event.id,
      timestamp,
      symbol: marketData.symbol,
      action: side,
      targetPrice: execution.filledPrice,
      sizeUsd: baseSizeUsd,
      originalSizeUsd: baseSizeUsd,
      trustGrade: 'F', // Unevaluated by naive bot
      trustScore: 0.15,
      reason: 'Naive Bot executed unconstrained market order immediately upon headline arrival.',
      basisPointsSaved: 0,
      mondayRiskProtectionUsd: 0,
    };

    this.paperLogs.push({
      id: `log-naive-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(timestamp).toISOString(),
      eventType: 'TRADE_EXECUTED',
      agent: 'NAIVE_AGENT',
      symbol: marketData.symbol,
      payload: {
        orderId: execution.orderId,
        filledPrice: execution.filledPrice,
        filledSizeUsd: execution.filledSizeUsd,
        slippageBps: execution.slippageBps,
        reason: 'Blind execution on headline without trust evaluation.',
      },
      voteOutcome: 'PASSED',
      metrics: {
        trustScore: 0.15,
        grade: 'F',
        slippagePaidBps: execution.slippageBps,
      },
    });

    return decision;
  }
}
