import { TokenMarketData } from '../types/index.js';

export interface BitgetMcpConfig {
  endpoint?: string;
  forceOfflineFixtures?: boolean;
  timeoutMs?: number;
}

export const FIXTURE_TOKENS: Record<string, TokenMarketData> = {
  'NVDA-rToken': {
    symbol: 'NVDA-rToken',
    underlying: 'NVDA',
    price: 128.50,
    lastClose: 128.20,
    volume24h: 45_000_000,
    onChainFloat: 10_000_000, // Float USD = $1.285B -> churn = 0.035
    bidAskSpreadBps: 8,
    top5DepthUsd: 320_000,
    isRToken: true,
    timestamp: Date.now(),
    official8KFiled: false,
  },
  'TSLA-rToken': {
    symbol: 'TSLA-rToken',
    underlying: 'TSLA',
    price: 245.80,
    lastClose: 244.50,
    volume24h: 35_000_000,
    onChainFloat: 8_000_000, // Float USD = $1.96B -> churn = 0.018
    bidAskSpreadBps: 12,
    top5DepthUsd: 240_000,
    isRToken: true,
    timestamp: Date.now(),
    official8KFiled: false,
  },
  'AAPL-rToken': {
    symbol: 'AAPL-rToken',
    underlying: 'AAPL',
    price: 230.15,
    lastClose: 229.80,
    volume24h: 28_000_000,
    onChainFloat: 15_000_000, // Float USD = $3.45B -> churn = 0.008
    bidAskSpreadBps: 5,
    top5DepthUsd: 450_000,
    isRToken: true,
    timestamp: Date.now(),
    official8KFiled: false,
  },
  'AMC-rToken': {
    symbol: 'AMC-rToken',
    underlying: 'AMC',
    price: 4.85,
    lastClose: 4.10, // +18.3% weekend distortion
    volume24h: 62_000_000,
    onChainFloat: 1_200_000, // Float USD = $5.82M -> churn = 10.65x! Wash trap!
    bidAskSpreadBps: 140,
    top5DepthUsd: 12_500,
    isRToken: true,
    timestamp: Date.now(),
    official8KFiled: false,
  },
  'MSTR-rToken': {
    symbol: 'MSTR-rToken',
    underlying: 'MSTR',
    price: 195.40,
    lastClose: 192.00,
    volume24h: 22_000_000,
    onChainFloat: 2_500_000, // Float USD = $488.5M -> churn = 0.045
    bidAskSpreadBps: 25,
    top5DepthUsd: 95_000,
    isRToken: true,
    timestamp: Date.now(),
    official8KFiled: false,
  },
};

export class BitgetMcpAdapter {
  private endpoint: string;
  private forceOffline: boolean;
  private timeoutMs: number;
  private tokenStore: Map<string, TokenMarketData>;

  constructor(config: BitgetMcpConfig = {}) {
    this.endpoint = config.endpoint ?? 'https://agent.bitget.com/mcp';
    this.forceOffline = config.forceOfflineFixtures ?? true;
    this.timeoutMs = config.timeoutMs ?? 3000;
    this.tokenStore = new Map(Object.entries(FIXTURE_TOKENS));
  }

  public async getTokens(): Promise<TokenMarketData[]> {
    if (this.forceOffline) {
      return Array.from(this.tokenStore.values());
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(`${this.endpoint}/v1/r-tokens`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(id);

      if (res.ok) {
        const data = (await res.json()) as TokenMarketData[];
        for (const token of data) {
          this.tokenStore.set(token.symbol, token);
        }
        return data;
      }
    } catch {
      // Fallback gracefully to offline fixtures
    }

    return Array.from(this.tokenStore.values());
  }

  public async getToken(symbol: string): Promise<TokenMarketData | null> {
    const tokens = await this.getTokens();
    const token = tokens.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
    return token ?? null;
  }

  public setMockTokenData(symbol: string, patch: Partial<TokenMarketData>): void {
    const existing = this.tokenStore.get(symbol);
    if (existing) {
      this.tokenStore.set(symbol, { ...existing, ...patch });
    } else {
      const created: TokenMarketData = {
        symbol,
        underlying: symbol.replace('-rToken', ''),
        price: 100,
        lastClose: 100,
        volume24h: 1_000_000,
        onChainFloat: 1_000_000,
        bidAskSpreadBps: 10,
        top5DepthUsd: 100_000,
        isRToken: true,
        timestamp: Date.now(),
        ...patch,
      };
      this.tokenStore.set(symbol, created);
    }
  }

  public resetFixtures(): void {
    this.tokenStore = new Map(Object.entries(FIXTURE_TOKENS));
  }
}
