import type { Metadata } from "next";
import { CompareTicket } from "@/app/book/_components/compare-ticket";
import { PageHeader } from "@/components/page-header";
import { QuotePage } from "@/components/pages/quote-page";
import { pageMeta } from "@/lib/seo";
import "./quote.css";

export const metadata: Metadata = pageMeta({
  title: "This estimate",
  description: "Paste or photograph the repair order. We mark padded lines. No buy button.",
  path: "/quote",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Paste the ticket" title="This estimate">
        Line items in. Flags out. Typical independent hours — not Motor. No checkout.
      </PageHeader>
      <QuotePage />
      <CompareTicket />
    </div>
  );
}
