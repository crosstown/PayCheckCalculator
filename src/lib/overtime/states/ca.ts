import type { StateOvertimeRules } from "../types";

/**
 * California overtime rules -- Cal. Labor Code § 510.
 *
 * Verified 2026-08 against Labor Code § 510 summaries. Three separate
 * triggers, none of which double-count the same hours:
 * 1. Weekly: >40 hrs/workweek -> 1.5x
 * 2. Daily: >8 hrs/workday -> 1.5x; >12 hrs/workday -> 2x
 * 3. 7th consecutive workday: if all 7 days of the workweek were
 *    worked, the first 8 hours of that 7th day are paid at 1.5x (i.e.
 *    no straight-time hours at all that day), and anything beyond 8
 *    hours that day is 2x.
 */
export const caOvertimeRules: StateOvertimeRules = {
  state: "CA",
  stateName: "California",
  citation: "Cal. Labor Code § 510",
  notes: [
    "Three separate triggers apply, whichever is greater for a given hour (no double-counting): over 40 hrs/week, over 8 hrs/day, and the 7th consecutive day worked in a workweek.",
    "On the 7th consecutive day worked in one workweek, the first 8 hours are paid at 1.5x (not straight time), and anything beyond 8 hours that day is 2x.",
    "This estimate assumes a non-exempt hourly employee. Executive, administrative, professional, and certain other roles may be exempt from overtime entirely under state and federal law.",
    "This is an estimate for general informational purposes, not legal, tax, or payroll advice.",
  ],
  weeklyOvertimeThresholdHours: 40,
  weeklyOvertimeMultiplier: 1.5,
  dailyOvertimeThresholdHours: 8,
  dailyOvertimeMultiplier: 1.5,
  dailyDoubleTimeThresholdHours: 12,
  dailyDoubleTimeMultiplier: 2,
  seventhConsecutiveDay: {
    firstBlockHours: 8,
    firstBlockMultiplier: 1.5,
    beyondMultiplier: 2,
  },
};
