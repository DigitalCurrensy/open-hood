import type { NavItem } from "@/lib/nav";
import { PIDS_SUPPORTED } from "@/lib/obd/pids";

export const SCAN_ROUTE = "/scan" as const;

/** Stamp for the bay board. Integrator merges this into NAV_ITEMS / MATRIX_NAV_ITEMS. */
export const SCAN_NAV_ITEM: NavItem = {
  href: SCAN_ROUTE,
  stamp: "Scan",
  label: "Live OBD",
  blurb: "Web Bluetooth ELM327 or a typed code. Not Snap-on or Autel coverage.",
  needsVehicle: false,
};

export const SCAN_INDEX = {
  href: SCAN_ROUTE,
  stamp: "Bus",
  label: "Live OBD",
  blurb: "Chrome on Android talks to a BLE ELM327. iOS types the code. Three generic PIDs plus stored DTCs.",
} as const;

export const SCAN_PIDS = PIDS_SUPPORTED;

/** PageBrief payload — integrator appends this to UX_BRIEFS. */
export const SCAN_BRIEF = {
  href: SCAN_ROUTE,
  eyebrow: "Live OBD",
  dummy: {
    job: "Park. Pair a BLE dongle in Chrome, load demo PIDs, or type the code from any $20 scanner.",
    for: "Anyone with a check-engine light and a cheap tool — or a phone that is not iOS Safari.",
    click: "Connect if this browser has Bluetooth. Demo PIDs if it does not. Type a code either way.",
    say: "I have the code. Print the freeze-frame before you quote a part.",
  },
  genius: {
    job: "ATZ / ATE0, Mode 01 PID 0C RPM, 0D speed, 05 coolant, Mode 03 stored DTCs. BLE UART only. Classic SPP is Car Scanner / Torque.",
    for: "Owners who will not confuse a $20 ELM with Snap-on or Autel.",
    click: "Connect is gated on navigator.bluetooth. Demo runs the same parser. Codes route to /obd and /jobs/obd.",
    say: "Print Mode 02: RPM, load, mph, ECT, STFT/LTFT. Live numbers on this desk are now, not when it set.",
  },
} as const;
