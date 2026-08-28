import type { Metadata } from "next";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { ShopsDesk } from "@/components/shops-desk";

export const metadata: Metadata = {
  title: "Find shops",
  description: "A Maps search you could have typed yourself — plus the questions to ask before you book.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBrief href="/shops" />
      <PageHeader kicker="Thin stub · on purpose" title="Find shops">
        We open Google Maps. We do not certify shops, take a booking fee, or pretend we audited the bay.
      </PageHeader>
      <ShopsDesk />
    </div>
  );
}
