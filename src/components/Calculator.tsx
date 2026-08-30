"use client";

import { useMemo, useState } from "react";
import { calculateOvertime } from "@/lib/overtime/calculate";
import { getStateRules, listStates } from "@/lib/overtime/registry";
import type { StateCode } from "@/lib/overtime/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Calculator() {
  const states = useMemo(() => listStates(), []);
  const [state, setState] = useState<StateCode>("CT");
  const [hourlyRate, setHourlyRate] = useState("20.00");
  const [payPeriod, setPayPeriod] = useState<"weekly" | "biweekly">("weekly");
  const [weekHours, setWeekHours] = useState(["45", "40"]);

  const rules = getStateRules(state);
  const activeWeeks = payPeriod === "weekly" ? 1 : 2;

  const { result, error } = useMemo(() => {
    if (!rules) return { result: null, error: null };

    const rate = parseFloat(hourlyRate);
    if (Number.isNaN(rate) || rate < 0) {
      return { result: null, error: "Enter a valid hourly rate." };
    }

    const weeks = weekHours.slice(0, activeWeeks).map((h) => {
      const hours = parseFloat(h);
      return { totalHours: Number.isNaN(hours) || hours < 0 ? 0 : hours };
    });

    try {
      return { result: calculateOvertime({ state, hourlyRate: rate, weeks }), error: null };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : "Something went wrong.",
      };
    }
  }, [state, hourlyRate, weekHours, activeWeeks, rules]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Paycheck Overtime Calculator
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Estimate overtime pay by state. Starting with Connecticut — more
        states coming soon.
      </p>

      <div className="mt-8 space-y-6 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium">
            State
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          >
            {states.map((s) => (
              <option key={s.code} value={s.code} disabled={!s.available}>
                {s.name}
                {!s.available ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </div>

        {!rules && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Overtime rules for this state aren&apos;t implemented yet.
          </p>
        )}

        {rules && (
          <>
            {/* Hourly rate */}
            <div>
              <label htmlFor="rate" className="block text-sm font-medium">
                Hourly rate
              </label>
              <div className="mt-1 flex items-center rounded-md border border-neutral-300 px-3 dark:border-neutral-700">
                <span className="text-neutral-400">$</span>
                <input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                />
              </div>
            </div>

            {/* Pay period */}
            <div>
              <span className="block text-sm font-medium">Pay period</span>
              <div className="mt-1 flex gap-2">
                {(["weekly", "biweekly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPayPeriod(p)}
                    className={`rounded-md border px-3 py-1.5 text-sm capitalize ${
                      payPeriod === p
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                        : "border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {payPeriod === "biweekly" && (
                <p className="mt-1 text-xs text-neutral-500">
                  Overtime is calculated per 7-day workweek, so each week is
                  entered — and evaluated — separately.
                </p>
              )}
            </div>

            {/* Hours per week */}
            <div className="space-y-3">
              {Array.from({ length: activeWeeks }).map((_, i) => (
                <div key={i}>
                  <label
                    htmlFor={`week-${i}`}
                    className="block text-sm font-medium"
                  >
                    Hours worked{activeWeeks > 1 ? ` — Week ${i + 1}` : ""}
                  </label>
                  <input
                    id={`week-${i}`}
                    type="number"
                    min="0"
                    step="0.25"
                    value={weekHours[i]}
                    onChange={(e) => {
                      const next = [...weekHours];
                      next[i] = e.target.value;
                      setWeekHours(next);
                    }}
                    className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-700"
                  />
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {/* Results */}
            {result && !error && (
              <div className="space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                {result.weeks.map((w, i) => (
                  <div key={i} className="text-sm">
                    {result.weeks.length > 1 && (
                      <p className="mb-1 font-medium">Week {i + 1}</p>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-600 dark:text-neutral-400">
                      <span>
                        Regular ({w.regularHours} hrs)
                      </span>
                      <span className="text-right">
                        {currency.format(w.regularPay)}
                      </span>
                      <span>
                        Overtime ({w.overtimeHours} hrs @{" "}
                        {rules.weeklyOvertimeMultiplier}x)
                      </span>
                      <span className="text-right">
                        {currency.format(w.overtimePay)}
                      </span>
                      {w.doubleTimeHours > 0 && (
                        <>
                          <span>Double time ({w.doubleTimeHours} hrs)</span>
                          <span className="text-right">
                            {currency.format(w.doubleTimePay)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold dark:border-neutral-800">
                  <span>Total pay</span>
                  <span>{currency.format(result.totals.totalPay)}</span>
                </div>
              </div>
            )}

            {/* Rules disclosure */}
            <div className="border-t border-neutral-200 pt-4 text-xs text-neutral-500 dark:border-neutral-800">
              <p className="font-medium text-neutral-600 dark:text-neutral-400">
                {rules.stateName} overtime rule: {rules.citation}
              </p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {rules.notes?.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
