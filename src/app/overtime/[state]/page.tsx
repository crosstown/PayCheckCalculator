import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStateRules, listStates } from "@/lib/overtime/registry";
import {
  EXAMPLE_HOURLY_RATE,
  EXAMPLE_TOTAL_HOURS,
  build12HourShiftComparison,
  buildBiweeklyConfusionExample,
  buildWorkedExample,
  stateIncomeTaxSummary,
} from "@/lib/overtime/content";
import { getFlagshipContent } from "@/lib/overtime/flagshipStates";
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
  const flagship = getFlagshipContent(code);
  const flagshipNote = flagship
    ? ` Includes 2026 minimum wage, tipped-wage, and exempt-salary thresholds.`
    : "";
  // "is overtime taxed in X" is a real, recurring Search Console query
  // pattern (seen for OR/UT/KY among others) distinct from "overtime laws
  // X" -- worth a dedicated clause in the snippet, not just buried in the
  // page body, since every state page already has this data available.
  const taxNote = stateIncomeTaxSummary(code) ? ` Also covers how overtime is taxed in ${rules.stateName}.` : "";
  const title = `${rules.stateName} Overtime Pay Laws & Calculator (2026)`;
  const description = `How overtime pay works in ${rules.stateName}: ${rules.weeklyOvertimeThresholdHours}-hour weekly rule at ${rules.weeklyOvertimeMultiplier}x pay (${rules.citation}).${daily}${flagshipNote}${taxNote} Free calculator included.`;
  const canonical = `/overtime/${state.toLowerCase()}`;
  return {
    title,
    description,
    alternates: { canonical },
    // Root layout's openGraph/twitter are fixed to the homepage's own
    // url/title -- without this override, sharing any of the ~50 state
    // pages would show a link preview pointing back to the homepage.
    openGraph: {
      type: "website",
      siteName: "Paycheck Overtime Calculator",
      url: canonical,
      title,
      description,
    },
    twitter: { card: "summary", title, description },
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
  const flagship = getFlagshipContent(code);
  const biweeklyExample = flagship ? buildBiweeklyConfusionExample(code) : null;
  const shiftComparison = flagship ? build12HourShiftComparison(code) : null;

  // "Is overtime taxed in X" shows up as real Search Console query volume
  // (OR/UT/KY, at minimum) separate from "overtime laws X" -- this FAQ
  // entry answers that exact phrasing directly, and unlike the rest of
  // this page's FAQ content it isn't gated behind `flagship`: every state
  // with tax data (nearly all 51) gets it, since stateIncomeTaxSummary()
  // already covers them all.
  const taxFaq = taxSummary
    ? {
        q: `Is overtime taxed differently in ${rules.stateName}?`,
        a: `No -- overtime pay isn't taxed at a different rate than your regular wages. It's simply added to your gross pay for that period and withheld the same way as any other pay. ${taxSummary}`,
      }
    : null;
  const faqItems = [...(flagship?.faq ?? []), ...(taxFaq ? [taxFaq] : [])];
  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }
      : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
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

        {flagship && biweeklyExample && shiftComparison && (
          <>
            <section>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {rules.stateName} minimum wage and exempt-salary rules
              </h2>
              <dl className="mt-3 space-y-4">
                <div>
                  <dt className="font-medium text-neutral-800 dark:text-neutral-200">Minimum wage</dt>
                  <dd className="mt-1">
                    {flagship.minimumWage.summary}{" "}
                    <a href={flagship.minimumWage.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline dark:text-blue-400">
                      ({flagship.minimumWage.sourceLabel})
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-800 dark:text-neutral-200">Tipped employees</dt>
                  <dd className="mt-1">
                    {flagship.tippedWage.summary}{" "}
                    <a href={flagship.tippedWage.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline dark:text-blue-400">
                      ({flagship.tippedWage.sourceLabel})
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-800 dark:text-neutral-200">
                    Exempt (salaried) employee salary threshold
                  </dt>
                  <dd className="mt-1">
                    {flagship.exemptSalaryThreshold.summary}{" "}
                    <a href={flagship.exemptSalaryThreshold.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline dark:text-blue-400">
                      ({flagship.exemptSalaryThreshold.sourceLabel})
                    </a>
                  </dd>
                </div>
              </dl>
              <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Common mistake: {flagship.commonMistake}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Example: biweekly confusion in {rules.stateName}
              </h2>
              <p className="mt-2">
                Same hourly rate ({currency.format(EXAMPLE_HOURLY_RATE)}/hour), 35 hours in week 1
                and 45 hours in week 2 — 80 hours total either way:
              </p>
              <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1 rounded-lg border border-neutral-200 p-4 text-xs dark:border-neutral-800">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Week</span>
                <span className="text-right font-medium text-neutral-800 dark:text-neutral-200">Regular</span>
                <span className="text-right font-medium text-neutral-800 dark:text-neutral-200">Overtime</span>
                <span>Week 1 (35 hrs)</span>
                <span className="text-right">{biweeklyExample.week1.regularHours} hrs</span>
                <span className="text-right">{biweeklyExample.week1.overtimeHours} hrs</span>
                <span>Week 2 (45 hrs)</span>
                <span className="text-right">{biweeklyExample.week2.regularHours} hrs</span>
                <span className="text-right">{biweeklyExample.week2.overtimeHours} hrs</span>
                <span className="border-t border-neutral-200 pt-2 font-semibold dark:border-neutral-800">
                  Biweekly total
                </span>
                <span className="col-span-2 border-t border-neutral-200 pt-2 text-right font-semibold dark:border-neutral-800">
                  {currency.format(biweeklyExample.totals.totalPay)}
                </span>
              </div>
              <p className="mt-3">
                Week 2 still owes {biweeklyExample.week2.overtimeHours} overtime hours even though
                the two-week total is a plain 80 hours — overtime in {rules.stateName} is
                calculated per workweek, not by averaging the pay period. See the{" "}
                <Link href="/biweekly-overtime-calculator" className="text-blue-600 underline dark:text-blue-400">
                  biweekly overtime calculator
                </Link>{" "}
                for more examples.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Example: 3x12 vs. 4x12 schedules in {rules.stateName}
              </h2>
              <p className="mt-2">
                Two common 12-hour-shift schedules, same {currency.format(EXAMPLE_HOURLY_RATE)}/hour rate:
              </p>
              <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1 rounded-lg border border-neutral-200 p-4 text-xs dark:border-neutral-800">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Schedule</span>
                <span className="text-right font-medium text-neutral-800 dark:text-neutral-200">OT hours</span>
                <span className="text-right font-medium text-neutral-800 dark:text-neutral-200">Total pay</span>
                <span>3 days × 12 hrs (36 hrs/week)</span>
                <span className="text-right">
                  {shiftComparison.threeByTwelve.overtimeHours + shiftComparison.threeByTwelve.doubleTimeHours} hrs
                </span>
                <span className="text-right">{currency.format(shiftComparison.threeByTwelve.totalPay)}</span>
                <span>4 days × 12 hrs (48 hrs/week)</span>
                <span className="text-right">
                  {shiftComparison.fourByTwelve.overtimeHours + shiftComparison.fourByTwelve.doubleTimeHours} hrs
                </span>
                <span className="text-right">{currency.format(shiftComparison.fourByTwelve.totalPay)}</span>
              </div>
              <p className="mt-3">
                Want to compare your own rate, days, and shift differential?{" "}
                <Link href="/#compare-schedules" className="text-blue-600 underline dark:text-blue-400">
                  Use the schedule comparison tool
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {rules.stateName}-specific FAQ
              </h2>
              <div className="mt-3 space-y-4">
                {flagship.faq.map(({ q, a }) => (
                  <div key={q}>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">{q}</p>
                    <p className="mt-1">{a}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {taxFaq && (
          <section>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {taxFaq.q}
            </h2>
            <p className="mt-2">{taxFaq.a}</p>
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
