"use client";

import { useEffect, useState } from "react";
import { PlaceCard } from "@/app/directory/place-card";
import type { DirectoryPlace } from "@/lib/directory/types";

type LivePlacesPayload = {
  connected: boolean;
  results: DirectoryPlace[];
  google?: boolean;
  yelp?: boolean;
  message?: string;
};

export function PlacesLayer({ zip }: { zip: string }) {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payload, setPayload] = useState<LivePlacesPayload | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (on && zip.trim()) params.set("zip", zip.trim());

    let cancelled = false;
    const pulling = on && Boolean(zip.trim());
    if (pulling) setBusy(true);
    void fetch(`/api/directory/places?${params.toString()}`)
      .then((response) => response.json())
      .then((body: LivePlacesPayload) => {
        if (!cancelled) setPayload(body);
      })
      .catch(() => {
        if (!cancelled) setPayload({ connected: false, results: [], message: "OSM only" });
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [on, zip]);

  const connected = payload?.connected ?? false;
  const osmOnly = payload != null && !connected;

  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Paid layer · optional</p>
          <h2 className="mt-1 font-display text-2xl uppercase text-fluorescent">Google / Yelp layer</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-aluminum">
            {osmOnly
              ? "OSM only. Google Places and Yelp keys are not set. Overpass still sweeps the map."
              : "Overpass stays on the main sweep. This jack pulls Places Nearby and Yelp Fusion when those keys exist."}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={on}
          onClick={() => setOn((value) => !value)}
          className={`rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] ${
            on ? "border-ticket bg-ticket text-ticket-ink" : "border-white/15 text-fluorescent"
          }`}
        >
          {on ? "Layer on" : "Google/Yelp layer"}
        </button>
      </div>

      {on && busy ? (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Asking the paid jack…</p>
      ) : null}

      {osmOnly ? (
        <p className="mt-4 rounded-sm border border-cone/40 px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-cone">
          OSM only
        </p>
      ) : null}

      {on && connected ? (
        <div className="mt-4 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">
            {(payload?.google ? "Google" : "") + (payload?.google && payload?.yelp ? " + " : "") + (payload?.yelp ? "Yelp" : "")}
            {payload?.results.length ? ` · ${payload.results.length} extra rooftops` : ""}
            {payload?.message ? ` · ${payload.message}` : ""}
          </p>
          {payload?.results.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {payload.results.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-aluminum">{payload?.message}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
