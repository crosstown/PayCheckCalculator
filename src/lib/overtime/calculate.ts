import type {
  CalculationInput,
  CalculationResult,
  DayHours,
  StateOvertimeRules,
  WeekInput,
  WeekResult,
} from "./types";
import { getStateRules } from "./registry";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function calculateWeek(rules: StateOvertimeRules, week: WeekInput): WeekResult {
  const hasDailyRule = rules.dailyOvertimeThresholdHours !== undefined;

  if (hasDailyRule && week.days && week.days.length > 0) {
    return calculateWeekWithDailyRule(rules, week.days);
  }

  // Weekly-only path (this is CT's actual path today, and is the
  // well-understood, verified FLSA-style calculation).
  const threshold = rules.weeklyOvertimeThresholdHours;
  const regularHours = Math.min(week.totalHours, threshold);
  const overtimeHours = Math.max(0, week.totalHours - threshold);

  return finalizeWeek(rules, regularHours, overtimeHours, 0);
}

/**
 * NOTE: this path is a best-effort scaffold for future states with a
 * daily-overtime rule (e.g. California) and is NOT yet enabled by any
 * state in the registry -- CT never reaches this function. Before
 * wiring up a state that sets `dailyOvertimeThresholdHours`, verify
 * this reconciliation logic (daily-vs-weekly overtime, no
 * double-counting hours) against that state's actual DOL guidance.
 * Do not trust this for real payroll decisions as-is.
 */
function calculateWeekWithDailyRule(
  rules: StateOvertimeRules,
  days: DayHours[],
): WeekResult {
  let dailyRegular = 0;
  let dailyOvertime = 0;
  let dailyDoubleTime = 0;

  const otThreshold = rules.dailyOvertimeThresholdHours ?? Infinity;
  const dtThreshold = rules.dailyDoubleTimeThresholdHours ?? Infinity;

  for (const day of days) {
    const regular = Math.min(day.hours, otThreshold);
    const overtime = Math.max(0, Math.min(day.hours, dtThreshold) - otThreshold);
    const doubleTime = Math.max(0, day.hours - dtThreshold);
    dailyRegular += regular;
    dailyOvertime += overtime;
    dailyDoubleTime += doubleTime;
  }

  // Weekly threshold applies on top of hours not already elevated by
  // the daily rule -- excess "regular" hours beyond the weekly
  // threshold get upgraded to (weekly) overtime.
  const weeklyThreshold = rules.weeklyOvertimeThresholdHours;
  const weeklyUpgrade = Math.max(0, dailyRegular - weeklyThreshold);
  const regularHours = dailyRegular - weeklyUpgrade;
  const overtimeHours = dailyOvertime + weeklyUpgrade;

  return finalizeWeek(rules, regularHours, overtimeHours, dailyDoubleTime);
}

function finalizeWeek(
  rules: StateOvertimeRules,
  regularHours: number,
  overtimeHours: number,
  doubleTimeHours: number,
): WeekResult {
  return {
    regularHours: round2(regularHours),
    overtimeHours: round2(overtimeHours),
    doubleTimeHours: round2(doubleTimeHours),
    regularPay: 0,
    overtimePay: 0,
    doubleTimePay: 0,
    totalPay: 0,
  };
}

export function calculateOvertime(input: CalculationInput): CalculationResult {
  const rules = getStateRules(input.state);
  if (!rules) {
    throw new Error(`No overtime rules implemented for state "${input.state}"`);
  }
  if (input.hourlyRate < 0) {
    throw new Error("Hourly rate cannot be negative");
  }

  const overtimeMultiplier = rules.weeklyOvertimeMultiplier;
  const doubleTimeMultiplier = rules.dailyDoubleTimeMultiplier ?? 2;

  const weeks = input.weeks.map((week) => {
    const w = calculateWeek(rules, week);
    const regularPay = round2(w.regularHours * input.hourlyRate);
    const overtimePay = round2(w.overtimeHours * input.hourlyRate * overtimeMultiplier);
    const doubleTimePay = round2(w.doubleTimeHours * input.hourlyRate * doubleTimeMultiplier);
    return {
      ...w,
      regularPay,
      overtimePay,
      doubleTimePay,
      totalPay: round2(regularPay + overtimePay + doubleTimePay),
    };
  });

  const totals = weeks.reduce(
    (acc, w) => ({
      regularHours: round2(acc.regularHours + w.regularHours),
      overtimeHours: round2(acc.overtimeHours + w.overtimeHours),
      doubleTimeHours: round2(acc.doubleTimeHours + w.doubleTimeHours),
      regularPay: round2(acc.regularPay + w.regularPay),
      overtimePay: round2(acc.overtimePay + w.overtimePay),
      doubleTimePay: round2(acc.doubleTimePay + w.doubleTimePay),
      totalPay: round2(acc.totalPay + w.totalPay),
    }),
    {
      regularHours: 0,
      overtimeHours: 0,
      doubleTimeHours: 0,
      regularPay: 0,
      overtimePay: 0,
      doubleTimePay: 0,
      totalPay: 0,
    },
  );

  return { state: input.state, weeks, totals };
}
