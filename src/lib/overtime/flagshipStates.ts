import type { StateCode } from "./types";

/**
 * Extended, independently-researched content for a small set of flagship
 * state pages (CT, NY, NJ, CA, MA) -- NOT applied to all 51 state pages.
 *
 * Deliberate scope decision (2026-09-12): a competitive/content-depth
 * review correctly pointed out that most of the 51 state pages are thin
 * relative to competitor sites that publish real minimum-wage/exempt-
 * threshold/tipped-wage data per state. The fix is NOT to pad all 51 with
 * filler -- most states genuinely just follow the federal FLSA baseline,
 * and inventing fake "unique" content for them would be worse (exactly
 * the kind of low-value, AI-generated-filler pattern Google's helpful-
 * content guidance warns against). Instead: research and add REAL,
 * source-cited depth to a handful of high-traffic states first, and only
 * expand further once this is proven out.
 *
 * Every figure below was checked against an official (.gov) source as of
 * 2026-09-12, not taken from a secondary aggregator/blog -- see each
 * entry's `sourceUrl`. These figures change (most on Jan 1 each year) --
 * re-verify before trusting this file long after that date.
 */

export interface SourcedFact {
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface FlagshipStateContent {
  minimumWage: SourcedFact;
  tippedWage: SourcedFact;
  exemptSalaryThreshold: SourcedFact;
  commonMistake: string;
  faq: { q: string; a: string }[];
}

export const FLAGSHIP_STATES: Partial<Record<StateCode, FlagshipStateContent>> = {
  CT: {
    minimumWage: {
      summary: "$16.94/hour, effective January 1, 2026 (adjusted annually based on the federal employment cost index).",
      sourceLabel: "Governor Lamont's 2026 minimum wage announcement",
      sourceUrl: "https://portal.ct.gov/governor/news/press-releases/2025/09-2025/governor-lamont-announces-minimum-wage-will-increase",
    },
    tippedWage: {
      summary: "Employers may pay a lower cash wage -- $6.38/hour for waitstaff, $8.23/hour for bartenders -- as long as tips bring total pay up to the full $16.94/hour minimum. Connecticut plans to phase out these tipped rates entirely by July 1, 2027.",
      sourceLabel: "CT DOL Wage and Workplace Standards",
      sourceUrl: "https://portal.ct.gov/dol/divisions/wage-and-workplace-standards",
    },
    exemptSalaryThreshold: {
      summary: "Connecticut hasn't set its own higher exempt-salary threshold -- the federal minimum of $684/week ($35,568/year) applies for the executive, administrative, and professional exemptions.",
      sourceLabel: "CT DOL Wage and Workplace Standards",
      sourceUrl: "https://portal.ct.gov/dol/divisions/wage-and-workplace-standards",
    },
    commonMistake: "The most common Connecticut mistake isn't about the state's own rule (Connecticut just follows the federal 40-hour weekly standard) -- it's averaging hours across a biweekly pay period instead of calculating overtime for each 7-day workweek separately. See the biweekly overtime calculator below for exactly why that's wrong.",
    faq: [
      {
        q: "Does Connecticut have daily overtime, like California?",
        a: "No. Connecticut follows the federal FLSA standard: overtime after 40 hours in a workweek, with no separate daily-overtime or double-time rule.",
      },
      {
        q: "What's the minimum wage in Connecticut right now?",
        a: "$16.94/hour as of January 1, 2026, adjusted annually. It's scheduled to rise to $17.48/hour on January 1, 2027.",
      },
      {
        q: "Can a Connecticut restaurant pay servers less than minimum wage?",
        a: "Yes, if tips make up the difference: $6.38/hour cash wage for waitstaff or $8.23/hour for bartenders, as long as tips bring total pay to at least $16.94/hour. If they don't, the employer must make up the shortfall.",
      },
    ],
  },
  NY: {
    minimumWage: {
      summary: "$17.00/hour in New York City, Long Island, and Westchester County; $16.00/hour in the rest of the state -- both effective January 1, 2026.",
      sourceLabel: "NY Department of Labor, Minimum Wage",
      sourceUrl: "https://dol.ny.gov/minimum-wage",
    },
    tippedWage: {
      summary: "Rates vary by region and job type. Food service workers: $11.35/hour cash wage (NYC/Long Island/Westchester) or $10.70/hour (rest of state). Service employees: $14.15/hour (NYC/Long Island/Westchester) or $13.30/hour (rest of state). Tips must make up the difference to the full regional minimum wage.",
      sourceLabel: "NY Department of Labor, Minimum Wage for Tipped Workers",
      sourceUrl: "https://dol.ny.gov/minimum-wage-tipped-workers",
    },
    exemptSalaryThreshold: {
      summary: "$1,275.00/week ($66,300/year) in NYC, Nassau, Suffolk, and Westchester counties; $1,199.10/week ($62,353.20/year) elsewhere in the state -- both meaningfully higher than the federal $684/week floor, effective January 1, 2026. New York hasn't set its own threshold for the professional exemption specifically, so the federal $684/week figure still applies there.",
      sourceLabel: "NY Department of Labor",
      sourceUrl: "https://dol.ny.gov/minimum-wage",
    },
    commonMistake: "The most common New York mistake is applying the statewide $16.00 rate (or its matching exempt-salary threshold) to employees who actually work in NYC, Long Island, or Westchester, where both the minimum wage and the exempt-salary threshold are higher. Which rate applies depends on where the work is performed, not where the company is headquartered.",
    faq: [
      {
        q: "Does the higher NYC minimum wage change my overtime rate too?",
        a: "Yes -- your overtime rate is 1.5x whatever your actual regular rate is. If you're paid the NYC-area minimum ($17.00/hour), your overtime rate is at least $25.50/hour, not the $24.00/hour you'd get off the $16.00 statewide rate.",
      },
      {
        q: "I work in NYC but my employer is based upstate. Which minimum wage applies?",
        a: "The rate is based on where the work is actually performed, not where the company is headquartered -- an employee working in NYC is covered by the NYC-area rate even if payroll is run from an upstate office.",
      },
      {
        q: "Is New York's overtime rule daily or weekly?",
        a: "Weekly -- New York follows the federal 40-hour workweek standard for most employees. (Live-in/residential employees have a separate 44-hour threshold, not modeled by this calculator.)",
      },
    ],
  },
  NJ: {
    minimumWage: {
      summary: "$15.92/hour for most employees, effective January 1, 2026. Seasonal and small-employer (fewer than 6 employees) rates are lower ($15.23/hour) as part of a scheduled phase-in through 2028, and agricultural workers have their own rate ($14.20/hour).",
      sourceLabel: "New Jersey Business Action Center",
      sourceUrl: "https://business.nj.gov/updates/minimum-wage-now-15-92-per-hour-for-most-workers",
    },
    tippedWage: {
      summary: "Employers using a tip credit must pay at least $6.05/hour in cash wages (a $9.87/hour maximum tip credit). If cash wages plus tips don't reach $15.92/hour for a given hour, the employer must make up the difference.",
      sourceLabel: "New Jersey Business Action Center",
      sourceUrl: "https://business.nj.gov/updates/minimum-wage-now-15-92-per-hour-for-most-workers",
    },
    exemptSalaryThreshold: {
      summary: "New Jersey uses the federal salary threshold ($684/week, $35,568/year) for the executive, administrative, and professional exemptions -- it hasn't set its own higher figure.",
      sourceLabel: "NJ Department of Labor and Workforce Development",
      sourceUrl: "https://www.nj.gov/labor/",
    },
    commonMistake: "New Jersey follows the federal 40-hour weekly standard with no separate daily-overtime rule, so the most common mistake here is the general biweekly one: averaging hours across a two-week pay period instead of calculating overtime for each workweek separately. See the biweekly overtime calculator below.",
    faq: [
      {
        q: "What's New Jersey's minimum wage for 2026?",
        a: "$15.92/hour for most employees, effective January 1, 2026. Seasonal/small-employer and agricultural workers have their own lower, phased-in rates.",
      },
      {
        q: "Does New Jersey have daily overtime?",
        a: "No. New Jersey follows the federal FLSA standard: overtime after 40 hours in a single workweek, with no separate daily-overtime or double-time rule.",
      },
      {
        q: "Can my New Jersey employer pay me less than minimum wage if I get tips?",
        a: "Only down to $6.05/hour in direct cash wages, and only if your tips make up the rest of the $15.92/hour minimum for every hour worked. If they don't, your employer owes you the difference.",
      },
    ],
  },
  CA: {
    minimumWage: {
      summary: "$16.90/hour statewide, effective January 1, 2026 -- but dozens of California cities and counties set higher local minimums (Emeryville is highest, at $20.34/hour as of mid-2026), and fast food and many healthcare workers have their own separate, higher state minimums.",
      sourceLabel: "CA Department of Industrial Relations",
      sourceUrl: "https://www.dir.ca.gov/dlse/faq_minimumwage.htm",
    },
    tippedWage: {
      summary: "California does not allow a tip credit at all -- tipped employees must receive the full applicable minimum wage (state or local, whichever is higher) before tips, with no reduced cash wage.",
      sourceLabel: "CA Department of Industrial Relations",
      sourceUrl: "https://www.dir.ca.gov/dlse/faq_minimumwage.htm",
    },
    exemptSalaryThreshold: {
      summary: "$1,352/week ($70,304/year) for the executive, administrative, and professional exemptions, effective January 1, 2026 -- California's formula is exactly twice the state minimum wage for a 40-hour week. Computer software professionals ($58.85/hour or $10,214.44/month) and licensed physicians/surgeons ($107.17/hour) have their own separate, higher thresholds.",
      sourceLabel: "CA Department of Industrial Relations",
      sourceUrl: "https://www.dir.ca.gov/dlse/faq_minimumwage.htm",
    },
    commonMistake: "The most common California mistake is tracking only weekly hours and missing the state's daily-overtime rule (over 8 hours/day) and 7th-consecutive-day premium -- both apply on top of, not instead of, the 40-hour weekly rule. See The rules above for exactly how the three triggers interact.",
    faq: [
      {
        q: "Do I get both daily and weekly overtime in the same week?",
        a: "You get whichever is greater for each hour, never both stacked on the same hour. California applies three triggers (over 8/day, over 40/week, the 7th-consecutive-day premium) and pays each hour once, at its highest applicable rate.",
      },
      {
        q: "What's California's 7th-consecutive-day rule?",
        a: "If you work all 7 days of one workweek, the entire 7th day is paid at 1.5x minimum, with double time (2x) for any hours past 8 that day -- even if your weekly total wouldn't otherwise trigger overtime.",
      },
      {
        q: "Does my city's higher minimum wage change my overtime rate?",
        a: "Yes -- your overtime multiplier applies to your actual regular rate, so if your city's minimum wage is higher than the $16.90/hour state rate, your overtime pay is 1.5x (or 2x) that higher local rate, not the state minimum.",
      },
    ],
  },
  MA: {
    minimumWage: {
      summary: "$15.00/hour, unchanged since January 1, 2023.",
      sourceLabel: "Mass.gov Minimum Wage Program",
      sourceUrl: "https://www.mass.gov/minimum-wage-program",
    },
    tippedWage: {
      summary: "Employers may pay tipped employees a $6.75/hour base service rate if the worker customarily receives more than $20/month in tips, the employer gave notice of the tip credit, and tips plus $6.75 add up to at least $15.00 for every hour of that shift -- checked shift by shift, not averaged over a pay period. If any shift falls short, the employer must make up the difference for that shift.",
      sourceLabel: "Mass.gov Minimum Wage Program",
      sourceUrl: "https://www.mass.gov/minimum-wage-program",
    },
    exemptSalaryThreshold: {
      summary: "Massachusetts uses the federal salary threshold ($684/week, $35,568/year) for the executive, administrative, and professional exemptions -- it hasn't set its own higher figure.",
      sourceLabel: "Mass.gov Minimum Wage Program",
      sourceUrl: "https://www.mass.gov/minimum-wage-program",
    },
    commonMistake: "Massachusetts follows the federal 40-hour weekly standard with no separate daily-overtime rule, so the most common mistake here is the general biweekly one: averaging hours across a two-week pay period instead of calculating overtime for each workweek separately. See the biweekly overtime calculator below.",
    faq: [
      {
        q: "What's Massachusetts's minimum wage for 2026?",
        a: "$15.00/hour, unchanged since January 1, 2023.",
      },
      {
        q: "Does Massachusetts have daily overtime?",
        a: "No. Massachusetts follows the federal FLSA standard: overtime after 40 hours in a single workweek.",
      },
      {
        q: "How does the tipped minimum wage work in Massachusetts?",
        a: "Employers can pay a $6.75/hour base rate if tips bring the total to at least $15.00/hour for every individual shift -- it's checked shift by shift, so a slow shift's shortfall must be made up by the employer even if a busier shift the same week made up for it on average.",
      },
    ],
  },
};

export function getFlagshipContent(state: StateCode): FlagshipStateContent | undefined {
  return FLAGSHIP_STATES[state];
}
