import type { RelatedYoutubeVideo } from "@/lib/guides/types";

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function hasYoutubeKey(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

interface YoutubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
  };
}

export async function searchYoutubeVideos(query: string): Promise<{
  videos: RelatedYoutubeVideo[];
  usedApi: boolean;
  note: string;
}> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return {
      videos: [],
      usedApi: false,
      note: "No YOUTUBE_API_KEY in the environment. The glossary still works. This search is a YouTube results page, not a live API list.",
    };
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "4");
  url.searchParams.set("q", query);
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("key", key);

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`YouTube search failed ${response.status}: ${detail.slice(0, 180)}`);
  }

  const payload = (await response.json()) as { items?: YoutubeSearchItem[] };
  const videos = (payload.items ?? [])
    .map((item) => {
      const videoId = item.id?.videoId ?? "";
      return {
        videoId,
        title: item.snippet?.title ?? "Untitled",
        channel: item.snippet?.channelTitle ?? "YouTube",
        url: videoId ? youtubeWatchUrl(videoId) : youtubeSearchUrl(query),
      };
    })
    .filter((item) => item.videoId);

  return {
    videos,
    usedApi: true,
    note: videos.length
      ? "Related clips from the YouTube Data API. We did not invent these IDs."
      : "The YouTube API returned no related clips. Use the search link.",
  };
}
