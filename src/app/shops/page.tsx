import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ShopsDesk } from "@/components/shops-desk";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Find a shop",
  description: "A Maps search plus the questions to ask. We do not book, certify, or take a cut.",
  path: "/shops",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Maps · not a network" title="Find a shop">
        We open Maps. We hand you questions. We do not certify shops or take a booking fee.
      </PageHeader>
      <ShopsDesk />
    </div>
  );
}
