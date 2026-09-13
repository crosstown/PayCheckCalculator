"use client";

import { useMemo, useState } from "react";
import { calculateOvertime } from "@/lib/overtime/calculate";
import { getStateRules, listStates } from "@/lib/overtime/registry";
import type { CalculationResult, DayHours, StateCode } from "@/lib/overtime/types";
import StateSelect from "@/components/StateSelect";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type PayFrequency = "weekly" | "biweekly";
const WEEKS_PER_FREQUENCY: Record<PayFrequency, number> = { weekly: 1, biweekly: 2 };
type DifferentialType = "percent" | "flat";

interface ScheduleInputs {
  state: StateCode;
  hourlyRate: string;
  hoursPerDay: string;
  daysPerWeek: string;
  differentialType: DifferentialType;
  differentialValue: string;
  payFrequency: PayFrequency;
}

const DEFAULT_A: ScheduleInputs = {
  state: "CT", hourlyRate: "20.00", hoursPerDay: "12", daysPerWeek: "3",
  differentialType: "percent", differentialValue: "0", payFrequency: "biweekly",
};
const DEFAULT_B: ScheduleInputs = {
  state: "CT", hourlyRate: "20.00", hoursPerDay: "12", daysPerWeek: "4",
  differentialType: "percent", differentialValue: "0", payFrequency: "biweekly",
};

/** Spreads `daysPerWeek` consecutive worked days starting Monday (wrapping
 * to Sunday last so a full 7-day week correctly reaches every day, which
 * matters for California/Kentucky's 7th-consecutive-day rule -- that rule
 * only cares that all 7 entries are > 0, not which calendar day is which,
 * matching how the main Calculator component's own day grid works. */
function buildWeekDays(hoursPerDay: number, daysPerWeek: number): DayHours[] {
  const hours = new Array(7).fill(0);
  const clamped = Math.max(0, Math.min(7, Math.round(daysPerWeek)));
  for (let i = 0; i < clamped; i++) {
    hours[((1 + i) % 7)] = hoursPerDay;
  }
  return DAY_LABELS.map((label, i) => ({ label, hours: hours[i] }));
}

function effectiveBaseRate(rate: number, type: DifferentialType, value: number): number {
  if (!Number.isFinite(value) || value === 0) return rate;
  return type === "percent" ? rate * (1 + value / 100) : rate + value;
}

interface OptionOutcome {
  result: CalculationResult;
  totalHours: number;
  effectiveRate: number;
}

function computeOutcome(inputs: ScheduleInputs): OptionOutcome | null {
  const rules = getStateRules(inputs.state);
  const baseRate = parseFloat(inputs.hourlyRate);
  const hoursPerDay = parseFloat(inputs.hoursPerDay);
  const daysPerWeek = parseFloat(inputs.daysPerWeek);
  const differentialValue = parseFloat(inputs.differentialValue);
  if (!rules || !Number.isFinite(baseRate) || baseRate < 0) return null;
  if (!Number.isFinite(hoursPerDay) || hoursPerDay < 0) return null;
  if (!Number.isFinite(daysPerWeek) || daysPerWeek < 0) return null;

  const rate = effectiveBaseRate(baseRate, inputs.differentialType, Number.isFinite(differentialValue) ? differentialValue : 0);
  const days = buildWeekDays(hoursPerDay, daysPerWeek);
  const totalHoursPerWeek = days.reduce((s, d) => s + d.hours, 0);
  const nWeeks = WEEKS_PER_FREQUENCY[inputs.payFrequency];

  try {
    const result = calculateOvertime({
      state: inputs.state,
      hourlyRate: rate,
      weeks: Array.from({ length: nWeeks }).map(() => ({ totalHours: totalHoursPerWeek, days })),
    });
    const totalHours = totalHoursPerWeek * nWeeks;
    const effectiveRate = totalHours > 0 ? result.totals.totalPay / totalHours : 0;
    return { result, totalHours, effectiveRate };
  } catch {
    return null;
  }
}

function buildComparisonSummary(a: OptionOutcome, b: OptionOutcome): string {
  const payA = a.result.totals.totalPay;
  const payB = b.result.totals.totalPay;
  const payDiff = payA - payB;
  const hoursDiff = a.totalHours - b.totalHours;
  const rateDiff = a.effectiveRate - b.effectiveRate;

  if (Math.abs(payDiff) < 0.005 && Math.abs(hoursDiff) > 0.01) {
    const better = hoursDiff < 0 ? "A" : "B";
    return (
      `Best option: Option ${better}. Both pay the same (${currency.format(better === "A" ? payA : payB)}) ` +
      `but Option ${better} takes ${Math.abs(hoursDiff)} fewer total hour${Math.abs(hoursDiff) === 1 ? "" : "s"} ` +
      `to get there — a higher effective hourly rate for the same money.`
    );
  }
  if (Math.abs(rateDiff) < 0.005) {
    return "Both schedules work out to the same effective hourly rate — the choice comes down to which total hours or total pay you'd rather have.";
  }
  const higherRate = rateDiff > 0 ? "A" : "B";
  const higherPay = payDiff === 0 ? null : payDiff > 0 ? "A" : "B";
  const rateHigh = higherRate === "A" ? a.effectiveRate : b.effectiveRate;
  const rateLow = higherRate === "A" ? b.effectiveRate : a.effectiveRate;
  let sentence = `Best by effective hourly rate: Option ${higherRate} (${currency.format(rateHigh)}/hr vs ${currency.format(rateLow)}/hr).`;
  if (higherPay && higherPay !== higherRate) {
    sentence += ` Note Option ${higherPay} actually pays ${currency.format(Math.abs(payDiff))} more in total — it just takes more hours to earn it, so which one is "better" depends on whether you value the extra money or the extra time more.`;
  } else if (higherPay === higherRate) {
    sentence += ` It also pays ${currency.format(Math.abs(payDiff))} more in total.`;
  }
  return sentence;
}

