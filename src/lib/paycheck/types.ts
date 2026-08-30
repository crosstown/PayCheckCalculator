export type FilingStatus = "single" | "marriedJointly" | "headOfHousehold";

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
}

export interface PaycheckResult {
  grossPay: number;
  contribution401k: number;
  /** Gross pay minus the 401(k) contribution -- what federal income tax withholding is calculated on. */
  federalTaxableWages: number;
  socialSecurityTax: number;
  medicareTax: number;
  federalIncomeTax: number;
  totalDeductions: number;
  netPay: number;
}
