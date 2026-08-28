import { DTC_DICTIONARY } from "@/lib/jobs/dtc-dictionary";
import type { DtcFamily, GenericJobDtc, JobDtcLookup } from "@/lib/jobs/types";

const SYSTEM_NAME: Record<DtcFamily, string> = {
  P: "powertrain (engine / transmission / hybrid)",
  C: "chassis (ABS / brakes / suspension)",
  B: "body (airbags, seats, comfort)",
  U: "network (modules talking to each other)",
};

const P_SUBSYSTEM: Record<string, string> = {
  "0": "fuel and air metering",
  "1": "fuel and air metering",
  "2": "fuel and air (injector / boost)",
  "3": "ignition or misfire",
  "4": "auxiliary emissions (EVAP, EGR, catalyst)",
  "5": "speed, idle, or auxiliary inputs",
  "6": "computer or output circuit",
  "7": "transmission",
  "8": "transmission",
  "9": "input / output, transmission or hybrid",
  A: "hybrid / electric drive",
};

const FAMILY_NO_PARTS: Record<DtcFamily, string> = {
  P: "Do not throw plugs, sensors, or a catalytic converter from the letter P. Name the test that picked the part.",
  C: "Do not throw an ABS module from a C-code. Isolate the corner or the pump circuit first.",
  B: "Do not probe airbag circuits or clear an SRS light to 'see if it comes back.' The light is the safety part.",
  U: "Do not order three modules because they went quiet. Quiet is often voltage or a shorted bus.",
};

export function normalizeJobDtc(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function isPlausibleJobDtc(code: string): boolean {
  return /^[PCBU][0-3][0-9A-F]{3}$/.test(code);
}

export function decodeJobGeneric(code: string): GenericJobDtc | null {
  if (!isPlausibleJobDtc(code)) return null;
  const family = code[0] as DtcFamily;
  const generic = code[1] === "0" || code[1] === "2";
  const subsystem =
    family === "P"
      ? (P_SUBSYSTEM[code[2]] ?? "unspecified powertrain circuit")
      : family === "C"
        ? "ABS, brake, or suspension circuit"
        : family === "B"
          ? "body / SRS / comfort circuit"
          : "module communication";

  return {
    family,
    system: SYSTEM_NAME[family],
    generic,
    subsystem,
    hint: generic
      ? "SAE-generic layout. The number is real even if our paragraph is missing."
      : "Manufacturer-specific code. Ask the shop to print the factory title.",
    doNotThrowParts: FAMILY_NO_PARTS[family],
  };
}

export function lookupJobDtc(raw: string): JobDtcLookup {
  const code = normalizeJobDtc(raw);
  if (!code) {
    return {
      code,
      valid: false,
      entry: null,
      generic: null,
      error: "Type a code like P0420, C0035, B0028, or U0100.",
    };
  }
  if (!isPlausibleJobDtc(code)) {
    return {
      code,
      valid: false,
      entry: null,
      generic: null,
      error: "Use the 5-character scanner form: letter P/B/C/U plus four characters (example P0300).",
    };
  }

  return {
    code,
    valid: true,
    entry: DTC_DICTIONARY[code] ?? null,
    generic: decodeJobGeneric(code),
  };
}

export { dtcSayThis } from "@/lib/dtc-catalog";
export { DTC_COUNT, DTC_DICTIONARY, SAMPLE_JOB_DTCS } from "@/lib/jobs/dtc-dictionary";
