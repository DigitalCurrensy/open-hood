import { NextResponse } from "next/server";
import { fetchSafetyRatings } from "@/lib/directory/nhtsa-safety";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const year = params.get("year") ?? "";
  const make = params.get("make") ?? "";
  const model = params.get("model") ?? "";
  if (!year || !make || !model) {
    return NextResponse.json({ error: "Need year, make, and model." }, { status: 400 });
  }
  try {
    const rows = await fetchSafetyRatings(year, make, model);
    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "NHTSA ratings failed" },
      { status: 502 },
    );
  }
}
