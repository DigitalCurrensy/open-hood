import { NextResponse } from "next/server";
import { getGuide, relatedGuides } from "@/lib/guides/glossary";
import { hasYoutubeKey, searchYoutubeVideos, youtubeSearchUrl } from "@/lib/guides/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") ?? "").trim();
  const q = (searchParams.get("q") ?? "").trim();
  const guide = id ? getGuide(id) : undefined;

  if (id && !guide) {
    return NextResponse.json({ error: "That job is not in the glossary." }, { status: 404 });
  }

  const query =
    q ||
    (guide
      ? `${guide.youtube.title} ${guide.youtube.channel} ${guide.jobFamily} how to`
      : "");

  if (!query) {
    return NextResponse.json({ error: "Pass id or q." }, { status: 400 });
  }

  let youtube: Awaited<ReturnType<typeof searchYoutubeVideos>>;
  try {
    youtube = await searchYoutubeVideos(query);
  } catch (error) {
    youtube = {
      videos: [],
      usedApi: hasYoutubeKey(),
      note:
        error instanceof Error
          ? `YouTube search failed: ${error.message.slice(0, 160)}`
          : "YouTube search failed. The glossary still works.",
    };
  }

  return NextResponse.json({
    id: guide?.id ?? null,
    query,
    searchUrl: youtubeSearchUrl(query),
    glossary: guide ? relatedGuides(guide) : [],
    youtube,
  });
}
