"use client";

import { useMemo, useState } from "react";
import { calculatePaycheck } from "@/lib/paycheck/calculate";
import { SOCIAL_SECURITY_WAGE_BASE_2026 } from "@/lib/paycheck/fica";
import { getStateTaxRules } from "@/lib/paycheck/stateTax/calculate";
import type { FilingStatus } from "@/lib/paycheck/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** "$0.00" for a zero deduction instead of the odd-looking "-$0.00". */
const deduction = (amount: number) => (amount > 0 ? `-${currency.format(amount)}` : currency.format(amount));

const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  marriedJointly: "Married filing jointly",
  headOfHousehold: "Head of household",
};

interface PaycheckDeductionsProps {
  grossPay: number;
  payPeriodsPerYear: number;
  /** Reuses the state already selected for overtime purposes -- it's the same paycheck. */
  state: string;
}

export default function PaycheckDeductions({
  grossPay,
  payPeriodsPerYear,
  state,
}: PaycheckDeductionsProps) {
  const [show, setShow] = useState(false);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [qualifyingChildren, setQualifyingChildren] = useState("0");
  const [otherDependents, setOtherDependents] = useState("0");
  const [contribution401kPercent, setContribution401kPercent] = useState("0");

  const stateRules = getStateTaxRules(state);

  const result = useMemo(() => {
    const qc = parseInt(qualifyingChildren, 10);
    const od = parseInt(otherDependents, 10);
    const pct = parseFloat(contribution401kPercent);
    return calculatePaycheck({
      grossPay,
      payPeriodsPerYear,
      filingStatus,
      qualifyingChildren: Number.isNaN(qc) || qc < 0 ? 0 : qc,
      otherDependents: Number.isNaN(od) || od < 0 ? 0 : od,
      contribution401kPercent: Number.isNaN(pct) || pct < 0 ? 0 : pct,
      state,
    });
  }, [
    grossPay,
    payPeriodsPerYear,
    filingStatus,
    qualifyingChildren,
    otherDependents,
    contribution401kPercent,
    state,
  ]);

  return (
    <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {show ? "Hide" : "Show"} estimated taxes &amp; take-home pay
      </button>

      {show && (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="filing-status" className="block text-sm font-medium">
              Filing status
            </label>
            <select
              id="filing-status"
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
            >
              {(Object.entries(FILING_STATUS_LABELS) as [FilingStatus, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qualifying-children" className="block text-sm font-medium">
                Qualifying children
                <span className="block text-xs font-normal text-neutral-500">
                  under 17, $2,000 credit each
                </span>
              </label>
              <input
                id="qualifying-children"
                type="number"
                min="0"
                step="1"
                value={qualifyingChildren}
                onChange={(e) => setQualifyingChildren(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-700"
              />
            </div>
            <div>
              <label htmlFor="other-dependents" className="block text-sm font-medium">
                Other dependents
                <span className="block text-xs font-normal text-neutral-500">
                  $500 credit each
                </span>
              </label>
              <input
                id="other-dependents"
                type="number"
                min="0"
                step="1"
                value={otherDependents}
                onChange={(e) => setOtherDependents(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-700"
              />
            </div>
          </div>

          <div>
            <label htmlFor="401k-percent" className="block text-sm font-medium">
              401(k) contribution
              <span className="font-normal text-neutral-500"> (% of pay, traditional/pre-tax)</span>
            </label>
            <div className="mt-1 flex items-center rounded-md border border-neutral-300 px-3 dark:border-neutral-700">
              <input
                id="401k-percent"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={contribution401kPercent}
                onChange={(e) => setContribution401kPercent(e.target.value)}
                className="w-full bg-transparent py-2 text-sm outline-none"
              />
              <span className="text-neutral-400">%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-neutral-200 pt-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
            <span>Gross pay</span>
            <span className="text-right">{currency.format(result.grossPay)}</span>
            {result.contribution401k > 0 && (
              <>
                <span>401(k) contribution</span>
                <span className="text-right">{deduction(result.contribution401k)}</span>
              </>
            )}
            <span>Social Security (6.2%)</span>
            <span className="text-right">{deduction(result.socialSecurityTax)}</span>
            <span>Medicare (1.45%)</span>
            <span className="text-right">{deduction(result.medicareTax)}</span>
            <span>Federal income tax (est.)</span>
            <span className="text-right">{deduction(result.federalIncomeTax)}</span>
            <span>
              {stateRules?.hasIncomeTax
                ? `${stateRules.stateName} state income tax (est.)`
                : `${stateRules?.stateName ?? "State"} income tax`}
            </span>
            <span className="text-right">{deduction(result.stateIncomeTax)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold dark:border-neutral-800">
            <span>Estimated net pay</span>
            <span>{currency.format(result.netPay)}</span>
          </div>

          <ul className="list-inside list-disc space-y-0.5 text-xs text-neutral-500">
            <li>
              Federal income tax is estimated using the IRS&apos;s 2026 standard
              withholding percentage method (Pub. 15-T), assuming a single job
              and no additional Form W-4 elections beyond filing status and
              dependents (no extra income, deductions, or extra withholding).
            </li>
            {stateRules?.hasIncomeTax ? (
              <li>
                {stateRules.stateName} state income tax is estimated using
                that state&apos;s own 2026 brackets/rate ({stateRules.citation}
                ), applied to the same post-401(k) taxable wages as federal.
                No local/municipal income tax is included (a separate
                undertaking from state tax), and no state-specific dependent
                credits are applied.
                {stateRules.notes?.map((n, i) => (
                  <span key={i} className="mt-1 block">
                    {n}
                  </span>
                ))}
              </li>
            ) : (
              <li>
                {stateRules?.stateName ?? "This state"} has no state income
                tax on wages.
                {stateRules?.notes?.map((n, i) => (
                  <span key={i} className="mt-1 block">
                    {n}
                  </span>
                ))}
              </li>
            )}
            <li>
              Doesn&apos;t include other paycheck deductions (health
              insurance, HSA/FSA, wage garnishments, etc.).
            </li>
            <li>
              Social Security tax doesn&apos;t account for the annual wage
              base cap (${SOCIAL_SECURITY_WAGE_BASE_2026.toLocaleString()} for
              2026) since this tool only looks at a single pay period, not
              your year-to-date earnings — high earners near or above that
              may see this overstate their Social Security withholding later
              in the year.
            </li>
            <li>This is an estimate for general informational purposes, not tax advice.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
