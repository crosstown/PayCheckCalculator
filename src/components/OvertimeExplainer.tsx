import Link from "next/link";

const LAST_REVIEWED = "September 2026";

const FAQ_ITEMS = [
  {
    q: "Does this calculator account for taxes?",
    a: 'Yes — expand "Show estimated taxes & take-home pay" under your result to see federal income tax, FICA (Social Security and Medicare), and state income tax withholding estimates alongside your gross overtime pay.',
  },
  {
    q: "Is salaried overtime covered?",
    a: "This tool assumes an hourly, non-exempt employee. Salaried employees may or may not be entitled to overtime depending on their job duties and salary level under federal and state exemption tests — that determination is outside the scope of this calculator.",
  },
  {
    q: "Is this legal or tax advice?",
    a: `No. Figures here are estimates for general informational purposes only, based on published state and federal overtime and withholding rules as of ${LAST_REVIEWED}. For your specific situation, consult your employer's payroll department, a licensed tax professional, or your state's labor department.`,
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

export default function OvertimeExplainer() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-16 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        How overtime pay works
      </h2>
      <p className="mt-3">
        Under the federal Fair Labor Standards Act (FLSA), most hourly
        (non-exempt) employees in the U.S. are entitled to overtime pay —
        1.5x their regular rate — for any hours worked beyond 40 in a single
        workweek. That 40-hour weekly threshold is the baseline this
        calculator uses for the majority of states, since most states either
        adopt the federal rule directly or don&apos;t have a separate
        overtime statute of their own.
      </p>
      <p className="mt-3">
        A handful of states go further, layering extra protections on top of
        that federal floor:
      </p>
      <ul className="mt-3 list-inside list-disc space-y-2">
        <li>
          <strong className="text-neutral-800 dark:text-neutral-200">
            California
          </strong>{" "}
          requires overtime daily as well as weekly: 1.5x for hours over 8 in
          a single workday, and 2x (&quot;double time&quot;) for hours over
          12 in a day. Work all seven days of one workweek, and the entire
          7th day is paid at 1.5x minimum, with double time past 8 hours
          that day.
        </li>
        <li>
          <strong className="text-neutral-800 dark:text-neutral-200">
            Nevada&apos;s
          </strong>{" "}
          daily overtime rule (over 8 hours in a 24-hour period) only applies
          if you&apos;re paid less than 1.5x the state minimum wage —
          currently under $18.00/hour. Above that rate, or under a written
          4-day/10-hour schedule agreement, only the weekly 40-hour rule
          applies.
        </li>
        <li>
          <strong className="text-neutral-800 dark:text-neutral-200">
            Colorado
          </strong>{" "}
          requires 1.5x for hours over 12 in a workday, in addition to the
          standard 40-hour weekly rule.
        </li>
        <li>
          <strong className="text-neutral-800 dark:text-neutral-200">
            Alaska
          </strong>{" "}
          requires 1.5x for hours over 8 in a workday — not just 40/week —
          though a filed flexible-schedule plan can raise that daily
          threshold to 10 hours.
        </li>
        <li>
          <strong className="text-neutral-800 dark:text-neutral-200">
            Kentucky&apos;s
          </strong>{" "}
          weekly rule is standard, but if you work all 7 days of a week that
          already exceeds 40 hours, the entire 7th day is paid at 1.5x.
        </li>
      </ul>
      <p className="mt-3">
        This calculator applies the correct rule set automatically based on
        the state you select, so you don&apos;t have to remember which state
        has which exception.
      </p>

      <p className="mt-3">
        <Link href="/overtime" className="text-blue-600 underline dark:text-blue-400">
          Browse full overtime rules for every state →
        </Link>
      </p>

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <h2 className="mt-8 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        About this calculator
      </h2>
      <div className="mt-3 space-y-3">
        <p>
          Paycheck Overtime Calculator is an independent, free tool built to
          help hourly workers quickly check whether a paycheck looks right —
          no account, no sign-up, no data collection.
        </p>
        <p>
          <strong className="text-neutral-800 dark:text-neutral-200">
            What it calculates:
          </strong>{" "}
          regular pay, overtime (and where applicable, daily overtime and
          double-time) pay, gross pay, and — optionally — estimated federal
          and state tax withholding and take-home pay, using each state&apos;s
          own overtime rules.
        </p>
        <p>
          <strong className="text-neutral-800 dark:text-neutral-200">
            What it doesn&apos;t calculate:
          </strong>{" "}
          exempt/non-exempt classification, union or collective-bargaining
          agreement terms, tipped-wage credits, industry-specific rules (e.g.
          agriculture, live-in care), or your employer&apos;s specific payroll
          policies — those can all change what you&apos;re actually owed.
        </p>
        <p>
          <strong className="text-neutral-800 dark:text-neutral-200">
            Sources:
          </strong>{" "}
          the federal Fair Labor Standards Act (29 U.S.C. § 207) and each
          state&apos;s own wage-and-hour statute — cited directly on that
          state&apos;s page under{" "}
          <Link href="/overtime" className="text-blue-600 underline dark:text-blue-400">
            Overtime Laws by State
          </Link>
          .
        </p>
        <p className="text-neutral-500 dark:text-neutral-500">
          Last reviewed: {LAST_REVIEWED}. This is an estimate for general
          informational purposes only, not legal, tax, or payroll advice —
          see the FAQ above. Questions or corrections:{" "}
          <a
            href="mailto:royalplanet2009@gmail.com"
            className="underline hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            royalplanet2009@gmail.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
