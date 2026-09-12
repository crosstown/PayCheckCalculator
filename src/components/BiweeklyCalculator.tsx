"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateOvertime } from "@/lib/overtime/calculate";
import { getStateRules, listStates } from "@/lib/overtime/registry";
import type { StateCode } from "@/lib/overtime/types";
import StateSelect from "@/components/StateSelect";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
type DifferentialType = "percent" | "flat";

/** Deliberately a distinct, simpler tool from the homepage calculator, not
 * a reskin of it: fixed to exactly two weekly TOTALS (no per-day grid),
 * because this page's whole point is showing the week-1-vs-week-2 split,
 * not modeling daily-overtime states in full. A state with a daily-OT
 * rule (CA/AK/CO) is only evaluated on its weekly 40-hour threshold
 * here -- flagged explicitly below rather than silently under-counting
 * what a full day-level calculation would show; the homepage calculator
 * is linked for that. */
export default function BiweeklyCalculator() {
  const states = useMemo(() => listStates(), []);
  const [state, setState] = useState<StateCode>("CT");
  const [hourlyRate, setHourlyRate] = useState("20.00");
  const [week1, setWeek1] = useState("35");
  const [week2, setWeek2] = useState("45");
  const [differentialType, setDifferentialType] = useState<DifferentialType>("percent");
  const [differentialValue, setDifferentialValue] = useState("0");

  const rules = getStateRules(state);
  const rate = parseFloat(hourlyRate);
  const rateValid = !Number.isNaN(rate) && rate >= 0;
  const hasDailyRule =
    !!rules && (rules.dailyOvertimeThresholdHours !== undefined || !!rules.seventhConsecutiveDay);

  const { result, error } = useMemo(() => {
    if (!rules) return { result: null, error: null };
    if (!rateValid) return { result: null, error: "Enter a valid hourly rate." };
    const w1 = parseFloat(week1);
    const w2 = parseFloat(week2);
    if (Number.isNaN(w1) || w1 < 0 || Number.isNaN(w2) || w2 < 0) {
      return { result: null, error: "Enter valid hours for both weeks." };
    }
    const diffValue = parseFloat(differentialValue);
    const effectiveRate =
      Number.isFinite(diffValue) && diffValue !== 0
        ? differentialType === "percent"
          ? rate * (1 + diffValue / 100)
          : rate + diffValue
        : rate;
    try {
      return {
        result: calculateOvertime({
          state,
          hourlyRate: effectiveRate,
          weeks: [{ totalHours: w1 }, { totalHours: w2 }],
        }),
        error: null,
      };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : "Something went wrong." };
    }
  }, [state, rate, rateValid, week1, week2, differentialType, differentialValue, rules]);

  return (
    <div className="space-y-6 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
      <div>
        <label className="block text-sm font-medium">State</label>
        <StateSelect id="biweekly-state" states={states} value={state} onChange={setState} />
      </div>

      {hasDailyRule && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {rules!.stateName} has a daily-overtime rule this simplified
          two-week view doesn&apos;t model (it only checks the 40-hour
          weekly threshold). Use the{" "}
          <Link href="/" className="underline">
            full calculator
          </Link>{" "}
          for an accurate {rules!.stateName} result.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bw-rate" className="block text-sm font-medium">Hourly rate</label>
          <div className="mt-1 flex items-center rounded-md border border-neutral-300 px-3 dark:border-neutral-700">
            <span className="text-neutral-400">$</span>
            <input id="bw-rate" type="number" min="0" step="0.01" value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full bg-transparent px-2 py-2 text-sm outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">
            Shift differential <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <div className="mt-1 flex gap-1">
            <input type="number" step="0.1" value={differentialValue}
              onChange={(e) => setDifferentialValue(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-2 text-sm outline-none dark:border-neutral-700" />
            <select value={differentialType} onChange={(e) => setDifferentialType(e.target.value as DifferentialType)}
              className="rounded-md border border-neutral-300 bg-transparent px-2 py-2 text-sm dark:border-neutral-700">
              <option value="percent">%</option>
              <option value="flat">$/hr</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bw-week1" className="block text-sm font-medium">Week 1 hours</label>
          <input id="bw-week1" type="number" min="0" step="0.25" value={week1}
            onChange={(e) => setWeek1(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-700" />
        </div>
        <div>
          <label htmlFor="bw-week2" className="block text-sm font-medium">Week 2 hours</label>
          <input id="bw-week2" type="number" min="0" step="0.25" value={week2}
            onChange={(e) => setWeek2(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-700" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {result && !error && rules && (
        <div className="space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          {result.weeks.map((w, i) => (
            <div key={i} className="text-sm">
              <p className="mb-1 font-medium">Week {i + 1}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-600 dark:text-neutral-400">
                <span>Regular ({w.regularHours} hrs)</span>
                <span className="text-right">{currency.format(w.regularPay)}</span>
                <span>Overtime ({w.overtimeHours} hrs @ {rules.weeklyOvertimeMultiplier}x)</span>
                <span className="text-right">{currency.format(w.overtimePay)}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold dark:border-neutral-800">
            <span>Total biweekly gross pay</span>
            <span>{currency.format(result.totals.totalPay)}</span>
          </div>
          <p className="text-xs text-neutral-500">
            {result.totals.overtimeHours > 0
              ? `${result.totals.overtimeHours} total overtime hour${result.totals.overtimeHours === 1 ? "" : "s"} across the two weeks — calculated per workweek, not from the 80-hour combined total.`
              : "No overtime owed — neither week individually exceeded the weekly threshold."}
          </p>
        </div>
      )}
    </div>
  );
}
