import { NextResponse } from "next/server";
import { searchYoutubeVideos, youtubeSearchUrl } from "@/lib/guides/youtube";
import { guidesUrl, howToQuery } from "@/lib/integrations/urls";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") ?? "").trim();
  const year = (params.get("year") ?? "").trim();
  const make = (params.get("make") ?? "").trim();
  const model = (params.get("model") ?? "").trim();
  const howTo = q || howToQuery({ year, make, model, vin: "", address: "", part: "", howTo: "" });

  if (!howTo.trim()) {
    return NextResponse.json({ error: "Pass q or year/make/model." }, { status: 400 });
  }

  try {
    const youtube = await searchYoutubeVideos(howTo);
    const configured = Boolean(process.env.YOUTUBE_API_KEY?.trim());
    return NextResponse.json({
      configured,
      probed: configured ? "skip" : "none",
      query: howTo,
      searchUrl: youtubeSearchUrl(howTo),
      guides: guidesUrl({ year, make, model, vin: "", address: "", part: "", howTo: q }),
      youtube: {
        ...youtube,
        videos: configured ? youtube.videos : [],
        usedApi: configured && youtube.usedApi,
        note: configured
          ? youtube.note
          : "No YOUTUBE_API_KEY. We do not scrape. Open the results URL. videos stays [].",
      },
    });
  } catch (error) {
    const configured = Boolean(process.env.YOUTUBE_API_KEY?.trim());
    return NextResponse.json({
      configured,
      probed: configured ? "skip" : "none",
      query: howTo,
      searchUrl: youtubeSearchUrl(howTo),
      youtube: {
        videos: [],
        usedApi: configured,
        note: error instanceof Error ? error.message.slice(0, 160) : "YouTube search failed. The results page still works.",
      },
    });
  }
}
