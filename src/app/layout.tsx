import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paycheck Overtime Calculator",
  description:
    "Estimate overtime pay for all 50 states + DC. Free, no sign-up.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
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
        <div className="flex-1">{children}</div>
        <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </footer>
      </body>
    </html>
  );
}
