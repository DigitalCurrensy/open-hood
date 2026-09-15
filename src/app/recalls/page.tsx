import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RecallsPage } from "@/components/pages/recalls-page";
import { VIN_OPEN_CLOSED_STAMP } from "@/lib/nhtsa";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Recalls",
  description: `NHTSA campaigns in plain English. ${VIN_OPEN_CLOSED_STAMP}`,
  path: "/recalls",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Year / make / model" title="Recalls">
        SaferCar list for this nameplate. Open vs closed is a dealer VIN check. We do not close campaigns.
      </PageHeader>
      <RecallsPage />
    </div>
  );
}
