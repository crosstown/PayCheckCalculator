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

/** Resolves the effective daily-overtime threshold for this calculation,
 * or `undefined` if the daily rule doesn't apply at all -- accounting
 * for Nevada's wage condition and Nevada/Alaska's alternative-schedule
 * agreements. */
export function effectiveDailyThreshold(
  rules: StateOvertimeRules,
  hourlyRate: number,
  alternativeScheduleAgreement: boolean | undefined,
): number | undefined {
  if (rules.dailyOvertimeThresholdHours === undefined) return undefined;

  if (
    rules.wageConditionalDailyOvertime &&
    hourlyRate >= rules.wageConditionalDailyOvertime.belowHourlyRate
  ) {
    return undefined; // e.g. Nevada: at/above the wage threshold, daily rule doesn't apply
  }

  if (alternativeScheduleAgreement && rules.alternativeSchedule) {
    if (rules.alternativeSchedule.removesDailyOvertime) return undefined;
    if (rules.alternativeSchedule.adjustedDailyThresholdHours !== undefined) {
      return rules.alternativeSchedule.adjustedDailyThresholdHours;
    }
  }

  return rules.dailyOvertimeThresholdHours;
}

function calculateWeek(
  rules: StateOvertimeRules,
  week: WeekInput,
  hourlyRate: number,
  alternativeScheduleAgreement: boolean | undefined,
): WeekResult {
  const dailyThreshold = effectiveDailyThreshold(rules, hourlyRate, alternativeScheduleAgreement);
  const hasDayLevelRule = dailyThreshold !== undefined || !!rules.seventhConsecutiveDay;

  if (hasDayLevelRule && week.days && week.days.length > 0) {
    return calculateWeekWithDayLevelRules(rules, week.days, dailyThreshold);
  }

  // Weekly-only path: either the state has no day-level rule (CT and
  // most states), or a wage/agreement condition removed the daily rule
  // for this input.
  const threshold = rules.weeklyOvertimeThresholdHours;
  const regularHours = Math.min(week.totalHours, threshold);
  const overtimeHours = Math.max(0, week.totalHours - threshold);

  return finalizeWeek(regularHours, overtimeHours, 0);
}

function calculateWeekWithDayLevelRules(
  rules: StateOvertimeRules,
  days: DayHours[],
  dailyThreshold: number | undefined,
): WeekResult {
  // No daily-overtime rule (e.g. Kentucky, which only has the
  // 7th-day premium) -- treat every non-7th-day hour as straight
  // regular for now; the weekly-threshold reconciliation below still
  // upgrades hours beyond 40/week as usual.
  const perDayThreshold = dailyThreshold ?? Infinity;
  const dtThreshold = rules.dailyDoubleTimeThresholdHours ?? Infinity;
  const weeklyThreshold = rules.weeklyOvertimeThresholdHours;

  const weekTotalHours = days.reduce((sum, d) => sum + d.hours, 0);
  const allSevenWorked = days.length === 7 && days.every((d) => d.hours > 0);
  const weeklyGateOk =
    !rules.seventhConsecutiveDay?.requiresWeeklyOvertimeTriggered ||
    weekTotalHours > weeklyThreshold;

  // The 7th-consecutive-day premium (CA, KY) only applies when the
  // whole 7-day workweek was worked (and, for KY, only when the week
  // also exceeded the weekly overtime threshold), and replaces the
  // *entire* classification for that final day -- it is not layered
  // on top of the normal daily rule for that day.
  const seventhDayApplies = !!rules.seventhConsecutiveDay && allSevenWorked && weeklyGateOk;
  const seventhDayIndex = seventhDayApplies ? days.length - 1 : -1;

  let dailyRegular = 0;
  let dailyOvertime = 0;
  let dailyDoubleTime = 0;

  days.forEach((day, i) => {
    if (i === seventhDayIndex && rules.seventhConsecutiveDay) {
      const { firstBlockHours } = rules.seventhConsecutiveDay;
      // No straight-time hours at all on the 7th consecutive day.
      dailyOvertime += Math.min(day.hours, firstBlockHours);
      dailyDoubleTime += Math.max(0, day.hours - firstBlockHours);
      return;
    }
    const regular = Math.min(day.hours, perDayThreshold);
    const overtime = Math.max(0, Math.min(day.hours, dtThreshold) - perDayThreshold);
    const doubleTime = Math.max(0, day.hours - dtThreshold);
    dailyRegular += regular;
    dailyOvertime += overtime;
    dailyDoubleTime += doubleTime;
  });

  // Weekly threshold applies on top of hours not already elevated by
  // the daily/7th-day rules -- excess "regular" hours beyond the
  // weekly threshold get upgraded to (weekly) overtime. This is how
  // "whichever is greater, no double-counting" is enforced across
  // CA/AK/CO/NV: each hour is counted exactly once, at the highest
  // applicable multiplier.
  const weeklyUpgrade = Math.max(0, dailyRegular - weeklyThreshold);
  const regularHours = dailyRegular - weeklyUpgrade;
  const overtimeHours = dailyOvertime + weeklyUpgrade;

  return finalizeWeek(regularHours, overtimeHours, dailyDoubleTime);
}

function finalizeWeek(
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
    const w = calculateWeek(rules, week, input.hourlyRate, input.alternativeScheduleAgreement);
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
