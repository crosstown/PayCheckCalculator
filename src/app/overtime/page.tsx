import type { Metadata } from "next";
import Link from "next/link";
import { listStates } from "@/lib/overtime/registry";
import { getStateRules } from "@/lib/overtime/registry";
import { FLAGSHIP_STATES } from "@/lib/overtime/flagshipStates";

export const metadata: Metadata = {
  title: "Overtime Pay Laws by State",
  description:
    "Overtime pay rules for all 50 states + DC — weekly and daily thresholds, double-time rules, and citations, plus a free calculator for each state.",
  alternates: { canonical: "/overtime" },
};

export default function OvertimeStatesIndex() {
  const states = listStates();
  const specialRuleStates = states.filter((s) => {
    const rules = getStateRules(s.code);
    return (
      rules &&
      (rules.dailyOvertimeThresholdHours !== undefined || rules.seventhConsecutiveDay)
    );
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← Back to calculator
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Overtime pay laws by state
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Every state follows the federal FLSA&apos;s 40-hour weekly overtime
        rule at minimum. A handful add their own daily-overtime,
        double-time, or 7th-consecutive-day rules on top of it. Pick a
        state below for its specific rules, a citation, and a worked
        example.
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        Paid biweekly? See the{" "}
        <Link href="/biweekly-overtime-calculator" className="text-blue-600 underline dark:text-blue-400">
          biweekly overtime calculator
        </Link>{" "}
        — overtime is calculated per workweek, not by averaging your two-week
        total, and that trips a lot of people up.
      </p>

      <div className="mt-6 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
        <p className="font-medium text-neutral-800 dark:text-neutral-200">
          Most in-depth: minimum wage, tipped-wage, and exempt-salary rules
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.keys(FLAGSHIP_STATES).map((code) => {
            const s = states.find((st) => st.code === code);
            if (!s) return null;
            return (
              <Link
                key={code}
                href={`/overtime/${code.toLowerCase()}`}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                {s.name}
              </Link>
            );
          })}
        </div>
      </div>

      {specialRuleStates.length > 0 && (
        <div className="mt-6 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            States with extra rules beyond the federal 40-hour standard:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {specialRuleStates.map((s) => (
              <Link
                key={s.code}
                href={`/overtime/${s.code.toLowerCase()}`}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        All states
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        {states.map((s) => (
          <li key={s.code}>
            <Link
              href={`/overtime/${s.code.toLowerCase()}`}
              className="text-blue-600 underline dark:text-blue-400"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
