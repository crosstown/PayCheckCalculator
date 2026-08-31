import type { PaycheckInput, PaycheckResult } from "./types";
import { federalIncomeTaxWithholding } from "./federalWithholding2026";
import { calculateFica } from "./fica";
import { calculateStateTax } from "./stateTax/calculate";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculatePaycheck(input: PaycheckInput): PaycheckResult {
  const grossPay = Math.max(0, input.grossPay);
  const contribution401k = round2(
    grossPay * Math.max(0, Math.min(100, input.contribution401kPercent)) / 100,
  );
  const federalTaxableWages = round2(grossPay - contribution401k);

  // FICA is computed on gross pay, NOT federalTaxableWages -- 401(k)
  // contributions don't reduce FICA wages (see fica.ts).
  const { socialSecurityTax, medicareTax } = calculateFica(grossPay);

  const federalIncomeTax = federalIncomeTaxWithholding(
    federalTaxableWages,
    input.payPeriodsPerYear,
    input.filingStatus,
    Math.max(0, Math.floor(input.qualifyingChildren)),
    Math.max(0, Math.floor(input.otherDependents)),
  );

  // State tax uses the same post-401(k) taxable wages as federal
  // (both are pre-tax reductions for state purposes too, in every
  // state modeled here).
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
    totalDeductions,
    netPay,
  };
}
