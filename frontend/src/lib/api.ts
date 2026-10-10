const API_BASE = '/api';

export interface TokenData {
  symbol: string;
  underlying: string;
  price: number;
  lastClose: number;
  volume24h: number;
  onChainFloat: number;
  bidAskSpreadBps: number;
  top5DepthUsd: number;
  isRToken: boolean;
  trustEvaluation: {
    grade: string;
    score: number;
    confidence: number;
    uncertaintyMargin: number;
    components: {
      temporalScore: number;
      washScore: number;
      depthScore: number;
      macroScore: number;
    };
    metrics: {
      volumeToFloat: number;
      spreadBps: number;
      top5DepthUsd: number;
      cmeFuturesActive: boolean;
    };
    phase: string;
    explanation: string;
  };
}

export interface TokensResponse {
  count: number;
  currentPhase: string;
  tokens: TokenData[];
}

export interface TrustCurvePoint {
  deltaHours: number;
  phase: string;
  cmeFuturesActive: boolean;
  baseTemporalScore: number;
  compositeTrustScore: number;
  trustGrade: string;
  depthScore: number;
  washScore: number;
}

export interface TrustCurveResponse {
  symbol: string;
  underlying: string;
  currentPrice: number;
  points: TrustCurvePoint[];
}

export interface AgentDecision {
  tradeId: string;
  timestamp: number;
  symbol: string;
  action: 'BUY' | 'SELL' | 'REFUSE' | 'PASSIVE_PEG';
  targetPrice: number;
  sizeUsd: number;
  originalSizeUsd: number;
  trustGrade: string;
  trustScore: number;
  reason: string;
  basisPointsSaved: number;
  mondayRiskProtectionUsd: number;
  refusalReceipt?: {
    receiptId: string;
    rejectionReason: string;
    estimatedMondayReversionBps: number;
    estimatedCapitalPreservedUsd: number;
    triggeredForbiddenState: string;
  };
}

export interface SimulationComparison {
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

export interface PerformanceSummary {
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
  comparisons: SimulationComparison[];
  daybreakSummary: PerformanceSummary;
  naiveSummary: PerformanceSummary;
  alphaAdvantageUsd: number;
  totalBasisPointsSaved: number;
}

export interface PaperLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  agent: string;
  symbol: string;
  payload: Record<string, unknown>;
  voteOutcome?: string;
  metrics?: {
    trustScore: number;
    grade: string;
    pnlDeltaUsd?: number;
  };
}

export interface PaperLogResponse {
  count: number;
  logs: PaperLogEntry[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  engine: string;
}

export interface SystemStatusResponse {
  status: string;
  marketDataFeed: string;
  testnetStatus: {
    isConfigured: boolean;
    mode: string;
    endpoint: string;
  };
  currentPhase: string;
  phaseDescription: string;
  cmeFuturesActive: boolean;
  baseTemporalScore: number;
  liveBenchmarks: {
    btcUsd: number;
    ethUsd: number;
    tokenQuotes: Array<{
      symbol: string;
      underlying: string;
      price: number;
      lastClose: number;
      changePct: number;
    }>;
  };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthResponse>('/health'),
  systemStatus: () => request<SystemStatusResponse>('/system-status'),
  tokens: () => request<TokensResponse>('/tokens'),
  trustCurve: (symbol: string) => request<TrustCurveResponse>(`/trust-curve/${symbol}`),
  simulate: () => request<SimulationResult>('/simulate', { method: 'POST' }),
  paperLog: () => request<PaperLogResponse>('/paper-log'),
};

