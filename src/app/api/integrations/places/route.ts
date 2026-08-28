import { NextResponse } from "next/server";
import { placesKeyStatus, queryLivePlaces } from "@/lib/directory/places";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? url.searchParams.get("zip") ?? "").trim();
  const keys = placesKeyStatus();

  if (!keys.connected) {
    return NextResponse.json({
      configured: false,
      connected: false,
      probed: "none",
      results: [],
      google: false,
      yelp: false,
      query: q,
      unlocks: "GOOGLE_PLACES_API_KEY merges Nearby Search into /directory. Off → OSM only. We do not invent shops.",
      message: "No Places key. OSM Overpass still runs on /directory.",
    });
  }

  const result = await queryLivePlaces({ query: q });
  return NextResponse.json({
    configured: true,
    connected: result.connected,
    probed: "skip",
    results: result.results,
    google: result.google,
    yelp: result.yelp,
    query: result.query,
    geocode: result.geocode,
    message: result.message,
    unlocks: "Live rooftops from the key that is on. OSM stays on the Overpass sweep.",
  });
}
