import type { Metadata } from "next";
import { PageBrief } from "@/components/page-brief";
import { PartsPage } from "@/components/pages/parts-page";

export const metadata: Metadata = {
  title: "Parts desk",
  description: "Search RockAuto, AutoZone, and Amazon from the fluids-card SKUs.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBrief href="/parts" />
      <PartsPage />
    </div>
  );
}
