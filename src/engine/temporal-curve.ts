import { MarketPhase } from '../types/index.js';

export interface TemporalPhaseInfo {
  phase: MarketPhase;
  deltaHours: number;
  baseTemporalScore: number;
  cmeFuturesActive: boolean;
  phaseDescription: string;
}

/**
 * Returns the Eastern Daylight Time (America/New_York) offset in minutes for a given date.
 * Typically -240 minutes (UTC-4) during EDT, or -300 minutes (UTC-5) during EST.
 */
export function getEasternOffsetMinutes(date: Date): number {
  // Use Intl to determine whether EDT or EST is in effect
  const str = date.toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' });
  return str.includes('EDT') ? -240 : -300;
}

/**
 * Computes market phase and temporal decay trust based on delta hours from Friday 16:00 (4:00 PM EDT).
 *
 * Curve specifications:
 * - Friday post-close (0 - 4h): 0.85 base (4:00 PM - 8:00 PM)
 * - Saturday dark (4 - 26h): 0.15 base (noise floor, Friday 8:00 PM - Saturday 10:00 PM)
 * - Sunday pre-futures (26 - 50h): 0.25 base (Saturday 10:00 PM - Sunday 6:00 PM)
 * - Sunday futures reopen (50 - 60h): 0.65 base (CME Globex active, Sunday 6:00 PM - Monday 4:00 AM)
 * - Monday pre-market (60 - 65.5h): 0.85 base (Monday 4:00 AM - 9:30 AM)
 * - Regular trading hours: 1.00 base (Monday 9:30 AM - Friday 4:00 PM)
 */
export function calculatePhaseFromDeltaHours(deltaHours: number): TemporalPhaseInfo {
  if (deltaHours < 0 || deltaHours >= 65.5) {
    return {
      phase: 'REGULAR_HOURS',
      deltaHours: Math.max(0, deltaHours),
      baseTemporalScore: 1.00,
      cmeFuturesActive: false,
      phaseDescription: 'Regular equity trading session / continuous exchange auction active.',
    };
  }

  if (deltaHours <= 4.0) {
    return {
      phase: 'FRIDAY_POST_CLOSE',
      deltaHours,
      baseTemporalScore: 0.85,
      cmeFuturesActive: false,
      phaseDescription: 'Friday post-market liquidity tail. Residual institutional flow diminishing.',
    };
  }

  if (deltaHours <= 26.0) {
    return {
      phase: 'SATURDAY_DARK',
      deltaHours,
      baseTemporalScore: 0.15,
      cmeFuturesActive: false,
      phaseDescription: 'Saturday Dark Hours. Zero institutional price discovery, retail wash trap zone.',
    };
  }

  if (deltaHours <= 50.0) {
    return {
      phase: 'SUNDAY_PRE_FUTURES',
      deltaHours,
      baseTemporalScore: 0.25,
      cmeFuturesActive: false,
      phaseDescription: 'Sunday pre-futures vacuum. High manipulation vulnerability prior to CME Globex reopen.',
    };
  }

  if (deltaHours <= 60.0) {
    return {
      phase: 'SUNDAY_FUTURES_OPEN',
      deltaHours,
      baseTemporalScore: 0.65,
      cmeFuturesActive: true,
      phaseDescription: 'CME Globex Equity Index Futures reopened. Institutional macro price anchor restored.',
    };
  }

  // 60.0 < deltaHours < 65.5
  return {
    phase: 'MONDAY_PRE_MARKET',
    deltaHours,
    baseTemporalScore: 0.85,
    cmeFuturesActive: true,
    phaseDescription: 'Monday US equity pre-market. ECN liquidity pools active prior to 9:30 AM Opening Cross.',
  };
}

/**
 * Calculates current market phase and delta hours from a given Date or Unix millisecond timestamp.
 */
export function evaluateTemporalCurve(inputDate: Date | number = Date.now()): TemporalPhaseInfo {
  const d = typeof inputDate === 'number' ? new Date(inputDate) : inputDate;
  
  // Convert UTC date to Eastern Time components
  const easternFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = easternFormatter.formatToParts(d);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const weekday = partMap['weekday']; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
  const hour = parseInt(partMap['hour'] ?? '0', 10);
  const minute = parseInt(partMap['minute'] ?? '0', 10);
  const second = parseInt(partMap['second'] ?? '0', 10);
  const timeOfDayHours = hour + minute / 60 + second / 3600;

  // Check if inside regular hours (Mon 09:30 - Fri 16:00)
  // Weekdays: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
  const isWeekendOrDark =
    weekday === 'Sat' ||
    weekday === 'Sun' ||
    (weekday === 'Fri' && timeOfDayHours >= 16.0) ||
    (weekday === 'Mon' && timeOfDayHours < 9.5);

  if (!isWeekendOrDark) {
    return {
      phase: 'REGULAR_HOURS',
      deltaHours: 0,
      baseTemporalScore: 1.00,
      cmeFuturesActive: false,
      phaseDescription: 'Regular equity trading session / continuous exchange auction active.',
    };
  }

  // Calculate deltaHours from Friday 16:00 EDT
  let deltaHours = 0;
  if (weekday === 'Fri') {
    deltaHours = Math.max(0, timeOfDayHours - 16.0);
  } else if (weekday === 'Sat') {
    // 8 hours on Friday (16:00 to 24:00) + Saturday hours
    deltaHours = 8.0 + timeOfDayHours;
  } else if (weekday === 'Sun') {
    // 8 (Fri) + 24 (Sat) + Sunday hours = 32 + Sunday hours
    deltaHours = 32.0 + timeOfDayHours;
  } else if (weekday === 'Mon') {
    // 8 (Fri) + 24 (Sat) + 24 (Sun) + Monday hours = 56 + Monday hours
    deltaHours = 56.0 + timeOfDayHours;
  }

  return calculatePhaseFromDeltaHours(deltaHours);
}
