import { countTicketsOnThisBay } from "@/app/api/contact/ticket-count";
import { ContactDesk } from "@/app/contact/contact-desk";
import { TicketsOnThisBayStamp } from "@/app/contact/tickets-stamp";
import { PageHeader } from "@/components/page-header";
import { contactMailerStatus } from "@/lib/contact/mail";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Send the ticket",
  description: "Name, a phone or email, and the RO. We read it. We do not sell it or book a shop.",
  path: "/contact",
});

export default async function Page() {
  const ticketsOnThisBay = await countTicketsOnThisBay();
  return (
    <div className="space-y-6">
      <PageHeader kicker="No account" title="Send the ticket">
        Paste the RO. We read it. We do not sell it, book a bay, or take a cut.
      </PageHeader>
      <TicketsOnThisBayStamp count={ticketsOnThisBay} />
      <ContactDesk mailer={contactMailerStatus()} />
    </div>
  );
}
