import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStateRules, listStates } from "@/lib/overtime/registry";
import {
  EXAMPLE_HOURLY_RATE,
  EXAMPLE_TOTAL_HOURS,
  buildWorkedExample,
  stateIncomeTaxSummary,
} from "@/lib/overtime/content";
import type { StateCode } from "@/lib/overtime/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const FEDERAL_BASELINE_CITATION = "29 U.S.C. § 207 (federal FLSA)";

export function generateStaticParams() {
  return listStates().map((s) => ({ state: s.code.toLowerCase() }));
}

function resolveState(param: string): StateCode | null {
  const code = param.toUpperCase();
  return getStateRules(code) ? code : null;
}

export async function generateMetadata(
  props: PageProps<"/overtime/[state]">,
): Promise<Metadata> {
  const { state } = await props.params;
  const code = resolveState(state);
  if (!code) return {};
  const rules = getStateRules(code)!;
  const daily = rules.dailyOvertimeThresholdHours
    ? ` ${rules.stateName} also has a daily-overtime rule after ${rules.dailyOvertimeThresholdHours} hours.`
    : "";
  return {
    title: `${rules.stateName} Overtime Pay Laws & Calculator (2026)`,
    description: `How overtime pay works in ${rules.stateName}: ${rules.weeklyOvertimeThresholdHours}-hour weekly rule at ${rules.weeklyOvertimeMultiplier}x pay (${rules.citation}).${daily} Free calculator included.`,
    alternates: { canonical: `/overtime/${state.toLowerCase()}` },
  };
}

/** Bullet points describing a state's rule set, built from the same
 * structured data the calculator uses -- see registry.ts / types.ts. */
function ruleBullets(rules: NonNullable<ReturnType<typeof getStateRules>>): string[] {
  const bullets: string[] = [
    `Overtime applies after ${rules.weeklyOvertimeThresholdHours} hours in a single workweek, paid at ${rules.weeklyOvertimeMultiplier}x your regular hourly rate.`,
  ];

  if (rules.dailyOvertimeThresholdHours !== undefined) {
    bullets.push(
      `Daily overtime also applies: ${rules.dailyOvertimeMultiplier}x pay for hours worked beyond ${rules.dailyOvertimeThresholdHours} in a single workday.`,
    );
  }
  if (rules.dailyDoubleTimeThresholdHours !== undefined) {
    bullets.push(
      `Double time applies for hours beyond ${rules.dailyDoubleTimeThresholdHours} in a single workday, paid at ${rules.dailyDoubleTimeMultiplier}x.`,
    );
  }
  if (rules.wageConditionalDailyOvertime) {
    bullets.push(
      `The daily rule only applies below $${rules.wageConditionalDailyOvertime.belowHourlyRate.toFixed(2)}/hr (${rules.wageConditionalDailyOvertime.description}) -- at or above that rate, only the weekly rule applies.`,
    );
  }
  if (rules.alternativeSchedule) {
    bullets.push(`${rules.alternativeSchedule.description} can change how the daily rule applies.`);
  }
  if (rules.seventhConsecutiveDay) {
    bullets.push(
      `Working all 7 days of one workweek triggers an extra premium on the 7th day${
        rules.seventhConsecutiveDay.requiresWeeklyOvertimeTriggered
          ? ", but only if that week's total already exceeds the weekly threshold"
          : ""
      }.`,
    );
  }
  if (rules.citation === FEDERAL_BASELINE_CITATION) {
    bullets.push(
      `${rules.stateName} has no separate state-law daily-overtime or double-time requirement -- only the weekly threshold above applies.`,
    );
  }

  return bullets;
}

export default async function StateOvertimePage(props: PageProps<"/overtime/[state]">) {
  const { state } = await props.params;
  const code = resolveState(state);
  if (!code) notFound();

  const rules = getStateRules(code)!;
  const example = buildWorkedExample(code)!;
  const taxSummary = stateIncomeTaxSummary(code);
  const slug = code.toLowerCase();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/overtime" className="text-sm text-neutral-500 hover:underline">
        ← All states
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {rules.stateName} Overtime Pay Laws & Calculator
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        How overtime works for hourly employees in {rules.stateName}, plus a
        free calculator to estimate your own pay.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            The rules
          </h2>
          <p className="mt-2 text-neutral-500">
            Source: {rules.citation}
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            {ruleBullets(rules).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Worked example
          </h2>
          <p className="mt-2">
            Take a non-exempt hourly employee in {rules.stateName} earning{" "}
            {currency.format(EXAMPLE_HOURLY_RATE)}/hour who works{" "}
            {EXAMPLE_TOTAL_HOURS} hours in one workweek (nine hours a day,
            Monday through Friday). Applying {rules.stateName}&apos;s rules
            above:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <span>Regular pay ({example.week.regularHours} hrs)</span>
            <span className="text-right">{currency.format(example.week.regularPay)}</span>
            <span>
              Overtime pay ({example.week.overtimeHours} hrs @ {rules.weeklyOvertimeMultiplier}x)
            </span>
            <span className="text-right">{currency.format(example.week.overtimePay)}</span>
            {example.week.doubleTimeHours > 0 && (
              <>
                <span>
                  Double-time pay ({example.week.doubleTimeHours} hrs @{" "}
                  {rules.dailyDoubleTimeMultiplier ?? 2}x)
                </span>
                <span className="text-right">{currency.format(example.week.doubleTimePay)}</span>
              </>
            )}
            <span className="border-t border-neutral-200 pt-2 font-semibold dark:border-neutral-800">
              Total pay
            </span>
            <span className="border-t border-neutral-200 pt-2 text-right font-semibold dark:border-neutral-800">
              {currency.format(example.week.totalPay)}
            </span>
          </div>
          <p className="mt-3">
            <Link href="/" className="text-blue-600 underline dark:text-blue-400">
              Use the full calculator
            </Link>{" "}
            to plug in your own rate, hours, and pay period — including
            estimated federal and {rules.stateName} tax withholding.
          </p>
        </section>

        {taxSummary && (
          <section>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Taxes on overtime pay in {rules.stateName}
            </h2>
            <p className="mt-2">
              Overtime pay isn&apos;t taxed differently from regular
              wages — it&apos;s just added to your gross pay for the
              period and withheld at the same rates. {taxSummary}
            </p>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Who this applies to
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2">
            {rules.notes
              ?.filter((n) => !n.startsWith("This is an estimate"))
              .map((n, i) => (
                <li key={i}>{n}</li>
              ))}
          </ul>
          <p className="mt-3 text-xs text-neutral-500">
            This is an estimate for general informational purposes only,
            not legal, tax, or payroll advice. For your specific
            situation, consult your employer&apos;s payroll department, a
            licensed tax professional, or {rules.stateName}&apos;s labor
            department.
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs text-neutral-400">
        Permalink:{" "}
        <span className="font-mono">paycheckovertime.com/overtime/{slug}</span>
      </p>
    </div>
  );
}
