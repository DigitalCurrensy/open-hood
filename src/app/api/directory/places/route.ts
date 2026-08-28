import { NextResponse } from "next/server";
import { queryLivePlaces } from "@/lib/directory/places";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const zip = (url.searchParams.get("zip") ?? url.searchParams.get("q") ?? "").trim();
  const lat = Number.parseFloat(url.searchParams.get("lat") ?? "");
  const lon = Number.parseFloat(url.searchParams.get("lon") ?? "");
  const radius = Number.parseInt(url.searchParams.get("radius") ?? "12000", 10);

  const result = await queryLivePlaces({
    query: zip,
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
    radiusM: Number.isFinite(radius) ? radius : 12_000,
  });

  return NextResponse.json(
    {
      connected: result.connected,
      results: result.results,
      google: result.google,
      yelp: result.yelp,
      query: result.query,
      message: result.message,
      geocode: result.geocode,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
