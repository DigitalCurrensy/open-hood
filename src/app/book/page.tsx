import { BookBrief } from "@/app/book/book-brief";
import { BookDesk } from "@/app/book/book-desk";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visit / shortlist",
  description:
    "Compare three pasted ROs, stamp a visit note, shortlist OSM rooftops. Open Hood does not book a bay, dispatch a mechanic, or take a cut.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <BookBrief />
      <PageHeader kicker="Visit / shortlist · not a booking aisle" title="Visit / shortlist">
        Paste three ROs. Flag the padding. Call an OSM rooftop. We store a visit note. We do not book a stall or
        send a van.
      </PageHeader>
      <BookDesk />
    </div>
  );
}
