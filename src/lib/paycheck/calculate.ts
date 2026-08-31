import type { OtherDeductionResult, PaycheckInput, PaycheckResult } from "./types";
import { federalIncomeTaxWithholding } from "./federalWithholding2026";
import { calculateFica } from "./fica";
import { calculateStateTax } from "./stateTax/calculate";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculatePaycheck(input: PaycheckInput): PaycheckResult {
  const grossPay = Math.max(0, input.grossPay);
  const contribution401k = round2(
    grossPay * Math.max(0, Math.min(100, input.contribution401kPercent)) / 100,
  );

  // Round each "other deduction" line item BEFORE summing, same
  // reasoning as the tax line items below -- these are the exact
  // numbers shown on screen. Zero/blank rows are dropped rather than
  // shown as a $0.00 line.
  const otherDeductions: OtherDeductionResult[] = input.otherDeductions
    .map((d) => ({ ...d, amount: round2(Math.max(0, d.amount)) }))
    .filter((d) => d.amount > 0);

  const otherPreTaxTotal = round2(
    otherDeductions
      .filter((d) => d.taxTreatment === "preTax")
      .reduce((sum, d) => sum + d.amount, 0),
  );
  const otherPostTaxTotal = round2(
    otherDeductions
      .filter((d) => d.taxTreatment === "postTax")
      .reduce((sum, d) => sum + d.amount, 0),
  );

  // Section 125 pre-tax deductions (health/dental/vision insurance,
  // HSA, FSA) come out before FICA is computed -- unlike 401(k), which
  // reduces federal/state taxable wages but stays fully FICA-subject
  // (see fica.ts).
  const ficaWages = Math.max(0, round2(grossPay - otherPreTaxTotal));
  const federalTaxableWages = Math.max(
    0,
    round2(grossPay - contribution401k - otherPreTaxTotal),
  );

  const { socialSecurityTax, medicareTax } = calculateFica(ficaWages);

  const federalIncomeTax = federalIncomeTaxWithholding(
    federalTaxableWages,
    input.payPeriodsPerYear,
    input.filingStatus,
    Math.max(0, Math.floor(input.qualifyingChildren)),
    Math.max(0, Math.floor(input.otherDependents)),
  );

  // State tax uses the same post-401(k)/post-pre-tax-deduction taxable
  // wages as federal (both are pre-tax reductions for state purposes
  // too, in every state modeled here) -- see the state-tax notes
  // rendered alongside this for the handful of states (notably CA for
  // HSA, NJ for cafeteria-plan benefits generally) that don't actually
  // conform to this federal treatment.
  const stateIncomeTax = calculateStateTax(
    input.state,
    federalTaxableWages,
    input.payPeriodsPerYear,
    input.filingStatus,
  );

  // Round every line item BEFORE summing, not after -- these are the
  // exact numbers shown on screen, and totalDeductions/netPay must
  // equal what a user gets by adding up those displayed lines
  // themselves. Summing the raw (unrounded) values first and rounding
  // only the total is more "precise" in the abstract, but produces a
  // total that silently disagrees with its own displayed line items
  // by a cent -- worse for a financial tool than the itemized amounts
  // being individually rounded.
  const socialSecurityTaxRounded = round2(socialSecurityTax);
  const medicareTaxRounded = round2(medicareTax);
  const federalIncomeTaxRounded = round2(federalIncomeTax);
  const stateIncomeTaxRounded = round2(stateIncomeTax);

  const totalDeductions = round2(
    contribution401k +
      otherPreTaxTotal +
      otherPostTaxTotal +
      socialSecurityTaxRounded +
      medicareTaxRounded +
      federalIncomeTaxRounded +
      stateIncomeTaxRounded,
  );
  const netPay = round2(grossPay - totalDeductions);

  return {
    grossPay: round2(grossPay),
    contribution401k,
    federalTaxableWages,
    socialSecurityTax: socialSecurityTaxRounded,
    medicareTax: medicareTaxRounded,
    federalIncomeTax: federalIncomeTaxRounded,
    stateIncomeTax: stateIncomeTaxRounded,
    otherDeductions,
    otherPreTaxTotal,
    otherPostTaxTotal,
    totalDeductions,
    netPay,
  };
}
