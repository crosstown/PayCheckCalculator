import type { StateOvertimeRules } from "../types";

/**
 * Kentucky overtime rules -- KRS § 337.050.
 *
 * Verified 2026-08. Kentucky follows the standard federal weekly
 * threshold (>40 hrs/week -> 1.5x), plus one additional state-specific
 * rule: if an employee works all 7 days of a workweek, all hours
 * worked on that 7th day are paid at 1.5x (no straight-time hours that
 * day at all). Unlike California's version of this rule, Kentucky's
 * explicitly does NOT apply if the employee worked 40 hours or fewer
 * that week -- the statute only kicks in once weekly overtime is
 * already triggered. No daily-overtime rule, no double-time tier.
 */
export const kyOvertimeRules: StateOvertimeRules = {
  state: "KY",
  stateName: "Kentucky",
  citation: "Ky. Rev. Stat. § 337.050",
  notes: [
    "If all 7 days of a workweek are worked, and total hours that week exceed 40, all hours worked on the 7th day are paid at 1.5x -- but this rule does not apply at all if the week's total is 40 hours or fewer.",
    "This estimate assumes a non-exempt hourly employee. Executive, administrative, professional, and certain other roles may be exempt from overtime entirely under state and federal law.",
    "This is an estimate for general informational purposes, not legal, tax, or payroll advice.",
  ],
  weeklyOvertimeThresholdHours: 40,
  weeklyOvertimeMultiplier: 1.5,
  seventhConsecutiveDay: {
    firstBlockHours: Infinity,
    firstBlockMultiplier: 1.5,
    beyondMultiplier: 1.5,
    requiresWeeklyOvertimeTriggered: true,
  },
};
