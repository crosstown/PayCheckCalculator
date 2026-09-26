import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import VisitorCounter from "@/components/VisitorCounter";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-X2TH19CWM5";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Reused by openGraph/twitter below so title/description only need to be
// true in one place -- kept honest to what the calculator actually does
// today (regular/overtime/gross/take-home pay, state-specific rules), not
// features it doesn't have yet (e.g. shift differential isn't a real
// input as of this writing -- don't advertise it until it is).
const SITE_TITLE = "Paycheck Overtime Calculator — Weekly, Biweekly & State Overtime Pay";
const SITE_DESCRIPTION =
  "Estimate regular pay, overtime pay, and take-home pay for hourly workers, with state-specific overtime rules for all 50 states + DC. Free, no sign-up.";

export const metadata: Metadata = {
  // Lets each page's `alternates.canonical` be a relative path ("/",
  // "/privacy") instead of hardcoding the full domain everywhere --
  // and, more importantly, actually emits a canonical tag at all.
  // 2026-09-04: added after Search Console flagged "Duplicate without
  // user-selected canonical" -- www.paycheckovertime.com and the bare
  // domain both serve identical content with no signal of which one
  // is authoritative, so Google was seeing two copies of every page.
  metadataBase: new URL("https://paycheckovertime.com"),
  // Plain string, not a {default, template} object -- a template would
  // append "— Paycheck Overtime Calculator" to every child page's own
  // title (state pages, the biweekly page), pushing already-tight titles
  // like "California Overtime Pay Laws & Calculator (2026)" past 60
  // characters and into SERP truncation for no benefit -- each page's own
  // title is already complete and specific.
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true },
  // No og:image yet -- a real one (a simple branded card, not a
  // screenshot) is worth adding later, but a missing image just means
  // link previews render without a thumbnail, not broken; not worth
  // blocking this pass on producing one.
  openGraph: {
    type: "website",
    url: "https://paycheckovertime.com",
    siteName: "Paycheck Overtime Calculator",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const WEB_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Paycheck Overtime Calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  url: "https://paycheckovertime.com/",
  description: SITE_DESCRIPTION,
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* WebApplication structured data -- eligible rich-result types for a
            free web tool are thin (no special SERP treatment expected), but
            this still helps Google's entity understanding of what the site
            is, at zero cost/risk. dangerouslySetInnerHTML avoids Next
            double-escaping the JSON; JSON.stringify on our own static
            object, not user input, so no injection concern.

            Known dev-console noise, investigated and confirmed harmless:
            AdSense's own script inserts an additional <script> node at the
            very front of <head> at runtime (its own fetchpriority="high"
            behavior), which collides with whatever React finds in that
            position during hydration and logs a "won't be patched up"
            mismatch warning regardless of where this tag sits in the JSX
            (moving it didn't change anything -- tried it). Verified directly
            via document.querySelectorAll after hydration settles: the
            correct JSON-LD ends up in the live DOM every time, and the
            static-exported HTML Googlebot/curl actually fetches already has
            it right from prerendering, untouched by any of this -- so this
            is React-vs-AdSense console noise, not a real content bug. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_APPLICATION_JSON_LD) }}
        />
        {/* AdSense verification: Google's instructions say to place this
            literal <script> tag between <head></head> on every page, and
            their review crawler checks for exactly that. next/script's
            optimized strategies (even beforeInteractive) don't render a
            literal <script src> in the static HTML -- they render a
            preload link + an inline bootstrap script that injects the
            real tag via JS instead, which risks not matching what a
            literal-markup check expects. A plain script tag here
            guarantees the exact literal markup Google asked for. */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5479758505355786"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* No literal-markup requirement like AdSense's tag above, so
            next/script's optimized loading is fine here. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800">
          <Link href="/overtime" className="hover:underline">
            Overtime Laws by State
          </Link>
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <VisitorCounter />
        </footer>
      </body>
    </html>
  );
}
