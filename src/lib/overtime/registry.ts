import type { StateCode, StateOvertimeRules } from "./types";
import { ctOvertimeRules } from "./states/ct";
import { caOvertimeRules } from "./states/ca";
import { nvOvertimeRules } from "./states/nv";
import { coOvertimeRules } from "./states/co";
import { akOvertimeRules } from "./states/ak";
import { kyOvertimeRules } from "./states/ky";
import { federalBaselineRules } from "./states/federal-baseline";

/** All 50 states + DC. */
const STATE_NAMES: Record<StateCode, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

/**
 * States with rules that go beyond the plain federal weekly standard
 * enough to warrant their own dedicated file (daily-overtime, wage
 * conditions, 7th-day premiums, etc.) -- see each file's citation and
 * verification notes.
 */
const CUSTOM_RULES: Partial<Record<StateCode, StateOvertimeRules>> = {
  CT: ctOvertimeRules,
  CA: caOvertimeRules,
  NV: nvOvertimeRules,
  CO: coOvertimeRules,
  AK: akOvertimeRules,
  KY: kyOvertimeRules,
};

/**
 * States on the plain federal weekly standard, but with a narrow
 * industry-specific or otherwise-superseded state rule worth flagging
 * even though it isn't modeled in the calculation itself. Verified
 * 2026-08 (see the "different from CT" research in this project's
 * history). Everything not listed here gets no extra notes.
 */
const EXTRA_NOTES: Partial<Record<StateCode, string[]>> = {
  HI: [
    "Hawaii's public-works contracts have separate daily-overtime and Saturday/Sunday/holiday premium rules for covered public-works employees -- not modeled here; this estimate is for general private-sector employment.",
  ],
  MD: [
    "Maryland agricultural workers have a separate 60-hour weekly threshold -- not modeled here; this estimate is for general (non-agricultural) employment.",
  ],
  NY: [
    "Certain live-in/residential employees in New York have a different weekly threshold (44+ hours) -- not modeled here; this estimate is for general employment.",
  ],
  OR: [
    "Oregon mill, factory, and manufacturing establishments have a separate daily-overtime rule (over 10 hrs/day) -- not modeled here; this estimate is for general employment outside those industries.",
  ],
  ND: [
    "North Dakota oilfield and construction workers have a separate daily-overtime rule (over 8 hrs/day) -- not modeled here; this estimate is for general employment outside those industries.",
  ],
  KS: [
    "Kansas's own wage-hour law sets a 46-hour weekly threshold, but the stricter federal 40-hour rule (more protective, and controlling for virtually all FLSA-covered employers) applies instead -- this estimate uses 40 hours.",
  ],
  MN: [
    "Minnesota's own wage-hour law sets a 48-hour weekly threshold, but the stricter federal 40-hour rule (more protective, and controlling for virtually all FLSA-covered employers) applies instead -- this estimate uses 40 hours.",
  ],
};

const IMPLEMENTED_RULES: Partial<Record<StateCode, StateOvertimeRules>> = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([code, name]) => [
    code,
    CUSTOM_RULES[code] ?? federalBaselineRules(code, name, EXTRA_NOTES[code] ?? []),
  ]),
);

export interface StateOption {
  code: StateCode;
  name: string;
  available: boolean;
}

/** Full US state list for the picker UI, sorted by name, flagged by availability. */
export function listStates(): StateOption[] {
  return Object.entries(STATE_NAMES)
    .map(([code, name]) => ({ code, name, available: code in IMPLEMENTED_RULES }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getStateRules(state: StateCode): StateOvertimeRules | undefined {
  return IMPLEMENTED_RULES[state];
}
