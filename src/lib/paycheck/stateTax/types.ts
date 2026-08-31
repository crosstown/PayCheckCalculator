import type { FilingStatus } from "../types";

export interface StateBracket {
  atLeast: number;
  rate: number; // decimal, e.g. 0.05 for 5%
}

/**
 * Brackets by filing status. Most states publish separate brackets for
 * Single and Married Filing Jointly; almost none publish a separate
 * Head of Household schedule -- `headOfHousehold` is set equal to
 * `single` everywhere in this dataset (a disclosed simplification,
 * not a data gap specific to any one state).
 */
export type StateBracketsByFiling = Record<FilingStatus, StateBracket[]>;

/**
 * A flat per-filer dollar amount that reduces the tax base, either as
 * a `"deduction"` (subtracted from taxable wages before applying
 * brackets) or a `"credit"` (subtracted from the computed tax
 * itself) -- which one a given state uses matters a lot and is taken
 * directly from how each state's own guidance describes it, not
 * assumed.
 */
export interface StateDeductionOrCredit {
  type: "deduction" | "credit";
  amounts: Record<FilingStatus, number>;
}

export interface StateTaxRules {
  state: string;
  stateName: string;
  hasIncomeTax: boolean;
  citation: string;
  brackets?: StateBracketsByFiling;
  standardDeduction?: StateDeductionOrCredit;
  personalExemption?: StateDeductionOrCredit;
  notes?: string[];
}
