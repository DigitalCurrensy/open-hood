import { NextResponse } from "next/server";
import { EMPTY_LOCATION_HINT } from "@/lib/directory/chains";
import { geocodePlace, reverseGeocode } from "@/lib/directory/nominatim";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number.parseFloat(url.searchParams.get("lat") ?? "");
  const lon = Number.parseFloat(url.searchParams.get("lon") ?? "");
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    const hit = await reverseGeocode(lat, lon);
    if (!hit) {
      return NextResponse.json({ error: "Could not reverse that pin." }, { status: 404 });
    }
    return NextResponse.json(hit);
  }

  const query = url.searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({ error: EMPTY_LOCATION_HINT }, { status: 400 });
  }
  const hit = await geocodePlace(query);
  if (!hit) {
    return NextResponse.json(
      {
        error: `Nominatim could not place “${query}”. We will not show another city's shops. Type a ZIP, or open a sample desk (90210 / 43215) if you want that cached map.`,
      },
      { status: 404 },
    );
  }
  return NextResponse.json(hit);
}
