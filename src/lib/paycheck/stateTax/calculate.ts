import type { FilingStatus } from "../types";
import { STATE_TAX_RULES } from "./data";
import type { StateBracket, StateDeductionOrCredit, StateTaxRules } from "./types";

export function getStateTaxRules(state: string): StateTaxRules | undefined {
  return STATE_TAX_RULES[state];
}

function annualBracketTax(brackets: StateBracket[], annualWages: number): number {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const current = brackets[i];
    const next = brackets[i + 1];
    const upper = next ? next.atLeast : Infinity;
    if (annualWages <= current.atLeast) break;
    const taxableInThisBracket = Math.min(annualWages, upper) - current.atLeast;
    tax += taxableInThisBracket * current.rate;
    if (annualWages <= upper) break;
  }
  return tax;
}

function resolveAmount(item: StateDeductionOrCredit | undefined, filingStatus: FilingStatus): number {
  return item ? item.amounts[filingStatus] : 0;
}

/**
 * Estimates state income tax withholding for one pay period. See
 * data.ts for sourcing, verification notes, and scope limitations
 * (state-level only, no local tax, no state-specific dependent
 * credits, Head of Household uses Single figures).
 */
export function calculateStateTax(
  state: string,
  periodTaxableWages: number,
  payPeriodsPerYear: number,
  filingStatus: FilingStatus,
): number {
  const rules = STATE_TAX_RULES[state];
  if (!rules || !rules.hasIncomeTax || !rules.brackets) return 0;

  const annualWages = periodTaxableWages * payPeriodsPerYear;
  const standardDeductionAmount = resolveAmount(rules.standardDeduction, filingStatus);
  const exemptionAmount = resolveAmount(rules.personalExemption, filingStatus);

  const deductionsFromIncome =
    (rules.standardDeduction?.type === "deduction" ? standardDeductionAmount : 0) +
    (rules.personalExemption?.type === "deduction" ? exemptionAmount : 0);

  const taxableAnnualWages = Math.max(0, annualWages - deductionsFromIncome);
  let annualTax = annualBracketTax(rules.brackets[filingStatus], taxableAnnualWages);

  const creditsAgainstTax =
    (rules.standardDeduction?.type === "credit" ? standardDeductionAmount : 0) +
    (rules.personalExemption?.type === "credit" ? exemptionAmount : 0);
  annualTax = Math.max(0, annualTax - creditsAgainstTax);

  return annualTax / payPeriodsPerYear;
}
