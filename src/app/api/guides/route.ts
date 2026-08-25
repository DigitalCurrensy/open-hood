import { NextResponse } from "next/server";
import { allGuides, filterGuides, parseFilters } from "@/lib/guides/glossary";
import { hasYoutubeKey } from "@/lib/guides/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = parseFilters(Object.fromEntries(searchParams.entries()));
  const guides = filterGuides(filters);
  return NextResponse.json({
    count: guides.length,
    total: allGuides().length,
    filters,
    youtubeApi: hasYoutubeKey(),
    guides,
  });
}
