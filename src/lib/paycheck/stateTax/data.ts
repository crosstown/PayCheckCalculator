import type { StateTaxRules } from "./types";

/**
 * 2026 state individual income tax withholding data for all 50 states
 * + DC, for the paycheck deductions calculator.
 *
 * PRIMARY SOURCE: Tax Foundation, "2026 State Individual Income Tax
 * Rates and Brackets" (taxfoundation.org/data/all/state/state-income-tax-rates-2026/),
 * a well-established, widely-cited comparative source -- used as the
 * base for all 41 taxable states rather than 41 independent per-state
 * lookups, the same "one aggregated source, not 41 individual ones"
 * tradeoff already applied elsewhere in this project. This was NOT
 * independently re-verified against all 41 states' own Departments of
 * Revenue.
 *
 * THREE STATES caught real errors/gaps in that aggregated source and
 * WERE independently verified against primary sources before being
 * corrected here:
 * - Georgia: aggregator said 5.19%; Georgia's own DOR (2026
 *   Employer's Withholding Tax Guide, June 2026 revision) confirms
 *   4.99%, retroactive to 2026-01-01 via HB 463.
 * - Louisiana: aggregator's bracket data was internally inconsistent
 *   ("3.00% (and 4.00% bracket)"); Louisiana DOR confirms a genuinely
 *   flat 3% (voter-approved Nov 2024, effective for 2025+), with a
 *   $12,500/$25,000 personal exemption.
 * - Kansas: aggregator omitted the separate married-filing-jointly
 *   bracket threshold; confirmed via KS legislature/DOR sources as
 *   $46,000 (exactly double the $23,000 single threshold), and the
 *   $9,160/$18,320 personal exemption amounts.
 *
 * SCOPE LIMITATIONS (disclosed in the UI, not hidden):
 * - State-level only. No local/municipal income tax (NYC, many Ohio
 *   cities, Pennsylvania municipalities, Maryland counties, Kentucky
 *   occupational taxes, etc.) -- a whole separate undertaking, out of
 *   scope per explicit decision.
 * - No state-specific dependent credits/deductions modeled (several
 *   states have them; skipped for the same reason multi-state daily-
 *   overtime edge cases were skipped elsewhere -- scope control, not
 *   an oversight). Federal dependent credits are still applied in the
 *   federal section.
 * - Head of Household uses each state's Single-filer brackets and
 *   deduction/exemption amounts -- almost no state publishes a
 *   separate HOH schedule, and this source didn't provide one for any
 *   of them.
 * - For flat-rate states where Tax Foundation's comparison table
 *   didn't include a specific standard deduction/personal exemption
 *   figure (most of the 15 flat-rate states, Georgia excepted since
 *   it was independently verified), no deduction is applied --
 *   flagged per-state below with `notes`, not silently assumed to be
 *   $0 by omission.
 */

const noStateIncomeTax = (state: string, stateName: string, note?: string): StateTaxRules => ({
  state,
  stateName,
  hasIncomeTax: false,
  citation: "No individual wage income tax",
  notes: note ? [note] : undefined,
});

const flat = (
  state: string,
  stateName: string,
  rate: number,
  citation: string,
  notes: string[],
): StateTaxRules => ({
  state,
  stateName,
  hasIncomeTax: true,
  citation,
  brackets: {
    single: [{ atLeast: 0, rate }],
    marriedJointly: [{ atLeast: 0, rate }],
    headOfHousehold: [{ atLeast: 0, rate }],
  },
  notes,
});

const NO_DEDUCTION_DATA_NOTE =
  "This state's specific standard deduction/personal exemption amount wasn't in the source used for this calculator, so none is applied here -- actual withholding is likely somewhat lower than this estimate.";

