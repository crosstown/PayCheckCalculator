import type { StateCode } from "./types";

/**
 * Extended, independently-researched content for a small set of flagship
 * state pages (CT, NY, NJ, CA, MA, TX, FL, WA, IL) -- NOT applied to all
 * 51 state pages.
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
 *
 * TX/FL/WA/IL added 2026-09-28 (same sourcing bar: every figure checked
 * against an official .gov page/document, not an aggregator) -- chosen as
 * the next 4 highest-population states not already covered, to reduce how
 * much of the 51-page state section reads as templated/thin content.
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
  TX: {
    minimumWage: {
      summary: "$7.25/hour -- Texas has never set its own minimum wage above the federal floor, and this rate has been unchanged since it took effect nationally on July 24, 2009.",
      sourceLabel: "Texas Workforce Commission, Texas Minimum Wage Law",
      sourceUrl: "https://www.twc.texas.gov/programs/wage-and-hour/texas-minimum-wage-law",
    },
    tippedWage: {
      summary: "Texas has no separate state tipped-wage rate, so the federal tip credit applies: employers may pay as little as $2.13/hour in direct cash wages, as long as tips bring total pay up to at least $7.25/hour for every hour worked. If they don't, the employer owes the difference.",
      sourceLabel: "U.S. Department of Labor, Minimum Wages for Tipped Employees",
      sourceUrl: "https://www.dol.gov/agencies/whd/state/minimum-wage/tipped",
    },
    exemptSalaryThreshold: {
      summary: "Texas hasn't set its own higher exempt-salary threshold -- the federal minimum of $684/week ($35,568/year) applies for the executive, administrative, and professional exemptions.",
      sourceLabel: "Texas Workforce Commission, Salary Test for Exempt Employees",
      sourceUrl: "https://efte.twc.texas.gov/salary_test_for_exempt_employees.html",
    },
    commonMistake: "Because Texas has no state minimum wage, no state overtime law, and no daily-overtime rule of its own, employers sometimes assume Texas has looser overtime requirements generally -- it doesn't. The federal FLSA's 40-hour weekly standard applies in full; Texas simply hasn't layered anything extra on top of it, in either direction.",
    faq: [
      {
        q: "Does Texas have its own overtime law?",
        a: "No. Texas has no state overtime statute for private employers -- the federal FLSA applies directly: 1.5x your regular rate after 40 hours in a workweek, with no daily-overtime rule.",
      },
      {
        q: "Why is the Texas minimum wage still $7.25?",
        a: "Texas ties its minimum wage to the federal rate rather than setting its own, and Congress hasn't raised the federal minimum wage since 2009. Some Texas cities and employers pay more voluntarily, but there's no state-law floor above $7.25/hour.",
      },
      {
        q: "Can a Texas employer pay tipped workers less than $7.25/hour?",
        a: "Yes, down to $2.13/hour in direct cash wages under the federal tip credit, as long as tips bring total pay to at least $7.25/hour for every hour worked. If a slow shift's tips don't cover the gap, the employer must make up the difference.",
      },
    ],
  },
  FL: {
    minimumWage: {
      summary: "$14.00/hour through September 29, 2026, then $15.00/hour starting September 30, 2026 -- the final step of a constitutional amendment Florida voters approved in November 2020, phasing the state to $15.00/hour on that exact date.",
      sourceLabel: "Florida Department of Commerce, Florida Minimum Wage",
      sourceUrl: "https://floridajobs.org/florida-minimum-wage",
    },
    tippedWage: {
      summary: "$10.98/hour cash wage through September 29, 2026, rising to $11.98/hour on September 30, 2026 alongside the standard minimum wage -- tips must bring total pay up to the full minimum wage for every hour, with the employer covering any shortfall.",
      sourceLabel: "Florida Department of Commerce, Florida Minimum Wage",
      sourceUrl: "https://floridajobs.org/florida-minimum-wage",
    },
    exemptSalaryThreshold: {
      summary: "Florida hasn't set its own exempt-salary threshold -- the federal minimum of $684/week ($35,568/year) applies for the executive, administrative, and professional exemptions.",
      sourceLabel: "Florida Department of Commerce",
      sourceUrl: "https://floridajobs.org/florida-minimum-wage",
    },
    commonMistake: "Florida's minimum wage changes every September 30, not January 1 like most states -- payroll systems built around a January update cycle can miss it. The jump to $15.00/hour on September 30, 2026 is the last scheduled increase from the 2020 amendment; after that, increases switch to annual inflation adjustments announced each October 15 for the following January.",
    faq: [
      {
        q: "When does Florida's minimum wage go up?",
        a: "September 30, not January 1. It rises to $15.00/hour on September 30, 2026, completing the phase-in voters approved in 2020. After that, Florida switches to annual inflation-based adjustments announced by October 15 each year.",
      },
      {
        q: "Does Florida have daily overtime or a 7th-consecutive-day rule?",
        a: "No. Florida follows the federal FLSA standard: overtime after 40 hours in a single workweek, with no separate daily-overtime or extra-day premium.",
      },
      {
        q: "How much can a Florida employer pay tipped workers?",
        a: "As little as $10.98/hour in cash wages through September 29, 2026 (rising to $11.98/hour on September 30), as long as tips bring the total to at least the full minimum wage for every hour. Shortfalls must be made up by the employer.",
      },
    ],
  },
  WA: {
    minimumWage: {
      summary: "$17.13/hour statewide, effective January 1, 2026 -- a 2.8% increase tied to the CPI. Several cities set higher local minimums, including Seattle ($21.30/hour) and Burien/Renton/Everett/King County's unincorporated areas (roughly $20.77-$21.63/hour for large employers).",
      sourceLabel: "Washington State Dept. of Labor & Industries, Minimum Wage",
      sourceUrl: "https://www.lni.wa.gov/workers-rights/wages/minimum-wage/",
    },
    tippedWage: {
      summary: "Washington does not allow a tip credit at all -- employers may not count tips or service charges toward the minimum wage. Tipped employees get the full state or local minimum wage in direct wages, plus tips on top, no reduced cash rate.",
      sourceLabel: "Washington State Dept. of Labor & Industries, Minimum Wage",
      sourceUrl: "https://www.lni.wa.gov/workers-rights/wages/minimum-wage/",
    },
    exemptSalaryThreshold: {
      summary: "$1,541.70/week ($80,168.40/year) for the executive, administrative, and professional exemptions, effective January 1, 2026 -- set at 2.25x the state minimum wage, and scheduled to keep rising each year until it reaches 2.5x minimum wage in 2028. Computer professionals have their own separate threshold, 3.5x minimum wage ($59.96/hour).",
      sourceLabel: "Washington State Dept. of Labor & Industries, Salary Threshold Implementation Schedule",
      sourceUrl: "https://www.lni.wa.gov/forms-publications/f700-207-000.pdf",
    },
    commonMistake: "The most common Washington mistake is assuming tipped employees can be paid less than minimum wage, the way federal law and most other states allow -- Washington explicitly bans tip credits, so every hour must be paid at the full state or local minimum wage in direct wages, with tips entirely on top.",
    faq: [
      {
        q: "Can a Washington employer pay tipped workers less than minimum wage?",
        a: "No. Washington is one of a small number of states that bans tip credits entirely -- tipped employees must receive the full applicable minimum wage (state or local, whichever is higher) in direct wages, with tips as a genuine bonus on top, not counted toward the wage floor.",
      },
      {
        q: "Does Seattle's higher minimum wage change my overtime rate?",
        a: "Yes -- your overtime rate is 1.5x your actual regular rate, so if you're paid Seattle's $21.30/hour minimum, your overtime rate is at least $31.95/hour, not the $25.70/hour you'd get off the $17.13 statewide rate.",
      },
      {
        q: "Why does Washington's exempt-salary threshold keep changing every year?",
        a: "It's set as a multiple of the state minimum wage (2.25x in 2026, rising to 2.5x by 2028), rather than a fixed dollar figure -- so it moves automatically every time the minimum wage does, without a separate rulemaking.",
      },
    ],
  },
  IL: {
    minimumWage: {
      summary: "$15.00/hour statewide for workers 18 and older, unchanged since January 1, 2025 (the final step of a phased increase that started in 2020). Cook County sets its own higher rate, rising to $15.40/hour on July 1, 2026; Chicago's is higher still.",
      sourceLabel: "Illinois Department of Labor, Minimum Wage Law",
      sourceUrl: "https://labor.illinois.gov/laws-rules/fls/minimum-wage-law.html",
    },
    tippedWage: {
      summary: "Employers may take a tip credit of up to 40% of the minimum wage, paying as little as $9.00/hour (60% of $15.00) in direct cash wages -- as long as tips bring total pay up to the full $15.00/hour for every hour worked.",
      sourceLabel: "Illinois Department of Labor, Minimum Wage Law",
      sourceUrl: "https://labor.illinois.gov/laws-rules/fls/minimum-wage-law.html",
    },
    exemptSalaryThreshold: {
      summary: "Illinois hasn't set its own higher exempt-salary threshold -- the federal minimum of $684/week ($35,568/year) applies for the executive, administrative, and professional exemptions.",
      sourceLabel: "Illinois Department of Labor, Minimum Wage Law",
      sourceUrl: "https://labor.illinois.gov/laws-rules/fls/minimum-wage-law.html",
    },
    commonMistake: "Workers and employers in the Chicago area often apply the statewide $15.00/hour rate when a higher local rate actually applies -- Cook County (rising to $15.40/hour on July 1, 2026) and Chicago itself both set their own minimum wages above the state floor, and the higher local rate controls for work performed there.",
    faq: [
      {
        q: "Is Chicago's minimum wage different from the rest of Illinois?",
        a: "Yes. Chicago and Cook County both set minimum wages above the $15.00/hour state rate -- Cook County rises to $15.40/hour on July 1, 2026. Which rate applies depends on where the work is actually performed.",
      },
      {
        q: "Does Illinois have daily overtime?",
        a: "No. Illinois follows the federal FLSA standard: overtime after 40 hours in a single workweek, at 1.5x your regular rate, with no separate daily-overtime rule.",
      },
      {
        q: "How much of a tip credit can an Illinois employer take?",
        a: "Up to 40% of the minimum wage, meaning a cash wage as low as $9.00/hour at the current $15.00/hour minimum -- as long as tips make up the rest. If tips fall short in a given pay period, the employer must cover the gap.",
      },
    ],
  },
};

export function getFlagshipContent(state: StateCode): FlagshipStateContent | undefined {
  return FLAGSHIP_STATES[state];
}
