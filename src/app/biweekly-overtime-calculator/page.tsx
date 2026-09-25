import type { Metadata } from "next";
import Link from "next/link";
import BiweeklyCalculator from "@/components/BiweeklyCalculator";

const TITLE = "Biweekly Overtime Calculator | Calculate Weekly Overtime in a 2-Week Pay Period";
const DESCRIPTION =
  "Estimate overtime in a biweekly paycheck. Enter hours for week 1 and week 2 to see why overtime is usually calculated by workweek, not by total 80-hour pay period.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/biweekly-overtime-calculator" },
  // Root layout's openGraph/twitter are fixed to the homepage's own
  // url/title -- without an override here, sharing this page would show a
  // link preview pointing back to the homepage instead of this one.
  openGraph: {
    type: "website",
    siteName: "Paycheck Overtime Calculator",
    url: "/biweekly-overtime-calculator",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

const BREADCRUMB_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://paycheckovertime.com/" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Biweekly Overtime Calculator",
      item: "https://paycheckovertime.com/biweekly-overtime-calculator",
    },
  ],
};

const FAQ_ITEMS = [
  {
    q: "Is overtime calculated weekly or biweekly?",
    a: "Weekly. Under the federal Fair Labor Standards Act (FLSA), overtime is calculated per 7-day workweek, not by adding up the two weeks in a biweekly pay period. A biweekly paycheck is just two separate workweeks paid together on one check.",
  },
  {
    q: "Can my employer average two weeks to avoid overtime?",
    a: "No. \"Averaging\" hours across two workweeks to avoid paying overtime (e.g. paying straight time for 45 hours one week and 35 the next, treating it as an 80-hour average) is not permitted under the FLSA for non-exempt employees. Each workweek stands on its own.",
  },
  {
    q: "What if I work 45 hours one week and 35 the next?",
    a: "You're owed 5 overtime hours for the 45-hour week, regardless of the 35-hour week. The two weeks are not netted against each other — see Example 1 below.",
  },
  {
    q: "Does biweekly pay mean overtime starts after 80 hours?",
    a: "No. This is the single most common misunderstanding about biweekly overtime. Overtime starts after 40 hours in EACH individual workweek, not after 80 hours across the full pay period. You can work exactly 80 hours total and still be owed overtime, or work under 80 total and owe none — it depends entirely on how those hours split across the two weeks.",
  },
  {
    q: "Does state law change the calculation?",
    a: "It can. Most states use the same 40-hour weekly threshold as federal law, but a handful (California, Alaska, Colorado, and others) add daily-overtime or double-time rules on top of it. See the full calculator's state selector, or your state's page under Overtime Laws by State, for state-specific rules.",
  },
  {
    q: "What is time and a half?",
    a: "\"Time and a half\" means 1.5x your regular hourly rate — the standard overtime multiplier under federal law and most states. At $20/hour, time and a half is $30/hour.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function BiweeklyOvertimeCalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← Back to calculator
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Biweekly Overtime Calculator
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        A biweekly paycheck covers two weeks, but overtime is usually
        calculated separately for each workweek — not by adding both weeks
        together. That means 35 hours in week 1 and 45 hours in week 2 is
        <strong className="text-neutral-800 dark:text-neutral-200"> not</strong>{" "}
        the same as simply working 80 total hours. Enter each week&apos;s
        hours below to see the real breakdown.
      </p>

      <div className="mt-8">
        <BiweeklyCalculator />
      </div>

      <section className="mt-12 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Worked examples
        </h2>

        <div className="mt-4 space-y-6">
          <div>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">
              Example 1: 35 hours, then 45 hours
            </p>
            <p className="mt-1">
              $20/hour. Week 1: 35 hours. Week 2: 45 hours.
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>Week 1: 35 regular hours × $20 = $700 regular pay, $0 overtime</li>
              <li>Week 2: 40 regular hours × $20 = $800, plus 5 overtime hours × $30 = $150</li>
              <li className="font-medium text-neutral-800 dark:text-neutral-200">
                Total biweekly gross pay: $1,650
              </li>
            </ul>
            <p className="mt-1">
              Even though the total is 80 hours across two weeks, week 2
              still has 5 overtime hours — because overtime is calculated by
              workweek, not by the two-week average.
            </p>
          </div>

          <div>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">
              Example 2: An even 40/40 split
            </p>
            <p className="mt-1">
              $25/hour. Week 1: 40 hours. Week 2: 40 hours. Total: 80 hours.
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>No overtime in either week (neither exceeds 40 hours)</li>
              <li className="font-medium text-neutral-800 dark:text-neutral-200">
                Total biweekly gross pay: $2,000
              </li>
            </ul>
            <p className="mt-1">
              Same 80-hour total as Example 1, but zero overtime — because
              this time neither individual week crossed 40 hours.
            </p>
          </div>

          <div>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">
              Example 3: A heavy week followed by a light one
            </p>
            <p className="mt-1">
              $30/hour. Week 1: 48 hours. Week 2: 36 hours.
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>Week 1: 8 overtime hours (48 − 40)</li>
              <li>Week 2: 0 overtime hours (36 is under 40)</li>
            </ul>
            <p className="mt-1">
              The lighter 36-hour second week does not cancel out or reduce
              the overtime already owed from the 48-hour first week — each
              week is evaluated on its own.
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Frequently asked questions
        </h2>
        <div className="mt-3 space-y-4">
          {FAQ_ITEMS.map(({ q, a }) => (
            <div key={q}>
              <p className="font-medium text-neutral-800 dark:text-neutral-200">{q}</p>
              <p className="mt-1">{a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8">
          <Link href="/" className="text-blue-600 underline dark:text-blue-400">
            Paycheck Overtime Calculator
          </Link>{" "}
          — full calculator with weekly, biweekly, and semi-monthly pay
          periods, plus estimated taxes and take-home pay.
          <br />
          <Link href="/overtime" className="text-blue-600 underline dark:text-blue-400">
            Overtime laws by state
          </Link>{" "}
          — daily-overtime, double-time, and 7th-day rules for all 50 states + DC.
        </p>

        <p className="mt-4 text-xs text-neutral-400">
          This is an estimate for general informational purposes only, not
          legal or payroll advice. Last reviewed: September 2026.
        </p>
      </section>
    </div>
  );
}
