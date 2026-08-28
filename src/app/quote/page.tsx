import type { Metadata } from "next";
import { CompareTicket } from "@/app/book/_components/compare-ticket";
import { PageBrief } from "@/components/page-brief";
import { QuotePage } from "@/components/pages/quote-page";
import { pageMeta } from "@/lib/seo";
import "./quote.css";

export const metadata: Metadata = pageMeta({
  title: "Quote defense",
  description:
    "Paste or photograph a repair order — or compare three on one ticket. Open Hood marks book hits vs misses and packed menus against a typical-hour book (typical independent · not Motor) unless a licensed extract answers. Flags, not a buy button.",
  path: "/quote",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBrief href="/quote" />
      <QuotePage />
      <CompareTicket />
    </div>
  );
}
