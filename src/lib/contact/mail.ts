import { photoBase64 } from "@/lib/contact/validate";
import type { ContactDraft, ContactMailerStatus, ContactSubmission, ContactSummary } from "@/lib/contact/types";

const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Open Hood <beth.t@example.com>";

export function contactMailerStatus(): ContactMailerStatus {
  const key = Boolean(process.env.RESEND_API_KEY?.trim());
  const to = Boolean(process.env.CONTACT_TO_EMAIL?.trim());
  return {
    delivery: key && to ? "email" : "local",
    mailer: key ? "resend" : "none",
    toConfigured: to,
  };
}

export function canSendContactEmail(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.CONTACT_TO_EMAIL?.trim());
}

export async function sendContactEmail(
  row: ContactSubmission,
  summary: ContactSummary,
  draft: ContactDraft,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  if (!key || !to) {
    return { ok: false, reason: "Mailer is not fully configured." };
  }

  const from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const attachments = attachment(draft);
  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject: summary.title.slice(0, 180),
    text: `${summary.text}\n`,
  };
  if (row.email) payload.reply_to = row.email;
  if (attachments) payload.attachments = attachments;

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
      return { ok: false, reason: "The mailer rejected the ticket." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "The mailer did not answer." };
  }
}

function attachment(draft: ContactDraft): Array<{ filename: string; content: string }> | undefined {
  const base64 = photoBase64(draft.photo);
  if (!base64) return undefined;
  return [{ filename: "estimate.jpg", content: base64 }];
}
