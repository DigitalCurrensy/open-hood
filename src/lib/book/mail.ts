import type { BookMailerStatus, BookRequest, BookSummary } from "@/lib/book/types";

const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Open Hood <beth.t@example.com>";

export function bookMailerStatus(): BookMailerStatus {
  const key = Boolean(process.env.RESEND_API_KEY?.trim());
  const to = Boolean(process.env.CONTACT_TO_EMAIL?.trim());
  return {
    delivery: key && to ? "email" : "local",
    mailer: key ? "resend" : "none",
    toConfigured: to,
    dispatched: false,
  };
}

export function canSendBookEmail(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.CONTACT_TO_EMAIL?.trim());
}

export async function sendBookEmail(
  row: BookRequest,
  summary: BookSummary,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  if (!key || !to) {
    return { ok: false, reason: "Mailer is not fully configured." };
  }

  const from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject: summary.title.slice(0, 180),
    text: `${summary.text}\n\nOpen Hood does not employ technicians. This is intake. We did not dispatch a mechanic.\n`,
  };
  if (row.email) payload.reply_to = row.email;

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { ok: false, reason: "The mailer rejected the request." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "The mailer did not answer." };
  }
}
