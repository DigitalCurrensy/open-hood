import type { Metadata } from "next";
import { HowItWorks } from "@/components/how-it-works";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "How it works",
  description: "What's free, what we refuse to fake, and how AutoShield sits next to you at the counter.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Trust · pricing" title="How it works">
        Factory specs in plain English. We advocate for the owner. We do not book the shop.
      </PageHeader>
      <HowItWorks />
    </div>
  );
}
