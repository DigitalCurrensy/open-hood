import { parseCoolantC, parseMode03Dtcs, parseRpm, parseSpeedKph } from "@/lib/obd/parser";
import { emptySnapshot, type LiveSnapshot } from "@/lib/obd/types";

/** Parked idle — parser-backed so the demo button exercises the same math as a dongle. */
export const DEMO_ELM_RAW = {
  "010C": "41 0C 0C B0",
  "010D": "41 0D 00",
  "0105": "41 05 83",
  "03": "43 02 01 71 04 20",
} as const;

export function demoSnapshot(): LiveSnapshot {
  return {
    ...emptySnapshot("demo"),
    source: "demo",
    rpm: parseRpm(DEMO_ELM_RAW["010C"]),
    speedKph: parseSpeedKph(DEMO_ELM_RAW["010D"]),
    coolantC: parseCoolantC(DEMO_ELM_RAW["0105"]),
    dtcs: parseMode03Dtcs(DEMO_ELM_RAW["03"]),
    deviceName: "Demo PIDs · no adapter",
    raw: { ...DEMO_ELM_RAW },
    fault: null,
  };
}
