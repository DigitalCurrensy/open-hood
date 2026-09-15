import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PartsPage } from "@/components/pages/parts-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Search the part",
  description: "RockAuto, AutoZone, Amazon search URLs from the spec card. Not live stock. Not a cart.",
  path: "/parts",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Search URLs · not a shelf" title="Search the part">
        We open catalog search for this car. We do not invent interchange or “in stock at your dealer.”
      </PageHeader>
      <PartsPage />
    </div>
  );
}
