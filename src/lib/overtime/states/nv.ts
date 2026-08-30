import type { StateOvertimeRules } from "../types";

/**
 * Nevada overtime rules -- NRS 608.018.
 *
 * Verified 2026-08. Nevada's daily-overtime rule (>8 hrs in a 24-hour
 * period -> 1.5x) is CONDITIONAL: it only applies to employees paid
 * less than 1.5x Nevada's minimum wage. Nevada's minimum wage has been
 * a single $12.00/hr rate since 2024-07-01 (the prior two-tier
 * with/without-health-benefits structure was eliminated), making the
 * wage threshold $18.00/hr -- at or above that rate, only the weekly
 * 40-hour rule applies. A written agreement to a 4-day, 10-hour/day
 * schedule also exempts the daily rule regardless of wage.
 *
 * The minimum wage figure is the one part of this file most likely to
 * go stale -- re-verify labor.nv.gov before trusting the $18.00
 * threshold long after 2026.
 */
export const nvOvertimeRules: StateOvertimeRules = {
  state: "NV",
  stateName: "Nevada",
  citation: "Nev. Rev. Stat. § 608.018",
  notes: [
    "Daily overtime (over 8 hrs in a 24-hour period, at 1.5x) only applies if your hourly rate is below $18.00 -- 1.5x Nevada's $12.00/hr minimum wage (effective 2024-07-01). At or above $18.00/hr, only the weekly 40-hour rule applies.",
    "A written agreement to a 4-day, 10-hour/day schedule exempts an employee from the daily rule regardless of wage.",
    "This estimate assumes a non-exempt hourly employee. Executive, administrative, professional, and certain other roles may be exempt from overtime entirely under state and federal law.",
    "This is an estimate for general informational purposes, not legal, tax, or payroll advice.",
  ],
  weeklyOvertimeThresholdHours: 40,
  weeklyOvertimeMultiplier: 1.5,
  dailyOvertimeThresholdHours: 8,
  dailyOvertimeMultiplier: 1.5,
  wageConditionalDailyOvertime: {
    belowHourlyRate: 18.0,
    description: "1.5x Nevada's $12.00/hr minimum wage (effective 2024-07-01)",
  },
  alternativeSchedule: {
    description: "Written agreement to a 4-day, 10-hour/day schedule",
    removesDailyOvertime: true,
  },
};
