import type { StateCode, StateOvertimeRules } from "../types";

/**
 * Factory for the majority of states: no daily-overtime rule, no
 * double-time tier, no 7th-consecutive-day rule -- just the federal
 * FLSA weekly standard (29 U.S.C. § 207: >40 hrs/week at 1.5x). Some
 * of these states also have their own state wage-hour statute that
 * independently sets the same 40hr/1.5x threshold for general private
 * employment; others rely purely on federal law with no separate state
 * overtime statute. Either way the practical outcome for a covered
 * non-exempt hourly employee is identical, which is why this shares
 * one citation rather than 39 individually-verified state statute
 * citations (a specific state's own statute section, where one exists,
 * was not independently looked up for this baseline group -- flag it
 * if you need that level of citation precision for a given state).
 *
 * `extraNotes` lets a state add its own caveat (e.g. a narrow
 * industry-specific daily-overtime rule, or a higher nominal state
 * threshold that's superseded by the stricter federal 40-hour floor)
 * without needing its own file.
 */
export function federalBaselineRules(
  state: StateCode,
  stateName: string,
  extraNotes: string[] = [],
): StateOvertimeRules {
  return {
    state,
    stateName,
    citation: "29 U.S.C. § 207 (federal FLSA)",
    notes: [
      ...extraNotes,
      "This estimate assumes a non-exempt hourly employee. Executive, administrative, professional, and certain other roles may be exempt from overtime entirely under state and federal law.",
      "This is an estimate for general informational purposes, not legal, tax, or payroll advice.",
    ],
    weeklyOvertimeThresholdHours: 40,
    weeklyOvertimeMultiplier: 1.5,
  };
}
