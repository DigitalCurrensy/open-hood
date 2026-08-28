import { NextResponse } from "next/server";
import { geocodePlace } from "@/lib/directory/nominatim";
import { directoryUrl, osmSearchUrl } from "@/lib/integrations/urls";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({ error: "Enter a ZIP or a city." }, { status: 400 });
  }

  const hit = await geocodePlace(query);
  if (!hit) {
    return NextResponse.json({ error: "Nominatim could not place that query." }, { status: 404 });
  }

  const ctx = { year: "", make: "", model: "", vin: "", address: query, part: "", howTo: "" };
  return NextResponse.json({
    ...hit,
    osm: osmSearchUrl(ctx),
    directory: directoryUrl(ctx),
    map: `https://www.openstreetmap.org/?mlat=${hit.lat}&mlon=${hit.lon}#map=14/${hit.lat}/${hit.lon}`,
  });
}
