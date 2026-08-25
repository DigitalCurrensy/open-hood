"use client";

import { useEffect, useState } from "react";
import type { RelatedYoutubeVideo } from "@/lib/guides/types";
import { youtubeSearchUrl } from "@/lib/guides/youtube";

export function RelatedYoutube({
  guideId,
  fallbackQuery,
}: {
  guideId: string;
  fallbackQuery: string;
}) {
  const [videos, setVideos] = useState<RelatedYoutubeVideo[]>([]);
  const [note, setNote] = useState("Looking for related clips…");
  const [usedApi, setUsedApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/guides/related?id=${encodeURIComponent(guideId)}`);
        const body = (await response.json()) as {
          youtube?: { videos?: RelatedYoutubeVideo[]; usedApi?: boolean; note?: string };
          searchUrl?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok) {
          setNote(body.error || "Related search failed. Use the YouTube results link.");
          setVideos([]);
          return;
        }
        setVideos(body.youtube?.videos ?? []);
        setUsedApi(Boolean(body.youtube?.usedApi));
        setNote(body.youtube?.note || "Related clips.");
      } catch {
        if (!cancelled) {
          setVideos([]);
          setUsedApi(false);
          setNote("The related desk lost the line. The glossary video above still works.");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [guideId]);

  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">
        Related clips · {usedApi ? "YouTube Data API" : "no live key"}
      </p>
      <p className="mt-2 text-sm leading-6 text-aluminum">{note}</p>
      {videos.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {videos.map((video) => (
            <li key={video.videoId}>
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="block font-mono text-sm text-ticket hover:text-fluorescent"
              >
                {video.title}
                <span className="mt-0.5 block text-[11px] uppercase tracking-[0.14em] text-aluminum">
                  {video.channel}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <a
          href={youtubeSearchUrl(fallbackQuery)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.16em] text-ticket"
        >
          Open YouTube search
        </a>
      )}
    </section>
  );
}