export const STATE_TAX_RULES: Record<string, StateTaxRules> = {
  // ---- No state income tax on wages (9) ----
  AK: noStateIncomeTax("AK", "Alaska"),
  FL: noStateIncomeTax("FL", "Florida"),
  NV: noStateIncomeTax("NV", "Nevada"),
  NH: noStateIncomeTax("NH", "New Hampshire"),
  SD: noStateIncomeTax("SD", "South Dakota"),
  TN: noStateIncomeTax("TN", "Tennessee"),
  TX: noStateIncomeTax("TX", "Texas"),
  WY: noStateIncomeTax("WY", "Wyoming"),
  WA: noStateIncomeTax(
    "WA",
    "Washington",
    "Washington has no tax on wage income. It does have a 7%/9% tax on capital gains above $1,000,000, which doesn't apply to paycheck wages and isn't relevant here.",
  ),

  // ---- Flat-rate states (verified figures where noted; deduction data gaps flagged) ----
  AZ: flat("AZ", "Arizona", 0.025, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
  ]),
  CO: flat("CO", "Colorado", 0.044, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
  ]),
  GA: {
    state: "GA",
    stateName: "Georgia",
    hasIncomeTax: true,
    citation: "Georgia DOR, 2026 Employer's Withholding Tax Guide (revised June 2026), HB 463",
    brackets: {
      single: [{ atLeast: 0, rate: 0.0499 }],
      marriedJointly: [{ atLeast: 0, rate: 0.0499 }],
      headOfHousehold: [{ atLeast: 0, rate: 0.0499 }],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 15000, marriedJointly: 30000, headOfHousehold: 15000 },
    },
    notes: [
      "Rate cut to 4.99% (from 5.19%) via HB 463, retroactive to 2026-01-01 -- verified directly against Georgia DOR, not just the general comparison source used for other states.",
    ],
  },
  ID: flat("ID", "Idaho", 0.053, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
  ]),
  IL: flat("IL", "Illinois", 0.0495, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
  ]),
  IN: flat("IN", "Indiana", 0.0295, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
    "Does not include Indiana's county income taxes (out of scope -- local tax, see file header).",
  ]),
  IA: flat("IA", "Iowa", 0.038, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
  ]),
  KY: flat("KY", "Kentucky", 0.035, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
    "Does not include Kentucky's local occupational taxes (out of scope -- local tax, see file header).",
  ]),
  LA: {
    state: "LA",
    stateName: "Louisiana",
    hasIncomeTax: true,
    citation: "Louisiana Department of Revenue (flat rate effective 2025+, voter-approved Nov. 2024)",
    brackets: {
      single: [{ atLeast: 0, rate: 0.03 }],
      marriedJointly: [{ atLeast: 0, rate: 0.03 }],
      headOfHousehold: [{ atLeast: 0, rate: 0.03 }],
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 12500, marriedJointly: 25000, headOfHousehold: 12500 },
    },
    notes: [
      "Verified directly against Louisiana DOR -- the general comparison source used for other states had inconsistent bracket data for Louisiana.",
    ],
  },
  MI: flat("MI", "Michigan", 0.0425, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
    "Does not include Michigan cities' local income taxes, e.g. Detroit (out of scope -- local tax, see file header).",
  ]),
  MS: flat("MS", "Mississippi", 0.04, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
  ]),
  NC: flat("NC", "North Carolina", 0.0399, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    NO_DEDUCTION_DATA_NOTE,
  ]),
  PA: flat("PA", "Pennsylvania", 0.0307, "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets", [
    "Pennsylvania has no standard deduction or personal exemption -- this is correct, not a data gap; PA taxes wages from the first dollar.",
    "Does not include Pennsylvania municipalities' local Earned Income Tax, which most PA residents also owe (out of scope -- local tax, see file header).",
  ]),

  // ---- Kansas: 2-bracket, verified married threshold + exemption ----
  KS: {
    state: "KS",
    stateName: "Kansas",
    hasIncomeTax: true,
    citation: "Kansas DOR / KS Legislature (2024 reform, 2 brackets)",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.052 },
        { atLeast: 23000, rate: 0.0558 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.052 },
        { atLeast: 46000, rate: 0.0558 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.052 },
        { atLeast: 23000, rate: 0.0558 },
      ],
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 9160, marriedJointly: 18320, headOfHousehold: 9160 },
    },
    notes: [
      "Married-filing-jointly bracket threshold and exemption verified directly -- the general comparison source used for other states only gave the single-filer figures for Kansas.",
    ],
  },

  // ---- Missouri: genuinely graduated (7 brackets), despite sometimes being grouped with flat-rate states ----
  MO: {
    state: "MO",
    stateName: "Missouri",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 1348, rate: 0.02 },
        { atLeast: 2696, rate: 0.025 },
        { atLeast: 4044, rate: 0.03 },
        { atLeast: 5392, rate: 0.035 },
        { atLeast: 6740, rate: 0.04 },
        { atLeast: 8088, rate: 0.045 },
        { atLeast: 9436, rate: 0.047 },
      ],
      marriedJointly: [
        { atLeast: 1348, rate: 0.02 },
        { atLeast: 2696, rate: 0.025 },
        { atLeast: 4044, rate: 0.03 },
        { atLeast: 5392, rate: 0.035 },
        { atLeast: 6740, rate: 0.04 },
        { atLeast: 8088, rate: 0.045 },
        { atLeast: 9436, rate: 0.047 },
      ],
      headOfHousehold: [
        { atLeast: 1348, rate: 0.02 },
        { atLeast: 2696, rate: 0.025 },
        { atLeast: 4044, rate: 0.03 },
        { atLeast: 5392, rate: 0.035 },
        { atLeast: 6740, rate: 0.04 },
        { atLeast: 8088, rate: 0.045 },
        { atLeast: 9436, rate: 0.047 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 16100, marriedJointly: 32200, headOfHousehold: 16100 },
    },
  },

  // ---- Utah: single bracket, but its "standard deduction" is actually a tax CREDIT ----
  UT: {
    state: "UT",
    stateName: "Utah",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [{ atLeast: 0, rate: 0.045 }],
      marriedJointly: [{ atLeast: 0, rate: 0.045 }],
      headOfHousehold: [{ atLeast: 0, rate: 0.045 }],
    },
    standardDeduction: {
      type: "credit",
      amounts: { single: 966, marriedJointly: 1932, headOfHousehold: 966 },
    },
    notes: [
      "Utah's \"standard deduction\" is actually structured as a tax credit (its Taxpayer Tax Credit), not a reduction to taxable wages -- applied here as a credit against computed tax, matching how Utah's own guidance describes it.",
    ],
  },

  // ---- Graduated-bracket states + DC ----
  AL: {
    state: "AL",
    stateName: "Alabama",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 500, rate: 0.04 },
        { atLeast: 3000, rate: 0.05 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 1000, rate: 0.04 },
        { atLeast: 6000, rate: 0.05 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 500, rate: 0.04 },
        { atLeast: 3000, rate: 0.05 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 3000, marriedJointly: 8500, headOfHousehold: 3000 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 1500, marriedJointly: 3000, headOfHousehold: 1500 },
    },
  },
  AR: {
    state: "AR",
    stateName: "Arkansas",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 4600, rate: 0.039 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 4600, rate: 0.039 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 4600, rate: 0.039 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 2470, marriedJointly: 4940, headOfHousehold: 2470 },
    },
    personalExemption: {
      type: "credit",
      amounts: { single: 29, marriedJointly: 58, headOfHousehold: 29 },
    },
  },
  CA: {
    state: "CA",
    stateName: "California",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.01 },
        { atLeast: 11079, rate: 0.02 },
        { atLeast: 26264, rate: 0.04 },
        { atLeast: 41452, rate: 0.06 },
        { atLeast: 57542, rate: 0.08 },
        { atLeast: 72724, rate: 0.093 },
        { atLeast: 371479, rate: 0.103 },
        { atLeast: 445771, rate: 0.113 },
        { atLeast: 742953, rate: 0.123 },
        { atLeast: 1000000, rate: 0.133 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.01 },
        { atLeast: 22158, rate: 0.02 },
        { atLeast: 52528, rate: 0.04 },
        { atLeast: 82904, rate: 0.06 },
        { atLeast: 115084, rate: 0.08 },
        { atLeast: 145448, rate: 0.093 },
        { atLeast: 742958, rate: 0.103 },
        { atLeast: 891542, rate: 0.113 },
        { atLeast: 1485906, rate: 0.123 },
        { atLeast: 2000000, rate: 0.133 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.01 },
        { atLeast: 11079, rate: 0.02 },
        { atLeast: 26264, rate: 0.04 },
        { atLeast: 41452, rate: 0.06 },
        { atLeast: 57542, rate: 0.08 },
        { atLeast: 72724, rate: 0.093 },
        { atLeast: 371479, rate: 0.103 },
        { atLeast: 445771, rate: 0.113 },
        { atLeast: 742953, rate: 0.123 },
        { atLeast: 1000000, rate: 0.133 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 5540, marriedJointly: 11080, headOfHousehold: 5540 },
    },
    personalExemption: {
      type: "credit",
      amounts: { single: 153, marriedJointly: 306, headOfHousehold: 153 },
    },
    notes: [
      "Doesn't include California's 1% Mental Health Services surcharge on income over $1,000,000.",
    ],
  },
  CT: {
    state: "CT",
    stateName: "Connecticut",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 10000, rate: 0.045 },
        { atLeast: 50000, rate: 0.055 },
        { atLeast: 100000, rate: 0.06 },
        { atLeast: 200000, rate: 0.065 },
        { atLeast: 250000, rate: 0.069 },
        { atLeast: 500000, rate: 0.0699 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 20000, rate: 0.045 },
        { atLeast: 100000, rate: 0.055 },
        { atLeast: 200000, rate: 0.06 },
        { atLeast: 400000, rate: 0.065 },
        { atLeast: 500000, rate: 0.069 },
        { atLeast: 1000000, rate: 0.0699 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 10000, rate: 0.045 },
        { atLeast: 50000, rate: 0.055 },
        { atLeast: 100000, rate: 0.06 },
        { atLeast: 200000, rate: 0.065 },
        { atLeast: 250000, rate: 0.069 },
        { atLeast: 500000, rate: 0.0699 },
      ],
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 15000, marriedJointly: 24000, headOfHousehold: 15000 },
    },
    notes: [
      "Connecticut has no separate standard deduction -- only the personal exemption shown. That exemption actually phases out above certain income levels (not modeled here; applied as a flat amount, so this may understate tax for higher earners).",
    ],
  },
  DE: {
    state: "DE",
    stateName: "Delaware",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 2000, rate: 0.022 },
        { atLeast: 5000, rate: 0.039 },
        { atLeast: 10000, rate: 0.048 },
        { atLeast: 20000, rate: 0.052 },
        { atLeast: 25000, rate: 0.0555 },
        { atLeast: 60000, rate: 0.066 },
      ],
      marriedJointly: [
        { atLeast: 2000, rate: 0.022 },
        { atLeast: 5000, rate: 0.039 },
        { atLeast: 10000, rate: 0.048 },
        { atLeast: 20000, rate: 0.052 },
        { atLeast: 25000, rate: 0.0555 },
        { atLeast: 60000, rate: 0.066 },
      ],
      headOfHousehold: [
        { atLeast: 2000, rate: 0.022 },
        { atLeast: 5000, rate: 0.039 },
        { atLeast: 10000, rate: 0.048 },
        { atLeast: 20000, rate: 0.052 },
        { atLeast: 25000, rate: 0.0555 },
        { atLeast: 60000, rate: 0.066 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 3250, marriedJointly: 6500, headOfHousehold: 3250 },
    },
    personalExemption: {
      type: "credit",
      amounts: { single: 110, marriedJointly: 220, headOfHousehold: 110 },
    },
  },
  HI: {
    state: "HI",
    stateName: "Hawaii",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.014 },
        { atLeast: 9600, rate: 0.032 },
        { atLeast: 14400, rate: 0.055 },
        { atLeast: 19200, rate: 0.064 },
        { atLeast: 24000, rate: 0.068 },
        { atLeast: 36000, rate: 0.072 },
        { atLeast: 48000, rate: 0.076 },
        { atLeast: 125000, rate: 0.079 },
        { atLeast: 175000, rate: 0.0825 },
        { atLeast: 225000, rate: 0.09 },
        { atLeast: 275000, rate: 0.1 },
        { atLeast: 325000, rate: 0.11 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.014 },
        { atLeast: 19200, rate: 0.032 },
        { atLeast: 28800, rate: 0.055 },
        { atLeast: 38400, rate: 0.064 },
        { atLeast: 48000, rate: 0.068 },
        { atLeast: 72000, rate: 0.072 },
        { atLeast: 96000, rate: 0.076 },
        { atLeast: 250000, rate: 0.079 },
        { atLeast: 350000, rate: 0.0825 },
        { atLeast: 450000, rate: 0.09 },
        { atLeast: 550000, rate: 0.1 },
        { atLeast: 650000, rate: 0.11 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.014 },
        { atLeast: 9600, rate: 0.032 },
        { atLeast: 14400, rate: 0.055 },
        { atLeast: 19200, rate: 0.064 },
        { atLeast: 24000, rate: 0.068 },
        { atLeast: 36000, rate: 0.072 },
        { atLeast: 48000, rate: 0.076 },
        { atLeast: 125000, rate: 0.079 },
        { atLeast: 175000, rate: 0.0825 },
        { atLeast: 225000, rate: 0.09 },
        { atLeast: 275000, rate: 0.1 },
        { atLeast: 325000, rate: 0.11 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 4400, marriedJointly: 8800, headOfHousehold: 4400 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 1144, marriedJointly: 2288, headOfHousehold: 1144 },
    },
  },
  ME: {
    state: "ME",
    stateName: "Maine",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.058 },
        { atLeast: 27399, rate: 0.0675 },
        { atLeast: 64849, rate: 0.0715 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.058 },
        { atLeast: 54849, rate: 0.0675 },
        { atLeast: 129749, rate: 0.0715 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.058 },
        { atLeast: 27399, rate: 0.0675 },
        { atLeast: 64849, rate: 0.0715 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 8350, marriedJointly: 16700, headOfHousehold: 8350 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 5300, marriedJointly: 10600, headOfHousehold: 5300 },
    },
  },
  MD: {
    state: "MD",
    stateName: "Maryland",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 1000, rate: 0.03 },
        { atLeast: 2000, rate: 0.04 },
        { atLeast: 3000, rate: 0.0475 },
        { atLeast: 100000, rate: 0.05 },
        { atLeast: 125000, rate: 0.0525 },
        { atLeast: 150000, rate: 0.055 },
        { atLeast: 250000, rate: 0.0575 },
        { atLeast: 500000, rate: 0.0625 },
        { atLeast: 1000000, rate: 0.065 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 1000, rate: 0.03 },
        { atLeast: 2000, rate: 0.04 },
        { atLeast: 3000, rate: 0.0475 },
        { atLeast: 150000, rate: 0.05 },
        { atLeast: 175000, rate: 0.0525 },
        { atLeast: 225000, rate: 0.055 },
        { atLeast: 300000, rate: 0.0575 },
        { atLeast: 600000, rate: 0.0625 },
        { atLeast: 1200000, rate: 0.065 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 1000, rate: 0.03 },
        { atLeast: 2000, rate: 0.04 },
        { atLeast: 3000, rate: 0.0475 },
        { atLeast: 100000, rate: 0.05 },
        { atLeast: 125000, rate: 0.0525 },
        { atLeast: 150000, rate: 0.055 },
        { atLeast: 250000, rate: 0.0575 },
        { atLeast: 500000, rate: 0.0625 },
        { atLeast: 1000000, rate: 0.065 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 3350, marriedJointly: 6700, headOfHousehold: 3350 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 3200, marriedJointly: 6400, headOfHousehold: 3200 },
    },
    notes: [
      "Doesn't include Maryland's county-level local income taxes, which every MD resident also owes on top of this (out of scope -- local tax, see file header). Maryland's local rates are typically substantial (often 2.25%-3.2%), so this notably understates actual total Maryland withholding.",
    ],
  },
  MA: {
    state: "MA",
    stateName: "Massachusetts",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.05 },
        { atLeast: 1083150, rate: 0.09 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.05 },
        { atLeast: 1083150, rate: 0.09 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.05 },
        { atLeast: 1083150, rate: 0.09 },
      ],
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 4400, marriedJointly: 8800, headOfHousehold: 4400 },
    },
  },
  MN: {
    state: "MN",
    stateName: "Minnesota",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.0535 },
        { atLeast: 33310, rate: 0.068 },
        { atLeast: 109430, rate: 0.0785 },
        { atLeast: 203150, rate: 0.0985 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.0535 },
        { atLeast: 48700, rate: 0.068 },
        { atLeast: 193480, rate: 0.0785 },
        { atLeast: 337930, rate: 0.0985 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.0535 },
        { atLeast: 33310, rate: 0.068 },
        { atLeast: 109430, rate: 0.0785 },
        { atLeast: 203150, rate: 0.0985 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 15300, marriedJointly: 30600, headOfHousehold: 15300 },
    },
  },
  MT: {
    state: "MT",
    stateName: "Montana",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.047 },
        { atLeast: 47500, rate: 0.0565 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.047 },
        { atLeast: 95000, rate: 0.0565 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.047 },
        { atLeast: 47500, rate: 0.0565 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 16100, marriedJointly: 32200, headOfHousehold: 16100 },
    },
  },
  NE: {
    state: "NE",
    stateName: "Nebraska",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.0246 },
        { atLeast: 4130, rate: 0.0351 },
        { atLeast: 24760, rate: 0.0455 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.0246 },
        { atLeast: 8250, rate: 0.0351 },
        { atLeast: 49530, rate: 0.0455 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.0246 },
        { atLeast: 4130, rate: 0.0351 },
        { atLeast: 24760, rate: 0.0455 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 8850, marriedJointly: 17700, headOfHousehold: 8850 },
    },
    personalExemption: {
      type: "credit",
      amounts: { single: 176, marriedJointly: 352, headOfHousehold: 176 },
    },
  },
  NJ: {
    state: "NJ",
    stateName: "New Jersey",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.014 },
        { atLeast: 20000, rate: 0.0175 },
        { atLeast: 35000, rate: 0.035 },
        { atLeast: 40000, rate: 0.0553 },
        { atLeast: 75000, rate: 0.0637 },
        { atLeast: 500000, rate: 0.0897 },
        { atLeast: 1000000, rate: 0.1075 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.014 },
        { atLeast: 20000, rate: 0.0175 },
        { atLeast: 50000, rate: 0.0245 },
        { atLeast: 70000, rate: 0.035 },
        { atLeast: 80000, rate: 0.0553 },
        { atLeast: 150000, rate: 0.0637 },
        { atLeast: 500000, rate: 0.0897 },
        { atLeast: 1000000, rate: 0.1075 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.014 },
        { atLeast: 20000, rate: 0.0175 },
        { atLeast: 35000, rate: 0.035 },
        { atLeast: 40000, rate: 0.0553 },
        { atLeast: 75000, rate: 0.0637 },
        { atLeast: 500000, rate: 0.0897 },
        { atLeast: 1000000, rate: 0.1075 },
      ],
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 1000, marriedJointly: 2000, headOfHousehold: 1000 },
    },
  },
  NM: {
    state: "NM",
    stateName: "New Mexico",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.015 },
        { atLeast: 5500, rate: 0.032 },
        { atLeast: 16500, rate: 0.043 },
        { atLeast: 33500, rate: 0.047 },
        { atLeast: 66500, rate: 0.049 },
        { atLeast: 210000, rate: 0.059 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.015 },
        { atLeast: 8000, rate: 0.032 },
        { atLeast: 25000, rate: 0.043 },
        { atLeast: 50000, rate: 0.047 },
        { atLeast: 100000, rate: 0.049 },
        { atLeast: 315000, rate: 0.059 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.015 },
        { atLeast: 5500, rate: 0.032 },
        { atLeast: 16500, rate: 0.043 },
        { atLeast: 33500, rate: 0.047 },
        { atLeast: 66500, rate: 0.049 },
        { atLeast: 210000, rate: 0.059 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 16100, marriedJointly: 32200, headOfHousehold: 16100 },
    },
  },
  NY: {
    state: "NY",
    stateName: "New York",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.039 },
        { atLeast: 8500, rate: 0.044 },
        { atLeast: 11700, rate: 0.0515 },
        { atLeast: 13900, rate: 0.054 },
        { atLeast: 80650, rate: 0.059 },
        { atLeast: 215400, rate: 0.0685 },
        { atLeast: 1077550, rate: 0.0965 },
        { atLeast: 5000000, rate: 0.103 },
        { atLeast: 25000000, rate: 0.109 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.039 },
        { atLeast: 17150, rate: 0.044 },
        { atLeast: 23600, rate: 0.0515 },
        { atLeast: 27900, rate: 0.054 },
        { atLeast: 161550, rate: 0.059 },
        { atLeast: 323200, rate: 0.0685 },
        { atLeast: 2155350, rate: 0.0965 },
        { atLeast: 5000000, rate: 0.103 },
        { atLeast: 25000000, rate: 0.109 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.039 },
        { atLeast: 8500, rate: 0.044 },
        { atLeast: 11700, rate: 0.0515 },
        { atLeast: 13900, rate: 0.054 },
        { atLeast: 80650, rate: 0.059 },
        { atLeast: 215400, rate: 0.0685 },
        { atLeast: 1077550, rate: 0.0965 },
        { atLeast: 5000000, rate: 0.103 },
        { atLeast: 25000000, rate: 0.109 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 8000, marriedJointly: 16050, headOfHousehold: 8000 },
    },
    notes: [
      "Doesn't include New York City's (or Yonkers') local income tax, which NYC residents also owe on top of this (out of scope -- local tax, see file header).",
    ],
  },
  ND: {
    state: "ND",
    stateName: "North Dakota",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0 },
        { atLeast: 48475, rate: 0.0195 },
        { atLeast: 244825, rate: 0.025 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0 },
        { atLeast: 80975, rate: 0.0195 },
        { atLeast: 298075, rate: 0.025 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0 },
        { atLeast: 48475, rate: 0.0195 },
        { atLeast: 244825, rate: 0.025 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 16100, marriedJointly: 32200, headOfHousehold: 16100 },
    },
  },
  OH: {
    state: "OH",
    stateName: "Ohio",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0 },
        { atLeast: 26050, rate: 0.0275 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0 },
        { atLeast: 26050, rate: 0.0275 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0 },
        { atLeast: 26050, rate: 0.0275 },
      ],
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 2400, marriedJointly: 4800, headOfHousehold: 2400 },
    },
    notes: [
      "Ohio's personal exemption phases out at higher incomes (not modeled here -- applied as a flat amount).",
      "Doesn't include Ohio municipalities' local income taxes, which most Ohio residents also owe (out of scope -- local tax, see file header).",
    ],
  },
  OK: {
    state: "OK",
    stateName: "Oklahoma",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 3750, rate: 0.025 },
        { atLeast: 4900, rate: 0.035 },
        { atLeast: 7200, rate: 0.045 },
      ],
      marriedJointly: [
        { atLeast: 7500, rate: 0.025 },
        { atLeast: 9800, rate: 0.035 },
        { atLeast: 14400, rate: 0.045 },
      ],
      headOfHousehold: [
        { atLeast: 3750, rate: 0.025 },
        { atLeast: 4900, rate: 0.035 },
        { atLeast: 7200, rate: 0.045 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 6350, marriedJointly: 12700, headOfHousehold: 6350 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 1000, marriedJointly: 2000, headOfHousehold: 1000 },
    },
  },
  OR: {
    state: "OR",
    stateName: "Oregon",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.0475 },
        { atLeast: 4550, rate: 0.0675 },
        { atLeast: 11400, rate: 0.0875 },
        { atLeast: 125000, rate: 0.099 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.0475 },
        { atLeast: 9100, rate: 0.0675 },
        { atLeast: 22800, rate: 0.0875 },
        { atLeast: 250000, rate: 0.099 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.0475 },
        { atLeast: 4550, rate: 0.0675 },
        { atLeast: 11400, rate: 0.0875 },
        { atLeast: 125000, rate: 0.099 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 2910, marriedJointly: 5820, headOfHousehold: 2910 },
    },
    personalExemption: {
      type: "credit",
      amounts: { single: 256, marriedJointly: 512, headOfHousehold: 256 },
    },
  },
  RI: {
    state: "RI",
    stateName: "Rhode Island",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.0375 },
        { atLeast: 82050, rate: 0.0475 },
        { atLeast: 186450, rate: 0.0599 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.0375 },
        { atLeast: 82050, rate: 0.0475 },
        { atLeast: 186450, rate: 0.0599 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.0375 },
        { atLeast: 82050, rate: 0.0475 },
        { atLeast: 186450, rate: 0.0599 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 11200, marriedJointly: 22400, headOfHousehold: 11200 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 5250, marriedJointly: 10500, headOfHousehold: 5250 },
    },
  },
  SC: {
    state: "SC",
    stateName: "South Carolina",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0 },
        { atLeast: 3640, rate: 0.03 },
        { atLeast: 18230, rate: 0.06 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0 },
        { atLeast: 3640, rate: 0.03 },
        { atLeast: 18230, rate: 0.06 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0 },
        { atLeast: 3640, rate: 0.03 },
        { atLeast: 18230, rate: 0.06 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 8350, marriedJointly: 16700, headOfHousehold: 8350 },
    },
    notes: [
      "South Carolina's top rate is scheduled to revert from 6% to 6.2% on 2026-07-01 -- this uses the rate in effect at the start of 2026.",
    ],
  },
  VT: {
    state: "VT",
    stateName: "Vermont",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.0335 },
        { atLeast: 49400, rate: 0.066 },
        { atLeast: 119700, rate: 0.076 },
        { atLeast: 249700, rate: 0.0875 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.0335 },
        { atLeast: 82500, rate: 0.066 },
        { atLeast: 199450, rate: 0.076 },
        { atLeast: 304000, rate: 0.0875 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.0335 },
        { atLeast: 49400, rate: 0.066 },
        { atLeast: 119700, rate: 0.076 },
        { atLeast: 249700, rate: 0.0875 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 7650, marriedJointly: 15300, headOfHousehold: 7650 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 5300, marriedJointly: 10600, headOfHousehold: 5300 },
    },
  },
  VA: {
    state: "VA",
    stateName: "Virginia",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 3000, rate: 0.03 },
        { atLeast: 5000, rate: 0.05 },
        { atLeast: 17000, rate: 0.0575 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 3000, rate: 0.03 },
        { atLeast: 5000, rate: 0.05 },
        { atLeast: 17000, rate: 0.0575 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.02 },
        { atLeast: 3000, rate: 0.03 },
        { atLeast: 5000, rate: 0.05 },
        { atLeast: 17000, rate: 0.0575 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 8750, marriedJointly: 17500, headOfHousehold: 8750 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 930, marriedJointly: 1860, headOfHousehold: 930 },
    },
  },
  WV: {
    state: "WV",
    stateName: "West Virginia",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.0222 },
        { atLeast: 10000, rate: 0.0296 },
        { atLeast: 25000, rate: 0.0333 },
        { atLeast: 40000, rate: 0.0444 },
        { atLeast: 60000, rate: 0.0482 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.0222 },
        { atLeast: 10000, rate: 0.0296 },
        { atLeast: 25000, rate: 0.0333 },
        { atLeast: 40000, rate: 0.0444 },
        { atLeast: 60000, rate: 0.0482 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.0222 },
        { atLeast: 10000, rate: 0.0296 },
        { atLeast: 25000, rate: 0.0333 },
        { atLeast: 40000, rate: 0.0444 },
        { atLeast: 60000, rate: 0.0482 },
      ],
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 2000, marriedJointly: 4000, headOfHousehold: 2000 },
    },
  },
  WI: {
    state: "WI",
    stateName: "Wisconsin",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.035 },
        { atLeast: 15110, rate: 0.044 },
        { atLeast: 51950, rate: 0.053 },
        { atLeast: 332720, rate: 0.0765 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.035 },
        { atLeast: 20150, rate: 0.044 },
        { atLeast: 69260, rate: 0.053 },
        { atLeast: 443630, rate: 0.0765 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.035 },
        { atLeast: 15110, rate: 0.044 },
        { atLeast: 51950, rate: 0.053 },
        { atLeast: 332720, rate: 0.0765 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 13960, marriedJointly: 25840, headOfHousehold: 13960 },
    },
    personalExemption: {
      type: "deduction",
      amounts: { single: 700, marriedJointly: 1400, headOfHousehold: 700 },
    },
  },
  DC: {
    state: "DC",
    stateName: "District of Columbia",
    hasIncomeTax: true,
    citation: "Tax Foundation, 2026 State Individual Income Tax Rates and Brackets",
    brackets: {
      single: [
        { atLeast: 0, rate: 0.04 },
        { atLeast: 10000, rate: 0.06 },
        { atLeast: 40000, rate: 0.065 },
        { atLeast: 60000, rate: 0.085 },
        { atLeast: 250000, rate: 0.0925 },
        { atLeast: 500000, rate: 0.0975 },
        { atLeast: 1000000, rate: 0.1075 },
      ],
      marriedJointly: [
        { atLeast: 0, rate: 0.04 },
        { atLeast: 10000, rate: 0.06 },
        { atLeast: 40000, rate: 0.065 },
        { atLeast: 60000, rate: 0.085 },
        { atLeast: 250000, rate: 0.0925 },
        { atLeast: 500000, rate: 0.0975 },
        { atLeast: 1000000, rate: 0.1075 },
      ],
      headOfHousehold: [
        { atLeast: 0, rate: 0.04 },
        { atLeast: 10000, rate: 0.06 },
        { atLeast: 40000, rate: 0.065 },
        { atLeast: 60000, rate: 0.085 },
        { atLeast: 250000, rate: 0.0925 },
        { atLeast: 500000, rate: 0.0975 },
        { atLeast: 1000000, rate: 0.1075 },
      ],
    },
    standardDeduction: {
      type: "deduction",
      amounts: { single: 16100, marriedJointly: 32200, headOfHousehold: 16100 },
    },
  },
};
