import type { Metadata } from "next";
import Link from "next/link";

const TITLE = "About — Paycheck Overtime Calculator";
const DESCRIPTION =
  "Who built the Paycheck Overtime Calculator and why -- an independent, ad-supported tool for estimating overtime pay and understanding state overtime rules.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    siteName: "Paycheck Overtime Calculator",
    url: "/about",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function About() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← Back to calculator
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">About</h1>

      <div className="mt-8 space-y-6 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
        <section>
          <p>
            Paycheck Overtime Calculator is a free, independent tool for
            hourly workers who want a straight answer to "how much will my
            overtime actually pay?" -- built around real, state-specific
            overtime rules rather than a one-size-fits-all 1.5x estimate.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            What it is
          </h2>
          <p className="mt-2">
            A browser-based calculator that takes your hourly rate and hours
            worked and estimates regular pay, overtime pay, and take-home
            pay, using the federal 40-hour weekly rule plus any state-specific
            daily-overtime or double-time rules that apply. See{" "}
            <Link href="/overtime" className="text-blue-600 underline dark:text-blue-400">
              overtime laws by state
            </Link>{" "}
            for the rules behind the numbers, or the{" "}
            <Link href="/biweekly-overtime-calculator" className="text-blue-600 underline dark:text-blue-400">
              biweekly overtime calculator
            </Link>{" "}
            if you're paid every two weeks and want to see why overtime
            doesn't average out across a pay period.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            What it isn&apos;t
          </h2>
          <p className="mt-2">
            This site isn&apos;t a payroll provider, employer, or law firm,
            and it doesn&apos;t collect the numbers you enter. It&apos;s a
            calculator built on publicly cited state labor-department
            sources, not a substitute for advice from your employer&apos;s
            payroll department, a licensed tax professional, or your
            state&apos;s labor department for your specific situation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            How it&apos;s funded
          </h2>
          <p className="mt-2">
            The site is free to use and supported by Google AdSense
            advertising. See the{" "}
            <Link href="/privacy" className="text-blue-600 underline dark:text-blue-400">
              privacy policy
            </Link>{" "}
            for how advertising cookies work here.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Questions or feedback?
          </h2>
          <p className="mt-2">
            Get in touch on the{" "}
            <Link href="/contact" className="text-blue-600 underline dark:text-blue-400">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
