import type { StateCode, StateOvertimeRules } from "./types";
import { ctOvertimeRules } from "./states/ct";

/**
 * All 50 states + DC, so the state picker can show the full list from
 * day one with "coming soon" for anything not yet implemented, instead
 * of silently only offering CT. Add a state by importing its rules
 * module above and adding an entry here -- nothing else needs to
 * change (the calculator, UI, and types are already state-agnostic).
 */
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

/** States with a fully implemented rules module. */
const IMPLEMENTED_RULES: Partial<Record<StateCode, StateOvertimeRules>> = {
  CT: ctOvertimeRules,
};

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
