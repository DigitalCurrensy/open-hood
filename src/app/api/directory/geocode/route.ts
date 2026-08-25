import { NextResponse } from "next/server";
import { geocodePlace } from "@/lib/directory/nominatim";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({ error: "Enter a ZIP or city." }, { status: 400 });
  }
  const hit = await geocodePlace(query);
  if (!hit) {
    return NextResponse.json({ error: "Nominatim could not place that query." }, { status: 404 });
  }
  return NextResponse.json(hit);
}