function ScheduleForm({
  label, values, onChange, states,
}: {
  label: string;
  values: ScheduleInputs;
  onChange: (next: ScheduleInputs) => void;
  states: ReturnType<typeof listStates>;
}) {
  const set = <K extends keyof ScheduleInputs>(key: K, value: ScheduleInputs[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label}</h3>
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">State</label>
          <StateSelect id={`${label}-state`} states={states} value={values.state} onChange={(v) => set("state", v)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">Hourly rate</label>
            <div className="mt-1 flex items-center rounded-md border border-neutral-300 px-2 dark:border-neutral-700">
              <span className="text-neutral-400 text-sm">$</span>
              <input type="number" min="0" step="0.01" value={values.hourlyRate}
                onChange={(e) => set("hourlyRate", e.target.value)}
                className="w-full bg-transparent px-1 py-1.5 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">Pay frequency</label>
            <select value={values.payFrequency} onChange={(e) => set("payFrequency", e.target.value as PayFrequency)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700">
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">Hours per day</label>
            <input type="number" min="0" step="0.5" value={values.hoursPerDay}
              onChange={(e) => set("hoursPerDay", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-neutral-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">Days per week</label>
            <input type="number" min="0" max="7" step="1" value={values.daysPerWeek}
              onChange={(e) => set("daysPerWeek", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-neutral-700" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Shift differential <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <div className="mt-1 flex gap-2">
            <input type="number" step="0.1" value={values.differentialValue}
              onChange={(e) => set("differentialValue", e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-neutral-700" />
            <select value={values.differentialType} onChange={(e) => set("differentialType", e.target.value as DifferentialType)}
              className="rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700">
              <option value="percent">%</option>
              <option value="flat">$/hr</option>
            </select>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            Applied to your whole hourly rate, including overtime — matches how
            most employers apply a standing shift differential.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultSummary({ label, outcome }: { label: string; outcome: OptionOutcome }) {
  const { result, totalHours, effectiveRate } = outcome;
  return (
    <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-900">
      <p className="font-medium text-neutral-700 dark:text-neutral-300">{label} result</p>
      <div className="mt-1.5 grid grid-cols-2 gap-y-1 text-neutral-600 dark:text-neutral-400">
        <span>Total hours</span>
        <span className="text-right">{totalHours}</span>
        <span>Regular pay</span>
        <span className="text-right">{currency.format(result.totals.regularPay)}</span>
        <span>Overtime pay</span>
        <span className="text-right">{currency.format(result.totals.overtimePay)}</span>
        {result.totals.doubleTimePay > 0 && (
          <>
            <span>Double-time pay</span>
            <span className="text-right">{currency.format(result.totals.doubleTimePay)}</span>
          </>
        )}
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">Gross pay</span>
        <span className="text-right font-semibold text-neutral-800 dark:text-neutral-200">
          {currency.format(result.totals.totalPay)}
        </span>
        <span>Effective hourly rate</span>
        <span className="text-right">{currency.format(effectiveRate)}/hr</span>
      </div>
    </div>
  );
}

export default function ScheduleComparison() {
  const states = useMemo(() => listStates(), []);
  const [a, setA] = useState<ScheduleInputs>(DEFAULT_A);
  const [b, setB] = useState<ScheduleInputs>(DEFAULT_B);

  const outcomeA = useMemo(() => computeOutcome(a), [a]);
  const outcomeB = useMemo(() => computeOutcome(b), [b]);

  return (
    <section id="compare-schedules" className="mx-auto w-full max-w-2xl px-4 pb-16 scroll-mt-6">
      <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Compare two work schedules
      </h2>
      <p className="mt-2 text-sm text-neutral-500">
        Two schedules that pay the same total often don&apos;t take the same
        number of hours to get there. Compare gross pay, overtime, and
        effective hourly rate side by side to see which one is actually
        worth it — a 4x12 schedule versus a 3x12, a shift differential
        versus a raise, or any two rates/days you&apos;re weighing.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ScheduleForm label="Option A" values={a} onChange={setA} states={states} />
        <ScheduleForm label="Option B" values={b} onChange={setB} states={states} />
      </div>

      {outcomeA && outcomeB ? (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ResultSummary label="Option A" outcome={outcomeA} />
            <ResultSummary label="Option B" outcome={outcomeB} />
          </div>
          <div className="mt-4 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
            <p className="font-medium text-neutral-800 dark:text-neutral-200">Recommendation</p>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {buildComparisonSummary(outcomeA, outcomeB)}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Enter valid values for both options to see a comparison.
        </p>
      )}

      <p className="mt-3 text-xs text-neutral-400">
        Assumes the same schedule repeats every week in the pay period
        (e.g. a biweekly comparison doubles one workweek). This is an
        estimate for general informational purposes, not payroll advice.
      </p>
    </section>
  );
}
