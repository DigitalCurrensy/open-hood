import type { Metadata } from "next";
import { DirectoryDesk } from "@/app/directory/directory-desk";
import { isPlaceType } from "@/lib/directory/filters";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Directory",
  description:
    "Find dealers, parts stores, independents, body shops, tire shops, towing, inspections, and washes from OpenStreetMap.",
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
  const typeRaw = first(params.type) || first(params.filter) || "all";
  const type = typeRaw === "all" || isPlaceType(typeRaw) ? typeRaw : "all";

  return (
    <div className="space-y-6">
      <PageHeader kicker="Rooftops · not a marketplace" title="Directory">
        Dealers, parts, independents, body, tires, towing, inspections, washes. Address and phone when OSM has them.
        We do not book a bay or take a cut.
      </PageHeader>
      <DirectoryDesk
        initialQuery={first(params.q) || first(params.zip)}
        initialType={type}
        year={first(params.year)}
        make={first(params.make)}
        model={first(params.model)}
      />
    </div>
  );
}
