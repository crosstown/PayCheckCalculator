import type { FilingStatus } from "./types";

/**
 * 2026 federal income tax withholding -- IRS Publication 15-T (2026),
 * "Percentage Method Tables for Automated Payroll Systems," STANDARD
 * Withholding Rate Schedules (Annual), transcribed from the published
 * PDF (irs.gov/pub/irs-pdf/p15t.pdf, page 12). These reflect the
 * permanent TCJA-era rate structure as extended by the One Big
 * Beautiful Bill Act (P.L. 119-21).
 *
 * "Standard withholding" is the table used when the employee's Form
 * W-4 is from 2019 or earlier, OR is a 2020-or-later W-4 with the
 * Step 2 (multiple jobs) checkbox NOT checked -- i.e. the common
 * case. This implementation does not model the alternate "Step 2
 * checkbox" table (higher withholding for a second job), nor Form
 * W-4 Step 4(a)/4(b) (other income / additional deductions) or
 * Step 4(c) (extra per-period withholding) -- all assumed $0/unused,
 * matching a single-job employee taking the standard deduction with
 * no extra elections. This is the same "general case" simplification
 * pattern used throughout this calculator (see the overtime rules'
 * disclaimers).
 */
export interface WithholdingBracket {
  atLeast: number;
  lessThan: number; // Infinity for the top bracket
  baseTax: number;
  rate: number; // e.g. 0.22 for 22%
}

const MARRIED_JOINTLY: WithholdingBracket[] = [
  { atLeast: 0, lessThan: 19300, baseTax: 0, rate: 0 },
  { atLeast: 19300, lessThan: 44100, baseTax: 0, rate: 0.1 },
  { atLeast: 44100, lessThan: 120100, baseTax: 2480, rate: 0.12 },
  { atLeast: 120100, lessThan: 230700, baseTax: 11600, rate: 0.22 },
  { atLeast: 230700, lessThan: 422850, baseTax: 35932, rate: 0.24 },
  { atLeast: 422850, lessThan: 531750, baseTax: 82048, rate: 0.32 },
  { atLeast: 531750, lessThan: 788000, baseTax: 116896, rate: 0.35 },
  { atLeast: 788000, lessThan: Infinity, baseTax: 206583.5, rate: 0.37 },
];

const SINGLE_OR_MFS: WithholdingBracket[] = [
  { atLeast: 0, lessThan: 7500, baseTax: 0, rate: 0 },
  { atLeast: 7500, lessThan: 19900, baseTax: 0, rate: 0.1 },
  { atLeast: 19900, lessThan: 57900, baseTax: 1240, rate: 0.12 },
  { atLeast: 57900, lessThan: 113200, baseTax: 5800, rate: 0.22 },
  { atLeast: 113200, lessThan: 209275, baseTax: 17966, rate: 0.24 },
  { atLeast: 209275, lessThan: 263725, baseTax: 41024, rate: 0.32 },
  { atLeast: 263725, lessThan: 648100, baseTax: 58448, rate: 0.35 },
  { atLeast: 648100, lessThan: Infinity, baseTax: 192979.25, rate: 0.37 },
];

const HEAD_OF_HOUSEHOLD: WithholdingBracket[] = [
  { atLeast: 0, lessThan: 15550, baseTax: 0, rate: 0 },
  { atLeast: 15550, lessThan: 33250, baseTax: 0, rate: 0.1 },
  { atLeast: 33250, lessThan: 83000, baseTax: 1770, rate: 0.12 },
  { atLeast: 83000, lessThan: 121250, baseTax: 7740, rate: 0.22 },
  { atLeast: 121250, lessThan: 217300, baseTax: 16155, rate: 0.24 },
  { atLeast: 217300, lessThan: 271750, baseTax: 39207, rate: 0.32 },
  { atLeast: 271750, lessThan: 656150, baseTax: 56631, rate: 0.35 },
  { atLeast: 656150, lessThan: Infinity, baseTax: 191171, rate: 0.37 },
];

const TABLES: Record<FilingStatus, WithholdingBracket[]> = {
  marriedJointly: MARRIED_JOINTLY,
  single: SINGLE_OR_MFS,
  headOfHousehold: HEAD_OF_HOUSEHOLD,
};

/** Form W-4 Step 3 annual credit amounts (unchanged since the 2018 TCJA structure). */
export const CHILD_TAX_CREDIT_PER_CHILD = 2000;
export const OTHER_DEPENDENT_CREDIT = 500;

function annualTentativeTax(filingStatus: FilingStatus, annualWages: number): number {
  const table = TABLES[filingStatus];
  const bracket = table.find((b) => annualWages >= b.atLeast && annualWages < b.lessThan);
  const b = bracket ?? table[table.length - 1];
  return b.baseTax + b.rate * (annualWages - b.atLeast);
}

/**
 * IRS Pub 15-T Worksheet 1A, Steps 2-3 (Step 1's wage annualization
 * and Step 4's extra per-period withholding are handled by the
 * caller / not modeled -- see file header).
 */
export function federalIncomeTaxWithholding(
  periodTaxableWages: number,
  payPeriodsPerYear: number,
  filingStatus: FilingStatus,
  qualifyingChildren: number,
  otherDependents: number,
): number {
  const annualWages = periodTaxableWages * payPeriodsPerYear;
  const tentativeAnnualTax = annualTentativeTax(filingStatus, annualWages);
  const tentativePeriodTax = tentativeAnnualTax / payPeriodsPerYear;

  const annualCredits =
    qualifyingChildren * CHILD_TAX_CREDIT_PER_CHILD + otherDependents * OTHER_DEPENDENT_CREDIT;
  const periodCredits = annualCredits / payPeriodsPerYear;

  return Math.max(0, tentativePeriodTax - periodCredits);
}
