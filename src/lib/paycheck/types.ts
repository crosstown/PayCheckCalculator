export type FilingStatus = "single" | "marriedJointly" | "headOfHousehold";

/**
 * Pre-tax: a Section 125 cafeteria-plan-style deduction (health/dental/
 * vision insurance premiums, HSA, FSA) -- excluded from federal taxable
 * wages, state taxable wages, AND FICA wages (unlike a traditional
 * 401(k), which is FICA-subject; see fica.ts).
 *
 * Post-tax: comes out of net pay only (Roth contributions, wage
 * garnishments, union dues, etc.) -- no effect on any taxable wage base.
 */
export type DeductionTaxTreatment = "preTax" | "postTax";

export interface OtherDeductionInput {
  id: string;
  label: string;
  /** Amount for this one pay period. */
  amount: number;
  taxTreatment: DeductionTaxTreatment;
}

export interface OtherDeductionResult {
  id: string;
  label: string;
  /** Rounded to the cent -- this is what's shown on screen and what's summed into totalDeductions. */
  amount: number;
  taxTreatment: DeductionTaxTreatment;
}

export interface PaycheckInput {
  /** Gross pay for this pay period (typically the overtime calculator's total pay). */
  grossPay: number;
  /** How many of these pay periods occur in a year -- 52 weekly, 26 biweekly, 24 semimonthly. Used to annualize wages for the IRS percentage method. */
  payPeriodsPerYear: number;
  filingStatus: FilingStatus;
  /** Form W-4 Step 3: qualifying children under 17 ($2,000/each) and other dependents ($500/each), annual tax credits. */
  qualifyingChildren: number;
  otherDependents: number;
  /** Traditional (pre-tax) 401(k) contribution, as a percent of gross pay. Reduces federal taxable wages but NOT FICA wages -- 401(k) contributions are still subject to Social Security and Medicare tax. */
  contribution401kPercent: number;
  /** USPS state code -- selects which state income tax rules apply (see lib/paycheck/stateTax). */
  state: string;
  /** User-entered deductions beyond 401(k) -- health/dental/vision insurance, HSA, FSA, Roth contributions, garnishments, etc. */
  otherDeductions: OtherDeductionInput[];
}

export interface PaycheckResult {
  grossPay: number;
  contribution401k: number;
  /** Gross pay minus the 401(k) contribution and any pre-tax "other" deductions -- what federal AND state income tax withholding is calculated on. */
  federalTaxableWages: number;
  socialSecurityTax: number;
  medicareTax: number;
  federalIncomeTax: number;
  stateIncomeTax: number;
  /** Rounded, in the order entered -- the canonical amounts summed into totalDeductions (zero/blank rows are dropped). */
  otherDeductions: OtherDeductionResult[];
  otherPreTaxTotal: number;
  otherPostTaxTotal: number;
  totalDeductions: number;
  netPay: number;
}
