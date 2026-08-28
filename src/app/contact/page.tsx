import { countTicketsOnThisBay } from "@/app/api/contact/ticket-count";
import { ContactDesk } from "@/app/contact/contact-desk";
import { TicketsOnThisBayStamp } from "@/app/contact/tickets-stamp";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { CONTACT_ROUTE } from "@/config/nav/contact";
import { contactMailerStatus } from "@/lib/contact/mail";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Talk to Open Hood",
  description:
    "Send the RO. Name, a phone or email, and the ticket. We read it. We do not sell it, book a shop, or take a cut.",
  path: "/contact",
});

export default async function Page() {
  const ticketsOnThisBay = await countTicketsOnThisBay();
  return (
    <div className="space-y-6">
      <PageBrief href={CONTACT_ROUTE} />
      <PageHeader kicker="Window 09 · the RO" title="Talk to Open Hood">
        Send the RO. We read the ticket. We do not sell it, book a bay, or take a cut of the repair.
      </PageHeader>
      <TicketsOnThisBayStamp count={ticketsOnThisBay} />
      <ContactDesk mailer={contactMailerStatus()} />
    </div>
  );
}
