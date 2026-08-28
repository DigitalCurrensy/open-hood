import { EstimateBrief } from "@/app/estimate/estimate-brief";
import { EstimateDesk } from "@/app/estimate/estimate-desk";
import { PageHeader } from "@/components/page-header";
import { ESTIMATE_ROUTE } from "@/config/nav/estimate";
import { LABOR_DISCLAIMER } from "@/lib/labor/types";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Estimate + ZIP labor",
  description:
    "Job plus ZIP — 90210 is the demo. Parts plus independent labor as a regional band. Not a licensed Motor or AllData hour. Dealer is the same job at that region’s higher door rate.",
  path: "/estimate",
});

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <div className="space-y-6">
      <EstimateBrief />
      <PageHeader kicker={`Window 12 · ${ESTIMATE_ROUTE}`} title="Estimate + ZIP labor">
        Job plus ZIP. Independent range on the yellow copy. Dealer is the same job at that region’s higher door
        rate. {LABOR_DISCLAIMER}
      </PageHeader>
      <EstimateDesk
        initialZip={first(params.zip)}
        initialJob={first(params.job) || "pads"}
        initialYear={first(params.year)}
        initialMake={first(params.make)}
        initialModel={first(params.model)}
        initialQuoted={first(params.quoted) || first(params.quote)}
      />
    </div>
  );
}
