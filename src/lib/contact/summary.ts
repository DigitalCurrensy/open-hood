import { CONTACT_NEXT_DESKS } from "@/config/nav/contact";
import { CONTACT_NEEDS, CONTACT_ROLES, CONTACT_WINDOWS, type ContactSubmission, type ContactSummary } from "@/lib/contact/types";

export function buildContactSummary(row: ContactSubmission): ContactSummary {
  const vehicle = [row.year, row.make, row.model].filter(Boolean).join(" ");
  const need = CONTACT_NEEDS.find((item) => item.id === row.need)?.label ?? row.need;
  const role = CONTACT_ROLES.find((item) => item.id === row.role)?.label ?? row.role;
  const window = CONTACT_WINDOWS.find((item) => item.id === row.window);
  const lines = [
    `Ticket ${row.id}`,
    `When  ${formatStamp(row.receivedAt)}`,
    `Name  ${row.name} · ${role}`,
    row.phone ? `Phone ${row.phone}` : "",
    row.email ? `Email ${row.email}` : "",
    row.vin ? `VIN   ${row.vin}` : "",
    vehicle ? `Car   ${vehicle}` : "",
    row.mileage ? `Miles ${Number(row.mileage).toLocaleString("en-US")}` : "",
    `Need  ${need}`,
    `Call  ${window ? `${window.label} (${window.hint})` : row.window}`,
    row.photo ? `Photo JPEG · ${(row.photo.bytes / 1024).toFixed(0)} KB` : "",
    "Consent  We do not sell this RO.",
    row.consentToName
      ? "Name    May print first name + note on /trust. Not a lawyer."
      : "Name    Do not print. Consent to be named was off.",
    "",
    row.message || (row.photo ? "(no paste — photo only)" : "(no paste)"),
  ].filter((line, index, all) => line !== "" || all[index + 1] === "");

  const title = vehicle ? `RO · ${need} · ${vehicle}` : `RO · ${need} · ${row.name}`;
  return { title, lines, text: lines.join("\n") };
}

export function contactNextDesks() {
  return CONTACT_NEXT_DESKS;
}

function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
