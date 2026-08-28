import { readFile } from "node:fs/promises";
import { contactStorePath } from "@/lib/contact/store";
import type { ConsentedPublicQuote, ContactRole } from "@/lib/contact/types";

const QUOTE_MAX = 280;
const EMAIL_RE = /\b\S+@\S+\.\S+\b/g;
const PHONE_RE = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const VIN_RE = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;

/**
 * Public /trust wall. Only jsonl rows with consentToName === true.
 * Empty list if none. Never invents a name. Strips phone / email / VIN from the note.
 */
export async function readConsentedPublicQuotes(): Promise<ConsentedPublicQuote[]> {
  try {
    const raw = await readFile(contactStorePath(), "utf8");
    const out: ConsentedPublicQuote[] = [];
    for (const line of raw.split("\n")) {
      const quote = publicQuoteFromLine(line);
      if (quote) out.push(quote);
    }
    return out;
  } catch {
    return [];
  }
}

export function publicQuoteFromLine(line: string): ConsentedPublicQuote | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let row: Record<string, unknown>;
  try {
    row = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (row.consentToName !== true) return null;

  const name = typeof row.name === "string" ? row.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2 || name.length > 80) return null;

  const quote = sanitizePublicQuote(typeof row.message === "string" ? row.message : typeof row.quote === "string" ? row.quote : "");
  if (!quote) return null;

  const id = typeof row.id === "string" && row.id ? row.id : "";
  const receivedAt = typeof row.receivedAt === "string" && row.receivedAt ? row.receivedAt : "";
  if (!id || !receivedAt) return null;

  return {
    id,
    receivedAt,
    name,
    role: wallRole(row.role),
    quote,
  };
}

export function sanitizePublicQuote(message: string): string {
  const cleaned = message
    .replace(EMAIL_RE, "")
    .replace(PHONE_RE, "")
    .replace(VIN_RE, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 12) return "";
  return cleaned.length > QUOTE_MAX ? `${cleaned.slice(0, QUOTE_MAX).trimEnd()}…` : cleaned;
}

function wallRole(role: unknown): ConsentedPublicQuote["role"] {
  const id = typeof role === "string" ? (role as ContactRole) : "owner";
  return id === "shop" || id === "dealer" || id === "fleet" ? "shop" : "owner";
}
