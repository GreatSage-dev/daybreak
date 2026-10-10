export type MarketPhase =
  | 'REGULAR_HOURS'
  | 'FRIDAY_POST_CLOSE'
  | 'SATURDAY_DARK'
  | 'SUNDAY_PRE_FUTURES'
  | 'SUNDAY_FUTURES_OPEN'
  | 'MONDAY_PRE_MARKET';

export type TrustGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface TrustComponents {
  temporalScore: number;
  washScore: number;
  depthScore: number;
  macroScore: number;
}

export interface TrustMetrics {
  volumeToFloat: number;
  spreadBps: number;
  top5DepthUsd: number;
  cmeFuturesActive: boolean;
}

export interface TrustEvaluation {
  grade: TrustGrade;
  score: number;
  confidence: number;
  uncertaintyMargin: number;
  components: TrustComponents;
  metrics: TrustMetrics;
  phase: MarketPhase;
  explanation: string;
}

export interface TokenMarketData {
  symbol: string;
  underlying: string;
  price: number;
  lastClose: number;
  volume24h: number;
  onChainFloat: number;
  bidAskSpreadBps: number;
  top5DepthUsd: number;
  isRToken: boolean;
  timestamp: number;
  official8KFiled?: boolean;
}

export interface TradeEvent {
  id: string;
  timestamp: number;
  headline: string;
  affectedSymbol: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  rawUrgency: number; // 0.0 - 1.0
  estimatedImpactBps?: number;
  hasOfficialFiling?: boolean;
}

export enum ForbiddenState {
  FORBIDDEN_DARK_MARKET_ORDER = 'FORBIDDEN_DARK_MARKET_ORDER',
  FORBIDDEN_EXCESSIVE_CHURN_BUY = 'FORBIDDEN_EXCESSIVE_CHURN_BUY',
  FORBIDDEN_NEGATIVE_DEPTH_EXECUTION = 'FORBIDDEN_NEGATIVE_DEPTH_EXECUTION',
  FORBIDDEN_WIDE_SPREAD_CROSS = 'FORBIDDEN_WIDE_SPREAD_CROSS',
  FORBIDDEN_PRE_FUTURES_SPECULATION = 'FORBIDDEN_PRE_FUTURES_SPECULATION',
  FORBIDDEN_ORACLE_DESYNC_ARBITRAGE = 'FORBIDDEN_ORACLE_DESYNC_ARBITRAGE',
  FORBIDDEN_ZERO_TRUST_SIZING = 'FORBIDDEN_ZERO_TRUST_SIZING',
  FORBIDDEN_UNHEDGED_WEEKEND_OVERNIGHT = 'FORBIDDEN_UNHEDGED_WEEKEND_OVERNIGHT',
  FORBIDDEN_POST_CLOSE_MOMENTUM_CHASE = 'FORBIDDEN_POST_CLOSE_MOMENTUM_CHASE',
  FORBIDDEN_MONDAY_OPEN_FRONT_RUN = 'FORBIDDEN_MONDAY_OPEN_FRONT_RUN',
}

export interface RefusalReceipt {
  receiptId: string;
  timestamp: number;
  symbol: string;
  attemptedAction: 'BUY' | 'SELL';
  attemptedSizeUsd: number;
  trustGrade: TrustGrade;
  trustScore: number;
  triggeredForbiddenState: ForbiddenState | null;
  rejectionReason: string;
  estimatedMondayReversionBps: number;
  estimatedCapitalPreservedUsd: number;
}

export interface AgentDecision {
  tradeId: string;
  timestamp: number;
  symbol: string;
  action: 'BUY' | 'SELL' | 'REFUSE' | 'PASSIVE_PEG';
  targetPrice: number;
  sizeUsd: number;
  originalSizeUsd: number;
  trustGrade: TrustGrade;
  trustScore: number;
  reason: string;
  basisPointsSaved: number;
  mondayRiskProtectionUsd: number;
  refusalReceipt?: RefusalReceipt;
  forbiddenStateDetected?: ForbiddenState;
}

export interface PolicyGateResult {
  allowed: boolean;
  action: 'EXECUTE' | 'REFUSE' | 'PASSIVE_PEG';
  adjustedSizeUsd: number;
  basisPointsSaved: number;
  mondayRiskProtectionUsd: number;
  triggeredForbiddenState?: ForbiddenState;
  reason: string;
  refusalReceipt?: RefusalReceipt;
}

export interface PaperLogEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'ORDER_INTENT'
    | 'POLICY_GATE_CHECK'
    | 'TRADE_EXECUTED'
    | 'TRADE_REFUSED'
    | 'AUDIT_VERIFICATION'
    | 'MCP_DISPATCH';
  agent: 'DAYBREAK_AGENT' | 'NAIVE_AGENT';
  symbol: string;
  payload: Record<string, unknown>;
  voteOutcome?: 'PASSED' | 'REJECTED' | 'SCALED';
  metrics?: {
    trustScore: number;
    grade: TrustGrade;
    pnlDeltaUsd?: number;
    slippagePaidBps?: number;
  };
}

export interface MacroIndicator {
  cmeGlobexOpen: boolean;
  esFuturesPrice: number;
  nqFuturesPrice: number;
  btcUsdCorrelation: number;
  vixWeekendImplied: number;
}

export interface OpeningCrossAudit {
  symbol: string;
  weekendPricePredicted: number;
  mondayOpeningPrice: number;
  reversionErrorBps: number;
  predictedTrustGrade: TrustGrade;
  predictedTrustScore: number;
  accuracyScore: number;
  capitalPreservedUsd: number;
  status: 'VERIFIED_ACCURATE' | 'MODERATE_DIVERGENCE' | 'ANOMALOUS_GAP';
}
