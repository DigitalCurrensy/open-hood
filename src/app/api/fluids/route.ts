import { NextResponse } from "next/server";
import { fluidsCatalogCounts, fluidsLaneLabel, lookupFluids, typicalIntervalCards } from "@/lib/fluids";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = (searchParams.get("year") ?? "").trim();
  const make = (searchParams.get("make") ?? "").trim();
  const model = (searchParams.get("model") ?? "").trim();

  if (!year || !make || !model) {
    return NextResponse.json(
      {
        error: "Need year, make, and model.",
        example: "/api/fluids?year=2003&make=Honda&model=Accord",
        intervals: typicalIntervalCards(),
        counts: fluidsCatalogCounts(),
      },
      { status: 400 },
    );
  }

  const hit = lookupFluids(year, make, model);
  return NextResponse.json(
    {
      year,
      make,
      model,
      fluids: hit.fluids,
      row: hit.row,
      lane: hit.lane,
      laneLabel: fluidsLaneLabel(hit.lane),
      disclaimer:
        hit.lane === "heuristic"
          ? "BOOK LANE IS HEURISTIC — not Motor, not OEM TIS. Door jamb wins. Do not pour from this guess."
          : "Catalog match — factory-typical pamphlet, not a licensed Motor / Mitchell / OEM TIS book. Door jamb still owns PSI.",
      intervals: hit.intervals,
      intervalNote:
        "Factory-typical US pamphlet (oil 5k/10k, cabin 15k, coolant 5yr/100k, brake fluid 3yr). Not OEM TIS. Cap and door jamb still win.",
      crossref: hit.crossref,
      counts: fluidsCatalogCounts(),
    },
    {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    },
  );
}
