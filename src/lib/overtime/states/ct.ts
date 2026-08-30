import type { StateOvertimeRules } from "../types";

/**
 * Connecticut overtime rules.
 *
 * Connecticut follows the federal FLSA weekly-overtime standard: 1.5x
 * the regular rate for hours worked over 40 in a workweek, for
 * non-exempt employees. Conn. Gen. Stat. § 31-76c sets this state-law
 * requirement (mirroring 29 U.S.C. § 207); Connecticut has no general
 * daily-overtime or double-time requirement.
 *
 * This is a general-case estimate only -- it does not attempt to
 * determine exempt/non-exempt status, apply tip-credit or commission
 * rules, or account for any collective-bargaining-agreement or
 * industry-specific variations. Users should confirm their own
 * classification and consult the CT Department of Labor (or an
 * employment attorney / their payroll department) for anything
 * beyond a general estimate.
 */
export const ctOvertimeRules: StateOvertimeRules = {
  state: "CT",
  stateName: "Connecticut",
  citation: "Conn. Gen. Stat. § 31-76c (aligns with federal FLSA, 29 U.S.C. § 207)",
  notes: [
    "Overtime applies per 7-day workweek, not per pay period -- a biweekly paycheck still needs each week calculated separately, which is why this calculator asks for hours week by week.",
    "This estimate assumes a non-exempt hourly employee. Executive, administrative, professional, and certain other roles may be exempt from overtime entirely under state and federal law.",
    "Connecticut has no general daily-overtime or double-time requirement -- only the weekly threshold below applies.",
    "This is an estimate for general informational purposes, not legal, tax, or payroll advice.",
  ],
  weeklyOvertimeThresholdHours: 40,
  weeklyOvertimeMultiplier: 1.5,
};
