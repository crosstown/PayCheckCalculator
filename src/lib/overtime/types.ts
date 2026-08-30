/**
 * Core types for the overtime calculation engine.
 *
 * Design note: this is intentionally more general than CT alone needs,
 * because the project's stated goal is CT first, then all 50 states.
 * States vary in how they compute overtime beyond the federal FLSA
 * baseline (29 U.S.C. § 207) of 1.5x pay for hours over 40 in a
 * workweek -- for example California adds daily overtime (>8 hrs/day)
 * and double-time (>12 hrs/day, or >8 hrs on a 7th consecutive
 * workday). `StateOvertimeRules` has optional fields for those cases
 * so future states can be added without reshaping this file; CT only
 * populates the weekly-threshold fields.
 */

export type StateCode = string; // USPS 2-letter code, e.g. "CT"

export interface StateOvertimeRules {
  state: StateCode;
  stateName: string;
  /** Short citation(s) for where these rules come from, shown in the UI. */
  citation: string;
  /** Free-text notes surfaced in the UI (exemptions, caveats, etc.). */
  notes?: string[];

  /** Hours per workweek before weekly overtime kicks in. FLSA default: 40. */
  weeklyOvertimeThresholdHours: number;
  /** Multiplier applied to the regular rate for weekly overtime hours. FLSA default: 1.5. */
  weeklyOvertimeMultiplier: number;

  /**
   * Optional daily overtime rule (e.g. California: >8 hrs/day at 1.5x).
   * Not used by CT; included so states that need it don't require a
   * type change later.
   */
  dailyOvertimeThresholdHours?: number;
  dailyOvertimeMultiplier?: number;

  /**
   * Optional daily double-time rule (e.g. California: >12 hrs/day at 2x).
   */
  dailyDoubleTimeThresholdHours?: number;
  dailyDoubleTimeMultiplier?: number;
}

/** A single day's worked hours, used only by states with a daily-overtime rule. */
export interface DayHours {
  label: string; // e.g. "Mon"
  hours: number;
}

export interface WeekInput {
  /** Total hours worked in this 7-day workweek. */
  totalHours: number;
  /**
   * Optional per-day breakdown. Required for correct results in states
   * with a daily-overtime rule; ignored by weekly-only states like CT.
   */
  days?: DayHours[];
}

export interface CalculationInput {
  state: StateCode;
  hourlyRate: number;
  weeks: WeekInput[];
}

export interface WeekResult {
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  regularPay: number;
  overtimePay: number;
  doubleTimePay: number;
  totalPay: number;
}

export interface CalculationResult {
  state: StateCode;
  weeks: WeekResult[];
  totals: {
    regularHours: number;
    overtimeHours: number;
    doubleTimeHours: number;
    regularPay: number;
    overtimePay: number;
    doubleTimePay: number;
    totalPay: number;
  };
}
