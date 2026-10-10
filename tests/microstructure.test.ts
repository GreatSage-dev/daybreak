import { describe, it, expect } from 'vitest';
import { evaluateMicrostructure } from '../src/engine/microstructure.js';
import { calculateTrust } from '../src/engine/trust-calculator.js';
import { FIXTURE_TOKENS } from '../src/adapters/bitget-mcp.js';

describe('Microstructure Engine & Wash Detection', () => {
  it('penalizes AMC wash trading trap down to Grade F (< 0.20)', () => {
    const amcToken = FIXTURE_TOKENS['AMC-rToken'];
    expect(amcToken).toBeDefined();

    // Evaluate Saturday dark hours
    const satTimestamp = Date.UTC(2026, 9, 10, 16, 0, 0); // Saturday 12:00 EDT
    const evalResult = calculateTrust(amcToken, {
      referenceTime: satTimestamp,
      hasOfficialFiling: false,
    });

    // Churn ratio should be > 5.0x
    expect(evalResult.metrics.volumeToFloat).toBeGreaterThan(5.0);
    // Wash score must be severely discounted (< 0.05)
    expect(evalResult.components.washScore).toBeLessThanOrEqual(0.05);
    // Composite trust score must fall into Grade F (< 0.20)
    expect(evalResult.score).toBeLessThan(0.20);
    expect(evalResult.grade).toBe('F');
  });

  it('maintains Grade A or B for healthy, liquid institutional tokens (NVDA, AAPL)', () => {
    const nvdaToken = FIXTURE_TOKENS['NVDA-rToken'];
    const aaplToken = FIXTURE_TOKENS['AAPL-rToken'];

    // During regular hours
    const regTimestamp = Date.UTC(2026, 9, 13, 18, 0, 0); // Tuesday regular session
    const nvdaEvalReg = calculateTrust(nvdaToken, { referenceTime: regTimestamp });
    expect(nvdaEvalReg.grade).toBe('A');
    expect(nvdaEvalReg.score).toBeGreaterThanOrEqual(0.80);

    // During Sunday Futures Reopen (institutional discovery active)
    const sunFuturesTimestamp = Date.UTC(2026, 9, 11, 23, 0, 0); // Sunday 19:00 EDT
    const aaplEvalSun = calculateTrust(aaplToken, {
      referenceTime: sunFuturesTimestamp,
      macro: { cmeGlobexOpen: true, esFuturesPrice: 5820, nqFuturesPrice: 20550 },
    });
    expect(['A', 'B']).toContain(aaplEvalSun.grade);
    expect(aaplEvalSun.score).toBeGreaterThanOrEqual(0.65);
  });

  it('preserves wash score when high turnover is backed by official SEC 8-K filing', () => {
    const token = { ...FIXTURE_TOKENS['AMC-rToken'], official8KFiled: true };
    const satTimestamp = Date.UTC(2026, 9, 10, 16, 0, 0);

    const microWithoutFiling = evaluateMicrostructure(token, undefined, false);
    const microWithFiling = evaluateMicrostructure(token, undefined, true);

    expect(microWithoutFiling.washScore).toBeLessThanOrEqual(0.05);
    expect(microWithFiling.washScore).toBeGreaterThanOrEqual(0.40);
  });

  it('penalizes wide spreads on shallow books via Spread-to-Depth ratio', () => {
    // Liquid deep book: 5 bps spread, $300k depth
    const liquidToken = {
      ...FIXTURE_TOKENS['AAPL-rToken'],
      bidAskSpreadBps: 5,
      top5DepthUsd: 300_000,
    };
    const liquidMicro = evaluateMicrostructure(liquidToken);

    // Illiquid thin book: 200 bps spread, $2k depth
    const thinToken = {
      ...FIXTURE_TOKENS['AAPL-rToken'],
      bidAskSpreadBps: 200,
      top5DepthUsd: 2_000,
    };
    const thinMicro = evaluateMicrostructure(thinToken);

    expect(liquidMicro.depthScore).toBeGreaterThan(0.95);
    expect(thinMicro.depthScore).toBeLessThan(0.20);
    expect(thinMicro.spreadDepthRatio).toBeGreaterThan(liquidMicro.spreadDepthRatio * 10);
  });
});
