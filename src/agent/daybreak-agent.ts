import {
  AgentDecision,
  PaperLogEntry,
  TradeEvent,
} from '../types/index.js';
import { calculateTrust } from '../engine/trust-calculator.js';
import { evaluateTemporalCurve } from '../engine/temporal-curve.js';
import { DaybreakPolicyGate } from './policy-gate.js';
import { BitgetMcpAdapter } from '../adapters/bitget-mcp.js';
import { BitgetSignalAdapter } from '../adapters/bitget-signal.js';
import { BitgetAgentHubClient } from '../adapters/agent-hub.js';

export class DaybreakAgent {
  private mcp: BitgetMcpAdapter;
  private signal: BitgetSignalAdapter;
  private hub: BitgetAgentHubClient;
  private policyGate: DaybreakPolicyGate;
  private paperLogs: PaperLogEntry[] = [];

  constructor(
    mcp: BitgetMcpAdapter,
    signal: BitgetSignalAdapter,
    hub: BitgetAgentHubClient,
    policyGate?: DaybreakPolicyGate
  ) {
    this.mcp = mcp;
    this.signal = signal;
    this.hub = hub;
    this.policyGate = policyGate ?? new DaybreakPolicyGate();
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

    // 1. Fetch token market data
    const marketData = await this.mcp.getToken(event.affectedSymbol);
    if (!marketData) {
      throw new Error(`Symbol ${event.affectedSymbol} not found in Bitget MCP registry.`);
    }

    // 2. Fetch Macro & Sentiment research signals
    const temporal = evaluateTemporalCurve(timestamp);
    const macro = await this.signal.getMacroAnalysis(temporal.cmeFuturesActive);
    const sentiment = await this.signal.analyzeSentiment(event);

    // 3. Compute Composite Trust
    const evaluation = calculateTrust(marketData, {
      referenceTime: timestamp,
      macro,
      hasOfficialFiling: sentiment.hasOfficialFiling,
    });

    const side = event.sentiment === 'BEARISH' ? 'SELL' : 'BUY';

    // Log ORDER_INTENT
    this.paperLogs.push({
      id: `log-intent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(timestamp).toISOString(),
      eventType: 'ORDER_INTENT',
      agent: 'DAYBREAK_AGENT',
      symbol: marketData.symbol,
      payload: {
        headline: event.headline,
        intendedSide: side,
        baseSizeUsd,
        sentiment: sentiment.sentiment,
        hasOfficialFiling: sentiment.hasOfficialFiling,
        phase: evaluation.phase,
      },
    });

    // 4. Pass through Policy Gate
    const gateResult = this.policyGate.evaluate({
      symbol: marketData.symbol,
      side,
      baseSizeUsd,
      orderType: 'MARKET',
      marketData,
      evaluation,
      hasOfficialFiling: sentiment.hasOfficialFiling,
      deltaHours: temporal.deltaHours,
    });

    // Log POLICY_GATE_CHECK
    this.paperLogs.push({
      id: `log-gate-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(timestamp).toISOString(),
      eventType: 'POLICY_GATE_CHECK',
      agent: 'DAYBREAK_AGENT',
      symbol: marketData.symbol,
      payload: {
        allowed: gateResult.allowed,
        action: gateResult.action,
        adjustedSizeUsd: gateResult.adjustedSizeUsd,
        triggeredForbiddenState: gateResult.triggeredForbiddenState,
        reason: gateResult.reason,
      },
      voteOutcome: gateResult.allowed ? (gateResult.adjustedSizeUsd < baseSizeUsd ? 'SCALED' : 'PASSED') : 'REJECTED',
      metrics: {
        trustScore: evaluation.score,
        grade: evaluation.grade,
      },
    });

    if (!gateResult.allowed || gateResult.action === 'REFUSE') {
      // Trade REFUSED
      const decision: AgentDecision = {
        tradeId: event.id,
        timestamp,
        symbol: marketData.symbol,
        action: 'REFUSE',
        targetPrice: marketData.price,
        sizeUsd: 0,
        originalSizeUsd: baseSizeUsd,
        trustGrade: evaluation.grade,
        trustScore: evaluation.score,
        reason: gateResult.reason,
        basisPointsSaved: gateResult.basisPointsSaved,
        mondayRiskProtectionUsd: gateResult.mondayRiskProtectionUsd,
        refusalReceipt: gateResult.refusalReceipt,
        forbiddenStateDetected: gateResult.triggeredForbiddenState,
      };

      this.paperLogs.push({
        id: `log-refused-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(timestamp).toISOString(),
        eventType: 'TRADE_REFUSED',
        agent: 'DAYBREAK_AGENT',
        symbol: marketData.symbol,
        payload: {
          decision,
          receipt: gateResult.refusalReceipt,
        },
        voteOutcome: 'REJECTED',
        metrics: {
          trustScore: evaluation.score,
          grade: evaluation.grade,
          pnlDeltaUsd: 0,
        },
      });

      return decision;
    }

    // Trade APPROVED or CONVERTED TO PASSIVE PEG
    const orderType = gateResult.action === 'PASSIVE_PEG' ? 'PASSIVE_PEG' : 'MARKET';
    const execution = await this.hub.submitOrder({
      symbol: marketData.symbol,
      side,
      price: marketData.price,
      sizeUsd: gateResult.adjustedSizeUsd,
      orderType,
      agentId: 'daybreak-autonomous-v1',
      clientOrderId: `db-${event.id}`,
    });

    const decision: AgentDecision = {
      tradeId: event.id,
      timestamp,
      symbol: marketData.symbol,
      action: orderType === 'PASSIVE_PEG' ? 'PASSIVE_PEG' : side,
      targetPrice: execution.filledPrice,
      sizeUsd: gateResult.adjustedSizeUsd,
      originalSizeUsd: baseSizeUsd,
      trustGrade: evaluation.grade,
      trustScore: evaluation.score,
      reason: gateResult.reason,
      basisPointsSaved: gateResult.basisPointsSaved,
      mondayRiskProtectionUsd: gateResult.mondayRiskProtectionUsd,
    };

    this.paperLogs.push({
      id: `log-exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(timestamp).toISOString(),
      eventType: 'TRADE_EXECUTED',
      agent: 'DAYBREAK_AGENT',
      symbol: marketData.symbol,
      payload: {
        orderId: execution.orderId,
        filledPrice: execution.filledPrice,
        filledSizeUsd: execution.filledSizeUsd,
        slippageBps: execution.slippageBps,
        orderType: execution.orderType,
      },
      voteOutcome: 'PASSED',
      metrics: {
        trustScore: evaluation.score,
        grade: evaluation.grade,
        slippagePaidBps: execution.slippageBps,
      },
    });

    return decision;
  }
}
