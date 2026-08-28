import { countTicketsOnThisBay } from "@/app/api/contact/ticket-count";
import { DeskBrief } from "@/app/trust/_components/desk-brief";
import { HonestyLedger } from "@/app/trust/_components/honesty-ledger";
import { TrustDesk } from "@/app/trust/_components/trust-desk";
import { PageHeader } from "@/components/page-header";
import { TRUST_BRIEF } from "@/config/nav/trust";
import { readConsentedPublicQuotes } from "@/lib/contact/quotes";
import { holdStatus } from "@/lib/trust";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trust / bonded estimate",
  description:
    "0 users. 0 reviews. We do not mint testimonials. Not legal advice, not a licensed inspector, not a shop. Written-estimate checklist, work photos, and a DEMO hold unless Stripe test is on. Quote lines are a typical independent band — not Motor. Recalls are nameplate, not VIN closeout.",
};

export default async function Page() {
  const hold = holdStatus();
  const ticketsOnThisBay = await countTicketsOnThisBay();
  const consentedQuotes = await readConsentedPublicQuotes();
  return (
    <div className="space-y-6">
      <DeskBrief brief={TRUST_BRIEF} beginnerHint="Beginner · paper + photos" expertHint="Expert · bond # · test intent" />
      <PageHeader kicker="Trust · honesty first" title="Bonded estimate desk">
        Zero users. Zero reviews. We do not mint testimonials. A name on this wall is only a jsonl row with
        consent to be named. Not legal advice, not a licensed inspector, not a shop. A hold here is DEMO unless this
        bay says Stripe test — and even then it is not captured.
      </PageHeader>
      <HonestyLedger ticketsOnThisBay={ticketsOnThisBay} quotes={consentedQuotes} />
      <TrustDesk initialHold={hold} />
    </div>
  );
}
