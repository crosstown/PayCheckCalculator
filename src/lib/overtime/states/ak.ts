import type { StateOvertimeRules } from "../types";

/**
 * Alaska overtime rules -- AS 23.10.060.
 *
 * Verified 2026-08. Overtime at 1.5x applies to hours over 8/workday
 * OR over 40/week, whichever comes first for a given hour (no
 * double-counting). A voluntary written flexible work hour plan,
 * filed with the Alaska Department of Labor, lets an employee work up
 * to 10 hrs/day without triggering the daily rule (the weekly 40-hour
 * rule still applies regardless). No double-time tier, no
 * 7th-consecutive-day rule.
 */
export const akOvertimeRules: StateOvertimeRules = {
  state: "AK",
  stateName: "Alaska",
  citation: "Alaska Stat. § 23.10.060",
  notes: [
    "Overtime (1.5x) applies to hours over 8/workday or over 40/week, whichever comes first -- not both added together.",
    "A voluntary written flexible work hour plan, filed with the Alaska Department of Labor, raises the daily threshold to 10 hrs/day. The weekly 40-hour rule still applies regardless.",
    "This estimate assumes a non-exempt hourly employee. Executive, administrative, professional, and certain other roles may be exempt from overtime entirely under state and federal law.",
    "This is an estimate for general informational purposes, not legal, tax, or payroll advice.",
  ],
  weeklyOvertimeThresholdHours: 40,
  weeklyOvertimeMultiplier: 1.5,
  dailyOvertimeThresholdHours: 8,
  dailyOvertimeMultiplier: 1.5,
  alternativeSchedule: {
    description: "Voluntary written flexible work hour plan filed with the Alaska DOL",
    adjustedDailyThresholdHours: 10,
  },
};
