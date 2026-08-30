/**
 * Core types for the overtime calculation engine.
 *
 * Design note: this is intentionally more general than CT alone needs,
 * because the project's stated goal is CT first, then all 50 states.
 * States vary in how they compute overtime beyond the federal FLSA
 * baseline (29 U.S.C. § 207) of 1.5x pay for hours over 40 in a
 * workweek. Verified as of 2026-08 (see each state file's citation):
 * California, Alaska, Colorado add a daily-overtime threshold; Nevada's
 * daily threshold is conditional on the employee's wage; California
 * additionally has a 7th-consecutive-workday premium. `StateOvertimeRules`
 * models all of these so a state file only needs to fill in what applies
 * to it -- CT only populates the weekly-threshold fields.
 */

export type StateCode = string; // USPS 2-letter code, e.g. "CT"

/**
 * A written alternative-schedule agreement between employer and
 * employee that changes how the daily-overtime rule applies (e.g.
 * Nevada's 4x10 exemption, Alaska's flexible work hour plan). Modeled
 * as two possible effects: either it removes the daily rule entirely,
 * or it raises the daily threshold to a different number of hours.
 */
export interface AlternativeScheduleRule {
  description: string;
  removesDailyOvertime?: boolean;
  adjustedDailyThresholdHours?: number;
}

/**
 * Nevada-style condition: the daily-overtime rule only applies when
 * the employee's hourly rate is below a wage threshold (defined as a
 * multiple of the state minimum wage). At or above that rate, only
 * the weekly 40-hour rule applies.
 */
export interface WageConditionalDailyOvertime {
  belowHourlyRate: number;
  description: string;
}

/**
 * California-style premium for the 7th consecutive day worked in a
 * single workweek: the first `firstBlockHours` of that day are paid
 * at `firstBlockMultiplier` (i.e. there are no straight-time hours at
 * all that day), and anything beyond that is paid at `beyondMultiplier`.
 * Only applies when all 7 days of the entered workweek have hours > 0.
 */
export interface SeventhConsecutiveDayRule {
  firstBlockHours: number;
  firstBlockMultiplier: number;
  beyondMultiplier: number;
}

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

  /** Optional daily overtime rule (e.g. California/Alaska: >8 hrs/day; Colorado: >12 hrs/day). */
  dailyOvertimeThresholdHours?: number;
  dailyOvertimeMultiplier?: number;

  /** Optional daily double-time rule (e.g. California: >12 hrs/day at 2x). */
  dailyDoubleTimeThresholdHours?: number;
  dailyDoubleTimeMultiplier?: number;

  /** Nevada: daily rule only applies below this wage. */
  wageConditionalDailyOvertime?: WageConditionalDailyOvertime;

  /** Nevada/Alaska: a written agreement can remove or adjust the daily rule. */
  alternativeSchedule?: AlternativeScheduleRule;

  /** California only. */
  seventhConsecutiveDay?: SeventhConsecutiveDayRule;
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
   * Optional per-day breakdown, in chronological order for the
   * workweek. Required for correct results in states with a
   * daily-overtime rule; ignored by weekly-only states like CT. The
   * 7th-consecutive-day premium (CA) only triggers when this array has
   * exactly 7 entries and all have hours > 0 -- i.e. the whole
   * workweek was worked.
   */
  days?: DayHours[];
}

export interface CalculationInput {
  state: StateCode;
  hourlyRate: number;
  weeks: WeekInput[];
  /**
   * Whether a qualifying written alternative-schedule agreement is in
   * place (see `StateOvertimeRules.alternativeSchedule`). Ignored by
   * states/rules that don't define one.
   */
  alternativeScheduleAgreement?: boolean;
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
