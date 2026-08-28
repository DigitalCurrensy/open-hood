import { BOOK_NEXT_DESKS } from "@/config/nav/book";
import { directorySearchHref } from "@/lib/directory/href";
import { dealerAppointmentLinks } from "@/lib/book/dealers";
import {
  BOOK_DISPATCH_LINE,
  BOOK_JOBS,
  BOOK_VENUES,
  BOOK_WINDOWS,
  type BookRequest,
  type BookSummary,
} from "@/lib/book/types";

export function buildBookSummary(row: BookRequest): BookSummary {
  const vehicle = [row.year, row.make, row.model].filter(Boolean).join(" ");
  const job = BOOK_JOBS.find((item) => item.id === row.job)?.label ?? row.job;
  const venue = BOOK_VENUES.find((item) => item.id === row.venue);
  const window = BOOK_WINDOWS.find((item) => item.id === row.window);
  const lines = [
    `Ticket ${row.id}`,
    `When  ${formatStamp(row.receivedAt)}`,
    `Name  ${row.name}`,
    row.phone ? `Phone ${row.phone}` : "",
    row.email ? `Email ${row.email}` : "",
    `ZIP   ${row.zip}`,
    `Job   ${job}`,
    `Where ${venue ? `${venue.label} (${venue.hint})` : row.venue}`,
    `Window ${window ? `${window.label} (${window.hint})` : row.window}`,
    row.vin ? `VIN   ${row.vin}` : "",
    vehicle ? `Car   ${vehicle}` : "",
    row.mileage ? `Miles ${Number(row.mileage).toLocaleString("en-US")}` : "",
    "Dispatch  No. We do not employ technicians.",
    `Board  ${BOOK_DISPATCH_LINE}`,
    "",
    row.notes || "(no extra notes)",
  ].filter((line, index, all) => line !== "" || all[index + 1] === "");

  const title = `Visit · ${job} · ${row.zip}${vehicle ? ` · ${vehicle}` : ""}`;
  return { title, lines, text: lines.join("\n") };
}

export function bookNextDesks() {
  return BOOK_NEXT_DESKS;
}

export function bookDirectoryHref(zip: string): string {
  return directorySearchHref(zip, "repair");
}

export function bookDealerLinks(make: string, zip: string) {
  return dealerAppointmentLinks(make, zip);
}

function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
