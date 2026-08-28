import { DirectoryDesk } from "@/app/directory/directory-desk";
import { PlacesLayer } from "@/app/directory/places-layer";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { isPlaceType } from "@/lib/directory/filters";
import type { PlaceType } from "@/lib/directory/types";

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function parseDirectoryType(raw: string): PlaceType | "all" {
  return raw === "all" || isPlaceType(raw) ? raw : "all";
}

export function directoryFieldsFromSearch(params: { [key: string]: string | string[] | undefined }): {
  query: string;
  type: PlaceType | "all";
  year: string;
  make: string;
  model: string;
} {
  const typeRaw = first(params.type) || first(params.filter) || "all";
  return {
    query: first(params.q) || first(params.zip),
    type: parseDirectoryType(typeRaw),
    year: first(params.year),
    make: first(params.make),
    model: first(params.model),
  };
}

export function DirectoryBay({
  query,
  type,
  year,
  make,
  model,
}: {
  query: string;
  type: PlaceType | "all";
  year?: string;
  make?: string;
  model?: string;
}) {
  return (
    <div className="space-y-6">
      <PageBrief href="/directory" />
      <PageHeader kicker="Rooftops · not a marketplace" title="Directory">
        Shops near this pin from OpenStreetMap, refreshed hourly. Address and phone when OSM has them. We do not book a
        bay, take a cut, or invent a national dealer list.
      </PageHeader>
      <DirectoryDesk
        initialQuery={query}
        initialType={type}
        year={year}
        make={make}
        model={model}
      />
      <PlacesLayer zip={query} />
    </div>
  );
}
