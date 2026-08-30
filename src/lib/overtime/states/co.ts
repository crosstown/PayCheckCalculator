import type { StateOvertimeRules } from "../types";

/**
 * Colorado overtime rules -- COMPS Order #40 (7 CCR 1103-1).
 *
 * Verified 2026-08. Overtime at 1.5x applies to hours over 40/week OR
 * over 12/workday, whichever is greater for a given hour (no
 * double-counting). Colorado's COMPS Order technically also has a
 * "12 consecutive hours worked regardless of workday boundary" trigger
 * (relevant to shifts that cross midnight) -- this calculator does not
 * model that clock-time edge case, only the per-entered-day total, so
 * a shift spanning two calendar days may be under-counted here.
 * Colorado has no double-time tier and no 7th-consecutive-day rule.
 */
export const coOvertimeRules: StateOvertimeRules = {
  state: "CO",
  stateName: "Colorado",
  citation: "COMPS Order #40, 7 CCR 1103-1",
  notes: [
    "Overtime (1.5x) applies to hours over 40/week or over 12/workday, whichever is greater for a given hour -- not both added together.",
    "Colorado's rule also covers 12 consecutive hours worked regardless of calendar-day boundary (e.g. an overnight shift) -- this calculator only looks at hours entered per day, so a shift crossing midnight may not be captured correctly.",
    "This estimate assumes a non-exempt hourly employee. Executive, administrative, professional, and certain other roles may be exempt from overtime entirely under state and federal law.",
    "This is an estimate for general informational purposes, not legal, tax, or payroll advice.",
  ],
  weeklyOvertimeThresholdHours: 40,
  weeklyOvertimeMultiplier: 1.5,
  dailyOvertimeThresholdHours: 12,
  dailyOvertimeMultiplier: 1.5,
};
