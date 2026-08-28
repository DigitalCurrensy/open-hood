import { NextResponse } from "next/server";
import { buildEstimate, parseEstimateSearch } from "@/lib/labor/estimate";
import { EstimateError } from "@/lib/labor/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = parseEstimateSearch(new URL(request.url).searchParams);

  try {
    const payload = buildEstimate(query);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    if (error instanceof EstimateError) {
      return NextResponse.json({ error: error.message, jobs: buildEstimate({}).jobs }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not price that job." },
      { status: 500 },
    );
  }
}
