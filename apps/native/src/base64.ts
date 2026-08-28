const TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function bytesToBase64(bytes: Uint8Array): string {
  let out = "";
  let index = 0;
  for (; index + 2 < bytes.length; index += 3) {
    const n = (bytes[index] << 16) | (bytes[index + 1] << 8) | bytes[index + 2];
    out += TABLE[(n >> 18) & 63] + TABLE[(n >> 12) & 63] + TABLE[(n >> 6) & 63] + TABLE[n & 63];
  }
  const rem = bytes.length - index;
  if (rem === 1) {
    const n = bytes[index] << 16;
    out += `${TABLE[(n >> 18) & 63]}${TABLE[(n >> 12) & 63]}==`;
  } else if (rem === 2) {
    const n = (bytes[index] << 16) | (bytes[index + 1] << 8);
    out += `${TABLE[(n >> 18) & 63]}${TABLE[(n >> 12) & 63]}${TABLE[(n >> 6) & 63]}=`;
  }
  return out;
}

export function textToBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text));
}

function sextet(char: string | undefined): number {
  if (!char || char === "=") return 0;
  const index = TABLE.indexOf(char);
  return index < 0 ? 0 : index;
}

export function base64ToBytes(value: string): Uint8Array {
  const clean = value.replace(/[^A-Za-z0-9+/=]/g, "");
  if (!clean) return new Uint8Array(0);
  const pad = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  const groups = Math.ceil(clean.length / 4);
  const out = new Uint8Array(groups * 3 - pad);
  let offset = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n = (sextet(clean[i]) << 18) | (sextet(clean[i + 1]) << 12) | (sextet(clean[i + 2]) << 6) | sextet(clean[i + 3]);
    if (offset < out.length) out[offset++] = (n >> 16) & 255;
    if (offset < out.length) out[offset++] = (n >> 8) & 255;
    if (offset < out.length) out[offset++] = n & 255;
  }
  return out;
}

export function base64ToText(value: string): string {
  return new TextDecoder().decode(base64ToBytes(value));
}
