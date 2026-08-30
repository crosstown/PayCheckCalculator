/**
 * FICA (Federal Insurance Contributions Act) tax for 2026.
 *
 * Social Security: 6.2% employee share, up to the 2026 wage base of
 * $184,500/year (SSA, effective 2026-01-01; up from $176,100 in 2025).
 * Medicare: 1.45% employee share, no wage cap.
 *
 * Both apply to gross wages BEFORE any traditional 401(k) reduction --
 * pre-tax retirement contributions reduce federal (and typically
 * state) income tax withholding, but are still fully subject to FICA.
 *
 * NOT modeled: the Social Security wage base cap requires knowing
 * year-to-date wages, which this calculator doesn't track (it
 * computes one pay period in isolation). For a high earner whose
 * year-to-date wages are already near/over $184,500, this will
 * overstate their Social Security withholding for this period. Also
 * not modeled: the Additional Medicare Tax (extra 0.9% on wages over
 * $200,000/yr single, $250,000/yr married filing jointly, $125,000/yr
 * married filing separately) -- also requires annual income context
 * this tool doesn't have.
 */
export const SOCIAL_SECURITY_RATE = 0.062;
export const SOCIAL_SECURITY_WAGE_BASE_2026 = 184500;
export const MEDICARE_RATE = 0.0145;

export interface FicaResult {
  socialSecurityTax: number;
  medicareTax: number;
}

export function calculateFica(grossPay: number): FicaResult {
  const socialSecurityTax = grossPay * SOCIAL_SECURITY_RATE;
  const medicareTax = grossPay * MEDICARE_RATE;
  return { socialSecurityTax, medicareTax };
}
