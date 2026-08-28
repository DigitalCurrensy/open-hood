import { PrivacyDesk } from "@/app/privacy/privacy-desk";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacy",
  description:
    "What stays on your phone and what leaves it. No accounts, no sale of personal information. Optional Google Analytics only if NEXT_PUBLIC_GA_ID is set.",
  path: "/privacy",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Paperwork 02 · privacy" title="Privacy">
        What stays on this phone, what leaves it, and who sees it. No accounts. We do not sell personal
        information. We do not sell the repair order.
      </PageHeader>
      <PrivacyDesk />
    </div>
  );
}
