import { describe, it, expect } from 'vitest';
import { DaybreakPolicyGate } from '../src/agent/policy-gate.js';
import { ForbiddenState, TokenMarketData, TrustEvaluation } from '../src/types/index.js';

describe('Policy Gate - 10 Forbidden States Invariance', () => {
  const gate = new DaybreakPolicyGate();

  const mockToken: TokenMarketData = {
    symbol: 'NVDA-rToken',
    underlying: 'NVDA',
    price: 128.50,
    lastClose: 128.50,
    volume24h: 10_000_000,
    onChainFloat: 10_000_000,
    bidAskSpreadBps: 8,
    top5DepthUsd: 100_000,
    isRToken: true,
    timestamp: Date.now(),
    official8KFiled: false,
  };

  const baseEval: TrustEvaluation = {
    grade: 'B',
    score: 0.72,
    confidence: 0.90,
    uncertaintyMargin: 0.04,
    components: {
      temporalScore: 0.70,
      washScore: 0.85,
      depthScore: 0.80,
      macroScore: 0.75,
    },
    metrics: {
      volumeToFloat: 0.08,
      spreadBps: 8,
      top5DepthUsd: 100_000,
      cmeFuturesActive: true,
    },
    phase: 'SUNDAY_FUTURES_OPEN',
    explanation: 'Test eval',
  };

  it('State 1: enforces FORBIDDEN_ZERO_TRUST_SIZING when Grade is F', () => {
    const fEval: TrustEvaluation = { ...baseEval, grade: 'F', score: 0.22 };
    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 5_000,
      orderType: 'MARKET',
      marketData: mockToken,
      evaluation: fEval,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_ZERO_TRUST_SIZING);
    expect(res.adjustedSizeUsd).toBe(0);
  });

  it('State 2: enforces FORBIDDEN_EXCESSIVE_CHURN_BUY on churn > 5.0 without 8-K', () => {
    const washEval: TrustEvaluation = {
      ...baseEval,
      score: 0.55,
      grade: 'C',
      metrics: { ...baseEval.metrics, volumeToFloat: 6.5 },
    };

    const res = gate.evaluate({
      symbol: 'AMC-rToken',
      side: 'BUY',
      baseSizeUsd: 5_000,
      orderType: 'LIMIT',
      marketData: mockToken,
      evaluation: washEval,
      hasOfficialFiling: false,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_EXCESSIVE_CHURN_BUY);
  });

  it('State 3: enforces FORBIDDEN_DARK_MARKET_ORDER in Saturday dark under Grade D', () => {
    const darkEval: TrustEvaluation = {
      ...baseEval,
      phase: 'SATURDAY_DARK',
      grade: 'D',
      score: 0.38,
    };

    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 5_000,
      orderType: 'MARKET',
      marketData: mockToken,
      evaluation: darkEval,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_DARK_MARKET_ORDER);
  });

  it('State 4: enforces FORBIDDEN_NEGATIVE_DEPTH_EXECUTION when size > 50% book depth', () => {
    const thinToken = { ...mockToken, top5DepthUsd: 10_000 };
    const thinEval = { ...baseEval, metrics: { ...baseEval.metrics, top5DepthUsd: 10_000 } };

    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 6_000, // 60% of $10,000 top-5 depth
      orderType: 'LIMIT',
      marketData: thinToken,
      evaluation: thinEval,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_NEGATIVE_DEPTH_EXECUTION);
  });

  it('State 5: enforces FORBIDDEN_WIDE_SPREAD_CROSS when spread > 100 bps', () => {
    const wideSpreadEval = {
      ...baseEval,
      metrics: { ...baseEval.metrics, spreadBps: 125 },
    };

    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 2_000,
      orderType: 'MARKET',
      marketData: mockToken,
      evaluation: wideSpreadEval,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_WIDE_SPREAD_CROSS);
  });

  it('State 6: enforces FORBIDDEN_ORACLE_DESYNC_ARBITRAGE when price diverges > 8%', () => {
    const desyncToken: TokenMarketData = {
      ...mockToken,
      price: 150.00,
      lastClose: 128.50, // +16.7% deviation
    };

    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 2_000,
      orderType: 'LIMIT',
      marketData: desyncToken,
      evaluation: baseEval,
      hasOfficialFiling: false,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_ORACLE_DESYNC_ARBITRAGE);
  });

  it('State 7: enforces FORBIDDEN_PRE_FUTURES_SPECULATION when macroScore < 0.40', () => {
    const preFuturesEval: TrustEvaluation = {
      ...baseEval,
      phase: 'SUNDAY_PRE_FUTURES',
      score: 0.52,
      components: { ...baseEval.components, macroScore: 0.28 },
    };

    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 2_000,
      orderType: 'LIMIT',
      marketData: mockToken,
      evaluation: preFuturesEval,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_PRE_FUTURES_SPECULATION);
  });

  it('State 8: enforces FORBIDDEN_UNHEDGED_WEEKEND_OVERNIGHT for order > $25k in Saturday dark', () => {
    const satEval: TrustEvaluation = {
      ...baseEval,
      phase: 'SATURDAY_DARK',
      score: 0.50,
      grade: 'C',
    };

    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 35_000, // exceeds $25k cap
      orderType: 'LIMIT',
      marketData: mockToken,
      evaluation: satEval,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_UNHEDGED_WEEKEND_OVERNIGHT);
  });

  it('State 9: enforces FORBIDDEN_POST_CLOSE_MOMENTUM_CHASE after deltaHours > 3.0 without 8-K', () => {
    const friEval: TrustEvaluation = {
      ...baseEval,
      phase: 'FRIDAY_POST_CLOSE',
    };

    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 5_000,
      orderType: 'MARKET',
      marketData: mockToken,
      evaluation: friEval,
      deltaHours: 3.5,
      hasOfficialFiling: false,
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_POST_CLOSE_MOMENTUM_CHASE);
  });

  it('State 10: enforces FORBIDDEN_MONDAY_OPEN_FRONT_RUN within 15 mins of cash open', () => {
    const monEval: TrustEvaluation = {
      ...baseEval,
      phase: 'MONDAY_PRE_MARKET',
    };

    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 5_000,
      orderType: 'MARKET',
      marketData: mockToken,
      evaluation: monEval,
      deltaHours: 65.35, // deltaHours >= 65.25 is within 15 min of 65.5h (9:30 AM)
    });

    expect(res.allowed).toBe(false);
    expect(res.triggeredForbiddenState).toBe(ForbiddenState.FORBIDDEN_MONDAY_OPEN_FRONT_RUN);
  });

  it('applies quadratic sizing rule: Position Size = BaseSize * (TrustScore)^2', () => {
    // Score = 0.80 -> (0.8)^2 = 0.64 -> $10,000 * 0.64 = $6,400
    const evalHigh: TrustEvaluation = { ...baseEval, score: 0.80, grade: 'A' };
    const res = gate.evaluate({
      symbol: 'NVDA-rToken',
      side: 'BUY',
      baseSizeUsd: 10_000,
      orderType: 'LIMIT',
      marketData: mockToken,
      evaluation: evalHigh,
    });

    expect(res.allowed).toBe(true);
    expect(res.adjustedSizeUsd).toBe(6400);
  });
});
