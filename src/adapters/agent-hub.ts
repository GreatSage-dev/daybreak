export interface AgentHubConfig {
  paperTrading?: boolean;
  readOnly?: boolean;
  dailyQuotaUsd?: number;
}

export interface OrderSubmissionParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  sizeUsd: number;
  orderType: 'MARKET' | 'LIMIT' | 'PASSIVE_PEG';
  agentId: string;
  clientOrderId?: string;
  slippageLimitBps?: number;
}

export interface OrderExecutionResult {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'PASSIVE_PEG';
  filledPrice: number;
  filledSizeUsd: number;
  slippageBps: number;
  status: 'FILLED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  timestamp: number;
  isPaper: boolean;
}

export class BitgetAgentHubClient {
  public readonly isPaperTrading: boolean;
  public readonly isReadOnly: boolean;
  public readonly dailyQuotaUsd: number;
  private remainingQuotaUsd: number;
  private orderHistory: OrderExecutionResult[] = [];

  constructor(config: AgentHubConfig = {}) {
    this.isPaperTrading = config.paperTrading ?? true;
    this.isReadOnly = config.readOnly ?? false;
    this.dailyQuotaUsd = config.dailyQuotaUsd ?? 500_000;
    this.remainingQuotaUsd = this.dailyQuotaUsd;
  }

  public getRemainingQuota(): number {
    return this.remainingQuotaUsd;
  }

  public getOrderHistory(): OrderExecutionResult[] {
    return [...this.orderHistory];
  }

  public async submitOrder(params: OrderSubmissionParams): Promise<OrderExecutionResult> {
    const timestamp = Date.now();
    const orderId = params.clientOrderId ?? `ord-${timestamp}-${Math.floor(Math.random() * 10000)}`;

    // 1. Check Read-Only Mode
    if (this.isReadOnly) {
      const rejectedResult: OrderExecutionResult = {
        orderId,
        symbol: params.symbol,
        side: params.side,
        orderType: params.orderType,
        filledPrice: 0,
        filledSizeUsd: 0,
        slippageBps: 0,
        status: 'REJECTED',
        rejectionReason: 'Bitget Agent Hub is running in --read-only mode. All order submissions blocked.',
        timestamp,
        isPaper: this.isPaperTrading,
      };
      this.orderHistory.push(rejectedResult);
      return rejectedResult;
    }

    // 2. Check Quota
    if (params.sizeUsd > this.remainingQuotaUsd) {
      const rejectedResult: OrderExecutionResult = {
        orderId,
        symbol: params.symbol,
        side: params.side,
        orderType: params.orderType,
        filledPrice: 0,
        filledSizeUsd: 0,
        slippageBps: 0,
        status: 'REJECTED',
        rejectionReason: `Order size ($${params.sizeUsd.toFixed(2)}) exceeds remaining daily quota ($${this.remainingQuotaUsd.toFixed(2)}).`,
        timestamp,
        isPaper: this.isPaperTrading,
      };
      this.orderHistory.push(rejectedResult);
      return rejectedResult;
    }

    // 3. Execution Simulation (Paper Trading)
    // Slippage calculation:
    // Market orders incur full spread crossing + market impact
    // Passive peg orders incur 0 spread crossing, fills at bid/mid
    let slippageBps = 0;
    let filledPrice = params.price;

    if (params.orderType === 'MARKET') {
      // Slippage scales with order size
      slippageBps = Math.max(5, Math.min(250, (params.sizeUsd / 10000) * 12));
      const slippageMultiplier = params.side === 'BUY' ? 1 + slippageBps / 10000 : 1 - slippageBps / 10000;
      filledPrice = params.price * slippageMultiplier;
    } else if (params.orderType === 'PASSIVE_PEG') {
      // Passive maker order earns/incurs minimal negative slippage
      slippageBps = 0;
      filledPrice = params.price;
    }

    this.remainingQuotaUsd -= params.sizeUsd;

    const result: OrderExecutionResult = {
      orderId,
      symbol: params.symbol,
      side: params.side,
      orderType: params.orderType,
      filledPrice: Number(filledPrice.toFixed(4)),
      filledSizeUsd: params.sizeUsd,
      slippageBps: Number(slippageBps.toFixed(2)),
      status: 'FILLED',
      timestamp,
      isPaper: this.isPaperTrading,
    };

    this.orderHistory.push(result);
    return result;
  }

  public resetQuota(): void {
    this.remainingQuotaUsd = this.dailyQuotaUsd;
    this.orderHistory = [];
  }
}
