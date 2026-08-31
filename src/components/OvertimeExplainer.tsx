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

      <h2 className="mt-8 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Frequently asked questions
      </h2>
      <div className="mt-3 space-y-4">
        <div>
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            Does this calculator account for taxes?
          </p>
          <p className="mt-1">
            Yes — expand &quot;Show estimated taxes &amp; take-home
            pay&quot; under your result to see federal income tax, FICA
            (Social Security and Medicare), and state income tax withholding
            estimates alongside your gross overtime pay.
          </p>
        </div>
        <div>
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            Is salaried overtime covered?
          </p>
          <p className="mt-1">
            This tool assumes an hourly, non-exempt employee. Salaried
            employees may or may not be entitled to overtime depending on
            their job duties and salary level under federal and state
            exemption tests — that determination is outside the scope of
            this calculator.
          </p>
        </div>
        <div>
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            Is this legal or tax advice?
          </p>
          <p className="mt-1">
            No. Figures here are estimates for general informational
            purposes only, based on published state and federal overtime and
            withholding rules as of 2026. For your specific situation,
            consult your employer&apos;s payroll department, a licensed tax
            professional, or your state&apos;s labor department.
          </p>
        </div>
      </div>
    </section>
  );
}
