import { NextResponse } from "next/server";
import { searchDirectory } from "@/lib/directory/search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? url.searchParams.get("zip") ?? "";
  const type = url.searchParams.get("type") ?? url.searchParams.get("filter") ?? "all";
  const radius = Number.parseInt(url.searchParams.get("radius") ?? "12000", 10);

  try {
    const result = await searchDirectory({
      query,
      type,
      radiusM: Number.isFinite(radius) ? radius : 12_000,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Directory search failed" },
      { status: 502 },
    );
  }
}
