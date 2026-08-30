"use client";

import { useMemo, useState } from "react";
import { calculateOvertime, effectiveDailyThreshold } from "@/lib/overtime/calculate";
import { getStateRules, listStates } from "@/lib/overtime/registry";
import type { StateCode } from "@/lib/overtime/types";
import StateSelect from "@/components/StateSelect";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_WEEK_TOTALS = ["45", "40"];
const DEFAULT_WEEK_DAYS = [
  ["0", "9", "9", "9", "9", "9", "0"],
  ["0", "8", "8", "8", "8", "8", "0"],
];

export default function Calculator() {
  const states = useMemo(() => listStates(), []);
  const [state, setState] = useState<StateCode>("CT");
  const [hourlyRate, setHourlyRate] = useState("20.00");
  const [payPeriod, setPayPeriod] = useState<"weekly" | "biweekly">("weekly");
  const [weekTotals, setWeekTotals] = useState(DEFAULT_WEEK_TOTALS);
  const [weekDays, setWeekDays] = useState(DEFAULT_WEEK_DAYS);
  const [altSchedule, setAltSchedule] = useState(false);

  const rules = getStateRules(state);
  const activeWeeks = payPeriod === "weekly" ? 1 : 2;
  const hasDayLevelInput =
    rules?.dailyOvertimeThresholdHours !== undefined || !!rules?.seventhConsecutiveDay;

  const rate = parseFloat(hourlyRate);
  const rateValid = !Number.isNaN(rate) && rate >= 0;

  const dailyRuleActive =
    rules && rateValid
      ? effectiveDailyThreshold(rules, rate, altSchedule) !== undefined
      : false;

  const { result, error } = useMemo(() => {
    if (!rules) return { result: null, error: null };
    if (!rateValid) {
      return { result: null, error: "Enter a valid hourly rate." };
    }

    const weeks = Array.from({ length: activeWeeks }).map((_, i) => {
      if (hasDayLevelInput) {
        const days = DAY_LABELS.map((label, d) => {
          const raw = weekDays[i]?.[d] ?? "0";
          const hours = parseFloat(raw);
          return { label, hours: Number.isNaN(hours) || hours < 0 ? 0 : hours };
        });
        return { totalHours: days.reduce((s, d) => s + d.hours, 0), days };
      }
      const hours = parseFloat(weekTotals[i] ?? "0");
      return { totalHours: Number.isNaN(hours) || hours < 0 ? 0 : hours };
    });

    try {
      return {
        result: calculateOvertime({
          state,
          hourlyRate: rate,
          weeks,
          alternativeScheduleAgreement: altSchedule,
        }),
        error: null,
      };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : "Something went wrong.",
      };
    }
  }, [state, rate, rateValid, weekTotals, weekDays, activeWeeks, hasDayLevelInput, altSchedule, rules]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Paycheck Overtime Calculator
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Estimate overtime pay for all 50 states + DC.
      </p>

      <div className="mt-8 space-y-6 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium">
            State
          </label>
          <StateSelect id="state" states={states} value={state} onChange={setState} />
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
              {rules.wageConditionalDailyOvertime && rateValid && (
                <p className="mt-1 text-xs text-neutral-500">
                  {dailyRuleActive
                    ? `Daily overtime rule applies (below $${rules.wageConditionalDailyOvertime.belowHourlyRate.toFixed(2)}/hr).`
                    : `Daily overtime rule does not apply at this rate (at or above $${rules.wageConditionalDailyOvertime.belowHourlyRate.toFixed(2)}/hr) — only the weekly 40-hour rule is used.`}
                </p>
              )}
            </div>

            {/* Alternative schedule agreement */}
            {rules.alternativeSchedule && (
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={altSchedule}
                  onChange={(e) => setAltSchedule(e.target.checked)}
                  className="mt-0.5"
                />
                <span>{rules.alternativeSchedule.description}</span>
              </label>
            )}

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

            {/* Hours input: per-day grid for daily-rule states, single total otherwise */}
            <div className="space-y-4">
              {Array.from({ length: activeWeeks }).map((_, i) =>
                hasDayLevelInput ? (
                  <div key={i}>
                    <span className="block text-sm font-medium">
                      Hours worked{activeWeeks > 1 ? ` — Week ${i + 1}` : ""}
                    </span>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                      {DAY_LABELS.map((label, d) => (
                        <div key={label}>
                          <label
                            htmlFor={`week-${i}-day-${d}`}
                            className="block text-center text-[11px] text-neutral-500"
                          >
                            {label}
                          </label>
                          <input
                            id={`week-${i}-day-${d}`}
                            type="number"
                            min="0"
                            step="0.25"
                            value={weekDays[i]?.[d] ?? "0"}
                            onChange={(e) => {
                              const next = weekDays.map((w) => [...w]);
                              while (next.length <= i) next.push(["0","0","0","0","0","0","0"]);
                              next[i][d] = e.target.value;
                              setWeekDays(next);
                            }}
                            className="w-full rounded-md border border-neutral-300 bg-transparent px-1 py-1.5 text-center text-sm outline-none dark:border-neutral-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
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
                      value={weekTotals[i] ?? "0"}
                      onChange={(e) => {
                        const next = [...weekTotals];
                        next[i] = e.target.value;
                        setWeekTotals(next);
                      }}
                      className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-700"
                    />
                  </div>
                ),
              )}
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
                      <span>Regular ({w.regularHours} hrs)</span>
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
                          <span>
                            Double time ({w.doubleTimeHours} hrs @{" "}
                            {rules.dailyDoubleTimeMultiplier ?? 2}x)
                          </span>
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
