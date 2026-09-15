import type { Metadata } from "next";
import { TicketPath } from "@/app/_components/ticket-path";
import { HowItWorksDesk } from "@/app/how-it-works/how-it-works-desk";
import { HowItWorksFaq } from "@/app/how-it-works/how-it-works-faq";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { faqPageJsonLd, HOW_IT_WORKS_FAQ, pageMeta, speakableWebPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "How it works",
  description: "Identify the car, mark the ticket, say three sentences. We do not book shops or invent Carfax.",
  path: "/how-it-works",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <JsonLd data={faqPageJsonLd(HOW_IT_WORKS_FAQ, "/how-it-works")} />
      <JsonLd data={speakableWebPageJsonLd("/how-it-works", ["[data-speakable]", "h1"])} />
      <PageHeader kicker="Waiting-room walk" title="How it works">
        Identify → Ask or paste the ticket → copy three lines. RepairPal routes a shop. We send a script.
      </PageHeader>
      <TicketPath />
      <HowItWorksDesk />
      <HowItWorksFaq />
    </div>
  );
}
