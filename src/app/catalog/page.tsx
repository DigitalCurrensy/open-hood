import { CatalogDesk } from "@/app/catalog/catalog-desk";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { FLUIDS_DISCLAIMER, fluidsCatalogCounts } from "@/lib/fluids";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMeta({
  title: "Fluids catalog",
  description:
    "Search factory-typical oil, coolant, ATF, brake DOT, PSI, and filter SKUs. Confirm the door jamb. Not a licensed MOTOR or TecDoc book.",
  path: "/catalog",
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
  const counts = fluidsCatalogCounts();
  return (
    <div className="space-y-6">
      <PageBrief href="/catalog" />
      <PageHeader kicker="Catalog · not TecDoc" title="Fluids book">
        {counts.fluidsCatalog} year/make/model rows. Oil, quarts, PSI, filter SKUs, coolant, ATF, brake DOT. {FLUIDS_DISCLAIMER}
      </PageHeader>
      <CatalogDesk
        q={first(params.q)}
        year={first(params.year)}
        make={first(params.make)}
        model={first(params.model)}
      />
    </div>
  );
}
