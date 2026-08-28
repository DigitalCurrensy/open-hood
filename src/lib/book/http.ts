import { dealerAppointmentLinks } from "@/lib/book/dealers";
import { canSendBookEmail, bookMailerStatus, sendBookEmail } from "@/lib/book/mail";
import { bookClientKey, takeBookSlot } from "@/lib/book/rate-limit";
import { persistBookLocal } from "@/lib/book/store";
import { bookDirectoryHref, bookNextDesks, buildBookSummary } from "@/lib/book/summary";
import { BookError, type BookErrorBody, type BookSubmitResult } from "@/lib/book/types";
import { parseBookBody, validateBook } from "@/lib/book/validate";

export function handleBookStatus(): Response {
  return jsonResponse({ ok: true, ...bookMailerStatus() });
}

export async function handleBookSubmit(request: Request): Promise<Response> {
  const slot = takeBookSlot(bookClientKey(request));
  if (!slot.ok) {
    return jsonResponse(
      { ok: false, error: "Too many visit requests from this line. Wait a few minutes." },
      429,
      { "Retry-After": String(slot.retryAfterSec) },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Send JSON: job, ZIP, vehicle, window, and shop / mobile / dealer." }, 400);
  }

  try {
    const draft = parseBookBody(raw);
    const row = validateBook(draft);
    const summary = buildBookSummary(row);
    const nextDesks = bookNextDesks();
    const directoryHref = bookDirectoryHref(row.zip);
    const dealerLinks = dealerAppointmentLinks(row.make, row.zip);

    if (canSendBookEmail()) {
      const mailed = await sendBookEmail(row, summary);
      if (mailed.ok) {
        const result: BookSubmitResult = {
          ok: true,
          id: row.id,
          receivedAt: row.receivedAt,
          delivery: "email",
          dispatched: false,
          stored: "email",
          notice:
            "We sent your request to the desk. We did not send a mechanic. Open Hood does not employ technicians.",
          summary,
          nextDesks,
          directoryHref,
          dealerLinks,
        };
        return jsonResponse(result);
      }
    }

    await persistBookLocal(row, { userAgent: request.headers.get("user-agent") ?? undefined });
    const result: BookSubmitResult = {
      ok: true,
      id: row.id,
      receivedAt: row.receivedAt,
      delivery: "local",
      dispatched: false,
      stored: "jsonl",
      notice: localNotice(),
      summary,
      nextDesks,
      directoryHref,
      dealerLinks,
    };
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof BookError) {
      const body: BookErrorBody = { ok: false, error: error.message, fields: error.fields };
      return jsonResponse(body, error.status);
    }
    return jsonResponse({ ok: false, error: "Could not stamp that visit request." }, 500);
  }
}

function localNotice(): string {
  const status = bookMailerStatus();
  if (status.mailer === "resend" && !status.toConfigured) {
    return "Saved on this machine (.data/book-requests.jsonl). RESEND_API_KEY is set but CONTACT_TO_EMAIL is not — we did not email a team, and we did not dispatch a tech.";
  }
  if (status.toConfigured && status.mailer === "none") {
    return "Saved on this machine (.data/book-requests.jsonl). CONTACT_TO_EMAIL is set but there is no RESEND_API_KEY — we did not email a team, and we did not dispatch a tech.";
  }
  return "Saved on this machine (.data/book-requests.jsonl). No mailer key — we did not email a team. We send your request; we don't send a mechanic.";
}

function jsonResponse(body: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
}
