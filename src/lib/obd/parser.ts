import type { ElmParseFault, LivePids } from "@/lib/obd/types";

const DTC_LETTER = ["P", "C", "B", "U"] as const;

export function stripElmPrompt(raw: string): string {
  return raw.replace(/>/g, "").replace(/\r/g, "\n");
}

export function normalizeElmHex(raw: string): string {
  return stripElmPrompt(raw).toUpperCase().replace(/[^0-9A-F]/g, "");
}

export function bytesFromElm(raw: string): number[] {
  const hex = normalizeElmHex(raw);
  const bytes: number[] = [];
  for (let i = 0; i + 1 < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return bytes;
}

export function detectElmFault(raw: string): ElmParseFault | null {
  const text = stripElmPrompt(raw).toUpperCase();
  if (/\bNO DATA\b/.test(text)) {
    return { code: "NO_DATA", message: "ECU said NO DATA. Key on — engine running for live PIDs." };
  }
  if (/UNABLE TO CONNECT/.test(text)) {
    return { code: "UNABLE_TO_CONNECT", message: "UNABLE TO CONNECT. Key on. Adapter seated in the DLC." };
  }
  if (/CAN ERROR/.test(text)) {
    return { code: "CAN_ERROR", message: "CAN ERROR. This bay is generic Mode 01 / 03 — not a factory tool." };
  }
  if (/BUS INIT:\s*ERROR/.test(text) || /BUS ERROR/.test(text)) {
    return { code: "BUS_ERROR", message: "Bus init failed. Cycle the key. Do not pair while moving." };
  }
  if (/\bSTOPPED\b/.test(text)) {
    return { code: "STOPPED", message: "Adapter stopped. Unplug, park, pair again." };
  }
  if (/\?/.test(raw) && !/[0-9A-Fa-f]{6,}/.test(raw)) {
    return { code: "UNKNOWN", message: "Dongle did not understand that AT or PID request." };
  }
  return null;
}

/** Mode 01 reply is `41 <pid> <data…>` with or without spaces / CAN headers. */
export function extractMode01Data(raw: string, pid: string): number[] | null {
  const fault = detectElmFault(raw);
  if (fault && fault.code !== "NO_DATA") return null;
  const bytes = bytesFromElm(raw);
  const pidByte = parseInt(pid, 16);
  for (let i = 0; i + 1 < bytes.length; i++) {
    if (bytes[i] === 0x41 && bytes[i + 1] === pidByte) {
      return bytes.slice(i + 2);
    }
  }
  return null;
}

export function parseRpm(raw: string): number | null {
  const data = extractMode01Data(raw, "0C");
  if (!data || data.length < 2) return null;
  return (data[0] * 256 + data[1]) / 4;
}

export function parseSpeedKph(raw: string): number | null {
  const data = extractMode01Data(raw, "0D");
  if (!data || data.length < 1) return null;
  return data[0];
}

export function parseCoolantC(raw: string): number | null {
  const data = extractMode01Data(raw, "05");
  if (!data || data.length < 1) return null;
  return data[0] - 40;
}

export function decodeDtcWord(high: number, low: number): string | null {
  if (high === 0 && low === 0) return null;
  const letter = DTC_LETTER[(high >> 6) & 0x03];
  const first = (high >> 4) & 0x03;
  const second = (high & 0x0f).toString(16).toUpperCase();
  const rest = low.toString(16).toUpperCase().padStart(2, "0");
  return `${letter}${first}${second}${rest}`;
}

function dtcsFromPayload(payload: number[]): string[] {
  if (payload.length === 0 || payload.every((byte) => byte === 0)) return [];
  const count = payload[0];
  const after = payload.slice(1);
  const body =
    count >= 1 && count <= 16 && after.length === count * 2 ? after : payload;
  const codes: string[] = [];
  for (let i = 0; i + 1 < body.length; i += 2) {
    const code = decodeDtcWord(body[i], body[i + 1]);
    if (code) codes.push(code);
  }
  return codes;
}

/** Mode 03 stored DTCs. Handles `43 01 33 00 00` and CAN `43 02 01 33 04 20`. */
export function parseMode03Dtcs(raw: string): string[] {
  if (detectElmFault(raw)?.code === "NO_DATA") return [];
  const bytes = bytesFromElm(raw);
  const found = new Set<string>();
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] !== 0x43) continue;
    const rest = bytes.slice(i + 1);
    const next = rest.findIndex((byte) => byte === 0x43);
    const chunk = next === -1 ? rest : rest.slice(0, next);
    for (const code of dtcsFromPayload(chunk)) found.add(code);
    i += chunk.length;
  }
  return [...found];
}

export function parseLivePids(raw: { rpm?: string; speed?: string; coolant?: string }): LivePids {
  return {
    rpm: raw.rpm ? parseRpm(raw.rpm) : null,
    speedKph: raw.speed ? parseSpeedKph(raw.speed) : null,
    coolantC: raw.coolant ? parseCoolantC(raw.coolant) : null,
  };
}
