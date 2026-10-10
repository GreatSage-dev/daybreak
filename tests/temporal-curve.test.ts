import { describe, it, expect } from 'vitest';
import { calculatePhaseFromDeltaHours, evaluateTemporalCurve } from '../src/engine/temporal-curve.js';

describe('Temporal Decay Curve Engine', () => {
  it('correctly maps delta hours across all 6 market phases', () => {
    // 1. Friday post-close (0-4h)
    const friPost = calculatePhaseFromDeltaHours(2.5);
    expect(friPost.phase).toBe('FRIDAY_POST_CLOSE');
    expect(friPost.baseTemporalScore).toBe(0.85);
    expect(friPost.cmeFuturesActive).toBe(false);

    // 2. Saturday dark (4-26h)
    const satDark = calculatePhaseFromDeltaHours(12.0);
    expect(satDark.phase).toBe('SATURDAY_DARK');
    expect(satDark.baseTemporalScore).toBe(0.15);
    expect(satDark.cmeFuturesActive).toBe(false);

    // 3. Sunday pre-futures (26-50h)
    const sunPre = calculatePhaseFromDeltaHours(38.0);
    expect(sunPre.phase).toBe('SUNDAY_PRE_FUTURES');
    expect(sunPre.baseTemporalScore).toBe(0.25);
    expect(sunPre.cmeFuturesActive).toBe(false);

    // 4. Sunday futures reopen (50-60h)
    const sunFutures = calculatePhaseFromDeltaHours(54.0);
    expect(sunFutures.phase).toBe('SUNDAY_FUTURES_OPEN');
    expect(sunFutures.baseTemporalScore).toBe(0.65);
    expect(sunFutures.cmeFuturesActive).toBe(true);

    // 5. Monday pre-market (60-65.5h)
    const monPre = calculatePhaseFromDeltaHours(62.5);
    expect(monPre.phase).toBe('MONDAY_PRE_MARKET');
    expect(monPre.baseTemporalScore).toBe(0.85);
    expect(monPre.cmeFuturesActive).toBe(true);

    // 6. Regular trading hours (<0 or >= 65.5h)
    const regular = calculatePhaseFromDeltaHours(66.0);
    expect(regular.phase).toBe('REGULAR_HOURS');
    expect(regular.baseTemporalScore).toBe(1.00);
    expect(regular.cmeFuturesActive).toBe(false);
  });

  it('evaluates real-world calendar timestamps to exact phase', () => {
    // Saturday 2026-10-10 16:00:00 UTC = 12:00 EDT (Saturday dark)
    const satTimestamp = Date.UTC(2026, 9, 10, 16, 0, 0);
    const satEval = evaluateTemporalCurve(satTimestamp);
    expect(satEval.phase).toBe('SATURDAY_DARK');
    expect(satEval.baseTemporalScore).toBe(0.15);

    // Sunday 2026-10-11 23:00:00 UTC = 19:00 EDT (Sunday CME Futures Reopened)
    const sunTimestamp = Date.UTC(2026, 9, 11, 23, 0, 0);
    const sunEval = evaluateTemporalCurve(sunTimestamp);
    expect(sunEval.phase).toBe('SUNDAY_FUTURES_OPEN');
    expect(sunEval.baseTemporalScore).toBe(0.65);
    expect(sunEval.cmeFuturesActive).toBe(true);

    // Monday 2026-10-12 11:30:00 UTC = 07:30 EDT (Monday Pre-market)
    const monPreTimestamp = Date.UTC(2026, 9, 12, 11, 30, 0);
    const monPreEval = evaluateTemporalCurve(monPreTimestamp);
    expect(monPreEval.phase).toBe('MONDAY_PRE_MARKET');
    expect(monPreEval.baseTemporalScore).toBe(0.85);

    // Tuesday 2026-10-13 18:00:00 UTC = 14:00 EDT (Regular Trading Hours)
    const tueTimestamp = Date.UTC(2026, 9, 13, 18, 0, 0);
    const tueEval = evaluateTemporalCurve(tueTimestamp);
    expect(tueEval.phase).toBe('REGULAR_HOURS');
    expect(tueEval.baseTemporalScore).toBe(1.00);
  });
});
