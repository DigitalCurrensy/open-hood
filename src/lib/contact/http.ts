import { canSendContactEmail, contactMailerStatus, sendContactEmail } from "@/lib/contact/mail";
import { contactClientKey, takeContactSlot } from "@/lib/contact/rate-limit";
import { persistConsentedPublicQuote, persistContactLocal } from "@/lib/contact/store";
import { buildContactSummary, contactNextDesks } from "@/lib/contact/summary";
import {
  ContactError,
  type ContactErrorBody,
  type ContactSubmitResult,
} from "@/lib/contact/types";
import { parseContactBody, validateContact } from "@/lib/contact/validate";

export function handleContactStatus(): Response {
  return jsonResponse({ ok: true, ...contactMailerStatus() });
}

export async function handleContactSubmit(request: Request): Promise<Response> {
  const slot = takeContactSlot(contactClientKey(request));
  if (!slot.ok) {
    return jsonResponse(
      { ok: false, error: "Too many tickets from this line. Wait a few minutes, then send the RO again." },
      429,
      { "Retry-After": String(slot.retryAfterSec) },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Send JSON: name, a phone or email, and the RO." }, 400);
  }

  try {
    const draft = parseContactBody(raw);
    const row = validateContact(draft);
    const summary = buildContactSummary(row);
    const nextDesks = contactNextDesks();

    if (canSendContactEmail()) {
      const mailed = await sendContactEmail(row, summary, draft);
      if (mailed.ok) {
        if (row.consentToName) {
          await persistConsentedPublicQuote(row);
        }
        const result: ContactSubmitResult = {
          ok: true,
          id: row.id,
          receivedAt: row.receivedAt,
          delivery: "email",
          notice: "The RO is on the desk. We will use the window you picked. We do not sell this ticket.",
          summary,
          nextDesks,
        };
        return jsonResponse(result);
      }
    }

    await persistContactLocal(row, { userAgent: request.headers.get("user-agent") ?? undefined });
    const result: ContactSubmitResult = {
      ok: true,
      id: row.id,
      receivedAt: row.receivedAt,
      delivery: "local",
      notice: localNotice(),
      summary,
      nextDesks,
    };
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof ContactError) {
      const body: ContactErrorBody = { ok: false, error: error.message, fields: error.fields };
      return jsonResponse(body, error.status);
    }
    return jsonResponse({ ok: false, error: "Could not stamp that ticket." }, 500);
  }
}

function localNotice(): string {
  const status = contactMailerStatus();
  if (status.mailer === "resend" && !status.toConfigured) {
    return "Ticket saved locally. The mailer has a key but no destination — we did not email a team. Print this copy.";
  }
  if (status.toConfigured && status.mailer === "none") {
    return "Ticket saved locally. A destination is set but the mailer is off — we did not email a team. Print this copy.";
  }
  return "Ticket saved locally. No mailer on this bay — we did not email a team. Print this copy.";
}

function jsonResponse(body: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
}
