import { NextResponse } from "next/server";
import { emptyZipMessage } from "@/lib/directory/empty-zip";
import { DIRECTORY_REVALIDATE } from "@/lib/directory/http";
import { searchDirectory } from "@/lib/directory/search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? url.searchParams.get("zip") ?? "";
  const type = url.searchParams.get("type") ?? url.searchParams.get("filter") ?? "all";
  const radius = Number.parseInt(url.searchParams.get("radius") ?? "12000", 10);

  const zipFault = emptyZipMessage(query);
  if (zipFault) {
    return NextResponse.json({ error: zipFault }, { status: 400 });
  }

  try {
    const result = await searchDirectory({
      query,
      type,
      radiusM: Number.isFinite(radius) ? radius : 12_000,
    });
    const headers = result.timedOut
      ? { "Cache-Control": "no-store" }
      : { "Cache-Control": `public, s-maxage=${DIRECTORY_REVALIDATE}, stale-while-revalidate=600` };
    return NextResponse.json(result, { headers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Directory search failed" },
      { status: 502 },
    );
  }
}
