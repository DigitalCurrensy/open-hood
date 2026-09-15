import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { GaragePage } from "@/components/pages/garage-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Oil and PSI",
  description: "Factory-typical oil, coolant, PSI, and filter notes. Honda demo stays 5W-20. Confirm the door jamb.",
  path: "/garage",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Door jamb wins" title="Oil and PSI">
        Catalog plus heuristic. Honda demo VIN stays 5W-20 / 3.0L. Not TecDoc.
      </PageHeader>
      <GaragePage />
    </div>
  );
}
