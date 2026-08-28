import type { Metadata } from "next";
import { TicketPath } from "@/app/_components/ticket-path";
import { HowItWorksDesk } from "@/app/how-it-works/how-it-works-desk";
import { HowItWorksFaq } from "@/app/how-it-works/how-it-works-faq";
import { JsonLd } from "@/components/json-ld";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { faqPageJsonLd, HOW_IT_WORKS_FAQ, pageMeta, speakableWebPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "How it works",
  description:
    "Identify → spec → quote flags → compare three ROs → counter script → OSM shops (no book) → print packet. Open Hood sends a script — not RepairPal, YourMechanic, or AutoZone. Do not approve until the hold line. Honda demo VIN, ZIP 90210 estimate, P0420 diagnose-first.",
  path: "/how-it-works",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <JsonLd data={faqPageJsonLd(HOW_IT_WORKS_FAQ, "/how-it-works")} />
      <JsonLd data={speakableWebPageJsonLd("/how-it-works", ["[data-speakable]", "h1"])} />
      <PageBrief href="/how-it-works" />
      <PageHeader kicker="Ticket path · seven stations" title="How it works">
        Identify → spec → quote flags → compare three ROs → counter script → OSM shops → print packet. RepairPal
        routes a shop. YourMechanic sends a person. AutoZone sells the SKU. We send a script. The advocate OS is
        the MVP. A cart would erase it.
      </PageHeader>
      <TicketPath />
      <HowItWorksDesk />
      <HowItWorksFaq />
    </div>
  );
}
