import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Paycheck Overtime Calculator",
  description: "How paycheckovertime.com handles your data and uses advertising cookies.",
};

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← Back to calculator
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-1 text-sm text-neutral-500">Last updated: August 30, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Overview
          </h2>
          <p className="mt-2">
            Paycheck Overtime Calculator (paycheckovertime.com) is a free tool for
            estimating overtime pay. This policy explains what happens with your
            data when you use it.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            The calculator itself doesn&apos;t collect your data
          </h2>
          <p className="mt-2">
            There are no accounts, no sign-up, and no server behind the
            calculator. The state, hourly rate, and hours you enter are
            processed entirely in your own browser to compute the results
            shown on screen. That information is never sent to us, stored by
            us, or seen by us in any form.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Advertising and cookies (Google AdSense)
          </h2>
          <p className="mt-2">
            This site shows ads through Google AdSense. Google and its
            advertising partners may use cookies, device identifiers, or
            similar technologies to serve ads based on your visits to this
            and other websites, and to measure ad performance. We don&apos;t
            control this data collection directly — it&apos;s governed by
            Google&apos;s own policies:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <a
                href="https://policies.google.com/technologies/partner-sites"
                className="text-blue-600 underline dark:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                How Google uses information from sites that use its services
              </a>
            </li>
            <li>
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-600 underline dark:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            If you&apos;re in the EEA, UK, or Switzerland
          </h2>
          <p className="mt-2">
            Visitors from the European Economic Area, the UK, and Switzerland
            are shown a consent banner before any advertising cookies are
            set, letting you consent, decline, or manage detailed
            preferences. You can change your choice at any time by clearing
            your browser&apos;s cookies for this site, which will show the
            banner again on your next visit.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Your choices
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              Opt out of personalized advertising from Google at{" "}
              <a
                href="https://adssettings.google.com"
                className="text-blue-600 underline dark:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Ads Settings
              </a>
              .
            </li>
            <li>
              Opt out of many third-party ad networks&apos; personalized
              advertising at{" "}
              <a
                href="https://optout.aboutads.info"
                className="text-blue-600 underline dark:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                aboutads.info
              </a>
              .
            </li>
            <li>
              Block or clear cookies at any time through your browser&apos;s
              own settings.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Children&apos;s privacy
          </h2>
          <p className="mt-2">
            This site is not directed at children under 13, and we do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Changes to this policy
          </h2>
          <p className="mt-2">
            We may update this policy from time to time. Changes will be
            posted on this page with an updated &quot;Last updated&quot;
            date.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Contact
          </h2>
          <p className="mt-2">
            Questions about this policy? Email{" "}
            <a
              href="mailto:royalplanet2009@gmail.com"
              className="text-blue-600 underline dark:text-blue-400"
            >
              royalplanet2009@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
