import { AskStage } from "@/components/agent/ask-stage";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Ask",
  description: "Ask before you authorize. Quote line, noise, or scanner code. Three sentences. No booking.",
  path: "/agent",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Same box as home" title="Ask">
        Quote line, noise, or code. Copy the three sentences. We do not book a shop.
      </PageHeader>
      <AskStage />
    </div>
  );
}
