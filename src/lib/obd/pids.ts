import type { SupportedPid } from "@/lib/obd/types";

/** Generic Mode 01 / Mode 03 only. Not Snap-on. Not Autel. */
export const PIDS_SUPPORTED: readonly SupportedPid[] = [
  {
    mode: "01",
    pid: "0C",
    name: "Engine RPM",
    short: "RPM",
    unit: "rpm",
    formula: "(A × 256 + B) / 4",
    request: "010C",
  },
  {
    mode: "01",
    pid: "0D",
    name: "Vehicle speed",
    short: "VSS",
    unit: "km/h",
    formula: "A",
    request: "010D",
  },
  {
    mode: "01",
    pid: "05",
    name: "Coolant temperature",
    short: "ECT",
    unit: "°C",
    formula: "A − 40",
    request: "0105",
  },
  {
    mode: "03",
    pid: null,
    name: "Stored DTCs",
    short: "DTC",
    unit: "codes",
    formula: "SAE J2012 two-byte words after 43",
    request: "03",
  },
] as const;

export const LIVE_PID_REQUESTS = ["010C", "010D", "0105"] as const;

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function kphToMph(kph: number): number {
  return kph * 0.621371;
}
