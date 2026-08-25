import type { Metadata } from "next";
import { PartsSkuDesk } from "@/app/directory/parts/parts-sku-desk";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Parts SKUs",
  description: "Open RockAuto, AutoZone, Amazon, and eBay Motors searches. Not TecDoc. Not live inventory.",
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
      <PageHeader kicker="Search URLs · not TecDoc" title="Parts SKUs">
        Year, make, model, and a part type become four outbound searches. We do not invent interchange numbers or
        dealer stock.
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
