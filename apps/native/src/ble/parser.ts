/** Mode 03 parser — same rules as src/lib/obd/parser.ts. Kept here so Expo never imports Next. */

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

export function detectNoData(raw: string): boolean {
  return /\bNO DATA\b/i.test(stripElmPrompt(raw));
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
  const body = count >= 1 && count <= 16 && after.length === count * 2 ? after : payload;
  const codes: string[] = [];
  for (let i = 0; i + 1 < body.length; i += 2) {
    const code = decodeDtcWord(body[i], body[i + 1]);
    if (code) codes.push(code);
  }
  return codes;
}

export function parseMode03Dtcs(raw: string): string[] {
  if (detectNoData(raw)) return [];
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

export function detectElmFault(raw: string): string | null {
  const text = stripElmPrompt(raw).toUpperCase();
  if (/\bNO DATA\b/.test(text)) return "ECU said NO DATA. Key on.";
  if (/UNABLE TO CONNECT/.test(text)) return "UNABLE TO CONNECT. Key on. Adapter seated in the DLC.";
  if (/CAN ERROR/.test(text)) return "CAN ERROR. This bay is generic Mode 03 — not a factory tool.";
  if (/BUS INIT:\s*ERROR/.test(text) || /BUS ERROR/.test(text)) {
    return "Bus init failed. Cycle the key. Do not pair while moving.";
  }
  if (/\bSTOPPED\b/.test(text)) return "Adapter stopped. Unplug, park, pair again.";
  return null;
}
