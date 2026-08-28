import { NextResponse } from "next/server";
import { queryLivePlaces } from "@/lib/directory/places";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const configured = Boolean(process.env.YELP_API_KEY?.trim());

  if (!configured) {
    return NextResponse.json({
      configured: false,
      connected: false,
      probed: "none",
      results: [],
      unlocks: "YELP_API_KEY would merge Fusion phones and addresses. Public Yelp search URLs still work. No invented stars.",
      searchUrl: "https://www.yelp.com/search?find_desc=auto+repair",
    });
  }

  const result = await queryLivePlaces({ query: q });
  const yelpOnly = result.results.filter((place) => place.source === "yelp");
  return NextResponse.json({
    configured: true,
    connected: result.yelp,
    probed: "skip",
    results: yelpOnly,
    query: result.query,
    message: result.message,
    unlocks: "Fusion rows we actually received.",
  });
}
