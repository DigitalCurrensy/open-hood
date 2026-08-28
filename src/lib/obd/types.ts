export type ElmSource = "idle" | "demo" | "live";

export type ObdMode = "01" | "03";

export interface SupportedPid {
  mode: ObdMode;
  /** SAE PID byte. Null for Mode 03 (stored DTCs are not a PID). */
  pid: string | null;
  name: string;
  short: string;
  unit: string;
  formula: string;
  request: string;
}

export interface LivePids {
  rpm: number | null;
  speedKph: number | null;
  coolantC: number | null;
}

export interface LiveSnapshot extends LivePids {
  source: ElmSource;
  dtcs: string[];
  deviceName: string | null;
  raw: Partial<Record<"010C" | "010D" | "0105" | "03", string>>;
  fault: string | null;
}

export interface ElmParseFault {
  code: "NO_DATA" | "UNABLE_TO_CONNECT" | "CAN_ERROR" | "BUS_ERROR" | "STOPPED" | "UNKNOWN";
  message: string;
}

export const EMPTY_PIDS: LivePids = {
  rpm: null,
  speedKph: null,
  coolantC: null,
};

export function emptySnapshot(source: ElmSource = "idle"): LiveSnapshot {
  return {
    source,
    ...EMPTY_PIDS,
    dtcs: [],
    deviceName: null,
    raw: {},
    fault: null,
  };
}
