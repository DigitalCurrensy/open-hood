import type { Metadata } from "next";
import { PartsSkuDesk } from "@/app/directory/parts/parts-sku-desk";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Parts SKUs",
  description: "Open RockAuto, AutoZone, O’Reilly, and NAPA searches. Not TecDoc. Not live inventory. Not a cart.",
};

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
      <PageBrief href="/directory/parts" />
      <PageHeader kicker="Search URLs · not TecDoc" title="Parts SKUs">
        Year, make, model, and a part type become RockAuto / AutoZone / O’Reilly / NAPA search hrefs. We do not
        invent interchange numbers, shelf counts, or a checkout.
      </PageHeader>
      <PartsSkuDesk
        year={first(params.year)}
        make={first(params.make)}
        model={first(params.model)}
        part={first(params.part)}
      />
    </div>
  );
}
