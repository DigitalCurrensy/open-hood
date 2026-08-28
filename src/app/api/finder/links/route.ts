import { NextResponse } from "next/server";
import { catalogStatus, parseFinderFilters, partsQuery, retailerLinks } from "@/lib/finder";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = parseFinderFilters(Object.fromEntries(searchParams.entries()));
  const part = (searchParams.get("part") ?? searchParams.get("q") ?? "cabin air filter").trim();
  if (!part) {
    return NextResponse.json({ error: "Name the part to search." }, { status: 400 });
  }
  const query = partsQuery(filters.ymm, part);
  return NextResponse.json({
    query,
    ymm: filters.ymm,
    catalog: catalogStatus(),
    retailers: retailerLinks(filters.ymm, part),
  });
}
