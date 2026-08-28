import type { Metadata } from "next";
import { PageBrief } from "@/components/page-brief";
import { RecallsPage } from "@/components/pages/recalls-page";
import { VIN_OPEN_CLOSED_STAMP } from "@/lib/nhtsa";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Recalls",
  description: `NHTSA nameplate campaigns in plain English. ${VIN_OPEN_CLOSED_STAMP}`,
  path: "/recalls",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBrief href="/recalls" />
      <RecallsPage />
    </div>
  );
}
