import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { CONTACT_STORE_RELATIVE, type ContactSubmission } from "@/lib/contact/types";

export type StoredContact = ContactSubmission & {
  delivery: "local";
  userAgent?: string;
};

/** Public-safe line when the mailer ran and they ticked name-consent. No phone, email, VIN, or photo. */
export type StoredPublicQuote = {
  id: string;
  receivedAt: string;
  name: string;
  role: ContactSubmission["role"];
  message: string;
  consentToName: true;
  publicOnly: true;
};

export function contactStorePath(): string {
  return path.join(process.cwd(), CONTACT_STORE_RELATIVE);
}

export async function persistContactLocal(
  submission: ContactSubmission,
  extra?: { userAgent?: string },
): Promise<string> {
  const file = contactStorePath();
  await mkdir(path.dirname(file), { recursive: true });
  const row: StoredContact = {
    ...submission,
    delivery: "local",
    userAgent: extra?.userAgent?.slice(0, 180),
  };
  await appendFile(file, `${JSON.stringify(row)}\n`, "utf8");
  return file;
}

export async function persistConsentedPublicQuote(submission: ContactSubmission): Promise<string | null> {
  if (submission.consentToName !== true) return null;
  const quote = submission.message.replace(/\s+/g, " ").trim();
  if (quote.length < 12) return null;
  const file = contactStorePath();
  await mkdir(path.dirname(file), { recursive: true });
  const row: StoredPublicQuote = {
    id: submission.id,
    receivedAt: submission.receivedAt,
    name: submission.name,
    role: submission.role,
    message: quote,
    consentToName: true,
    publicOnly: true,
  };
  await appendFile(file, `${JSON.stringify(row)}\n`, "utf8");
  return file;
}
