import { getStateRules } from "./registry";
import { getStateTaxRules } from "@/lib/paycheck/stateTax/calculate";
import { calculateOvertime } from "./calculate";
import type { StateCode } from "./types";

/**
 * Shared inputs for the worked example shown on every /overtime/[state]
 * page. Deliberately the SAME hypothetical (a 45-hour week, five 9-hour
 * weekdays) for every state, and run through the real `calculateOvertime`
 * engine rather than hand-written per-state numbers -- that's what makes
 * the per-state pages honest (actual computed output, not copy-pasted
 * text with the state name swapped in) while still producing genuinely
 * different results where a state's rules differ (daily overtime,
 * double-time, etc. all show up in the same example).
 */
export const EXAMPLE_HOURLY_RATE = 20;
export const EXAMPLE_DAYS = [
  { label: "Sun", hours: 0 },
  { label: "Mon", hours: 9 },
  { label: "Tue", hours: 9 },
  { label: "Wed", hours: 9 },
  { label: "Thu", hours: 9 },
  { label: "Fri", hours: 9 },
  { label: "Sat", hours: 0 },
];
export const EXAMPLE_TOTAL_HOURS = 45;

export function buildWorkedExample(code: StateCode) {
  const rules = getStateRules(code);
  if (!rules) return null;
  const { weeks } = calculateOvertime({
    state: code,
    hourlyRate: EXAMPLE_HOURLY_RATE,
    weeks: [{ totalHours: EXAMPLE_TOTAL_HOURS, days: EXAMPLE_DAYS }],
  });
  return { rules, week: weeks[0] };
}

/** Plain-language summary of a state's income tax situation, derived
 * from the same verified data the paycheck calculator itself uses --
 * see src/lib/paycheck/stateTax/data.ts for sourcing. */
export function stateIncomeTaxSummary(code: StateCode): string | null {
  const rules = getStateTaxRules(code);
  if (!rules) return null;
  if (!rules.hasIncomeTax) {
    return `${rules.stateName} has no state income tax on wages, so overtime pay is only reduced by federal income tax and FICA (Social Security and Medicare) withholding.`;
  }
  const brackets = rules.brackets?.single;
  const topRate = brackets ? brackets[brackets.length - 1].rate : undefined;
  const isFlat = brackets && brackets.length === 1;
  if (topRate === undefined) {
    return `${rules.stateName} taxes wage income (${rules.citation}); overtime pay is subject to the same state withholding as regular pay.`;
  }
  const pct = (topRate * 100).toFixed(2).replace(/\.?0+$/, "");
  return isFlat
    ? `${rules.stateName} has a flat ${pct}% state income tax on wages (${rules.citation}), so overtime pay is withheld at the same rate as regular pay.`
    : `${rules.stateName} taxes wage income on a bracketed schedule topping out at ${pct}% (${rules.citation}); overtime pay is withheld the same as any other wages, based on your total taxable pay for the period.`;
}
