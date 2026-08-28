"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import apis from "@/data/apis.json";
import { PlaceCard } from "@/app/directory/place-card";
import { VehicleDataStrip } from "@/app/directory/vehicle-data";
import { FILTER_CHIPS } from "@/lib/directory/filters";
import { DIRECTORY_EXAMPLES, directorySearchHref } from "@/lib/directory/href";
import { chainLocators, DISCLAIMER, EMPTY_LOCATION_HINT, OSM_HONESTY } from "@/lib/directory/chains";
import { emptyZipMessage } from "@/lib/directory/empty-zip";
import { EXTERNAL_REL } from "@/lib/directory/vehicle-links";
import type { DirectorySearchResult, PlaceType } from "@/lib/directory/types";

type FilterId = PlaceType | "all";

function formatUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function DirectoryDesk({
  initialQuery,
  initialType,
  year,
  make,
  model,
}: {
  initialQuery: string;
  initialType: FilterId;
  year?: string;
  make?: string;
  model?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<FilterId>(initialType);
  const [result, setResult] = useState<DirectorySearchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const locators = useMemo(() => chainLocators(query || "near me"), [query]);
  const visible = useMemo(() => {
    if (!result) return [];
    if (type === "all") return result.places;
    return result.places.filter((place) => place.type === type);
  }, [result, type]);

  useEffect(() => {
    setQuery(initialQuery);
    setType(initialType);
  }, [initialQuery, initialType]);

  useEffect(() => {
    if (initialQuery.trim()) void runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function runSearch(nextQuery?: string) {
    const q = (nextQuery ?? query).trim();
    const zipFault = emptyZipMessage(q);
    if (zipFault) {
      setError(zipFault);
      setResult(null);
      return;
    }
    setBusy(true);
    setError("");
    router.replace(directorySearchHref(q, type), { scroll: false });
    try {
      const response = await fetch(`/api/directory/search?${new URLSearchParams({ q, type: "all" }).toString()}`);
      const body = (await response.json()) as DirectorySearchResult & { error?: string };
      if (!response.ok) {
        setError(body.error || "Directory search failed.");
        setResult(null);
        return;
      }
      setResult(body);
    } catch {
      setError(
        "The directory desk lost the line. Type the ZIP again. Cached samples stay on 90210 and 43215 — only if you open those desks.",
      );
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("This browser has no location. Type a ZIP.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams({
          lat: String(position.coords.latitude),
          lon: String(position.coords.longitude),
        });
        void fetch(`/api/directory/geocode?${params.toString()}`)
          .then((response) => response.json())
          .then((body: { query?: string; label?: string; error?: string }) => {
            const next = (body.query || body.label || "").trim();
            if (!next) {
              setError("Location came back without a ZIP. Type one.");
              return;
            }
            setQuery(next);
            return runSearch(next);
          })
          .catch(() => {
            setError("Reverse geocode missed. Type a ZIP.");
          })
          .finally(() => {
            setLocating(false);
          });
      },
      () => {
        setLocating(false);
        setError("Location permission stayed off. Type a ZIP.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  }

  return (
    <div className="space-y-6">
      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch();
        }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Near me · OSM Overpass</p>
        <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">ZIP or city</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-aluminum">
          {OSM_HONESTY} We geocode with Nominatim, then pull OSM shops around that pin. A miss stays a miss — we do
          not hand you another city. We do not scrape Copart, Carfax, or dealer sites.
        </p>
        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Where</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="postal-code"
            placeholder="Five-digit ZIP or a city — not another town"
            className="mt-2 min-h-11 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>
        <fieldset className="mt-4">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Filter</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                aria-pressed={type === chip.id}
                className={`min-h-11 rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
                  type === chip.id ? "border-ticket bg-ticket text-ticket-ink" : "border-white/10 text-aluminum"
                }`}
                onClick={() => {
                  setType(chip.id);
                  router.replace(directorySearchHref(query.trim(), chip.id), { scroll: false });
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-60"
          >
            {busy ? "Sweeping the map…" : "Find rooftops"}
          </button>
          <button
            type="button"
            disabled={locating || busy}
            onClick={useMyLocation}
            className="min-h-11 rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-60"
          >
            {locating ? "Asking the phone…" : "Use my location"}
          </button>
          <p className="text-sm text-aluminum">
            Sample desks (only if you ask):{" "}
            {DIRECTORY_EXAMPLES.map((example, index) => (
              <span key={example.href}>
                {index > 0 ? (index === DIRECTORY_EXAMPLES.length - 1 ? ", or " : ", ") : null}
                <Link href={example.href} className="text-ticket hover:text-fluorescent">
                  {example.label}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </form>

      <VehicleDataStrip year={year} make={make} model={model} />

      {error ? (
        <div className="rounded-sm border border-cone/40 bg-bay-2 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cone">Empty bay</p>
          <p className="mt-2 text-sm leading-6 text-fluorescent">{error}</p>
        </div>
      ) : null}

      {result ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-aluminum">
                {result.geocode?.label ?? query} · {visible.length} rooftops · {result.source}
                {result.timedOut ? " · cached sample" : ""}
                {result.updatedAt ? ` · Updated ${formatUpdated(result.updatedAt)}` : ""}
              </p>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-aluminum">
                {visible.length
                  ? result.message
                  : result.places.length === 0
                    ? result.message
                    : `Nothing in that filter for this radius. ${DISCLAIMER}`}
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum-dim">{result.attribution}</p>
          </div>
          {visible.length === 0 ? (
            <div className="rounded-sm border border-white/10 p-6">
              <h3 className="font-display text-2xl uppercase text-fluorescent">
                {result.places.length === 0 ? "No rooftops for that ask" : "No pins in this filter"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-aluminum">
                {result.places.length === 0
                  ? result.message || EMPTY_LOCATION_HINT
                  : "Switch the chip or try another ZIP. National counters stay on this ticket either way."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visible.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <p className="text-sm leading-6 text-aluminum">{DISCLAIMER}</p>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Chain locators · public</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">National counters</h2>
          <p className="mt-2 text-sm leading-6">
            We open their store finder with your ZIP. That is not live inventory and not a booking.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {locators.retail.map((chain) => (
              <li key={chain.id}>
                <a
                  href={chain.href}
                  target="_blank"
                  rel={EXTERNAL_REL}
                  className="underline decoration-ticket-ink/30 underline-offset-2"
                >
                  {chain.name}
                </a>
                <span className="ml-2 font-mono text-[10px] uppercase tracking-wide">{chain.kind}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Dealer groups</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Rooftop lists</h2>
          <ul className="mt-4 space-y-2 text-sm text-aluminum">
            {locators.dealerGroups.map((group) => (
              <li key={group.id}>
                <a href={group.href} target="_blank" rel={EXTERNAL_REL} className="text-fluorescent hover:text-ticket">
                  {group.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
            <Link href="/directory/parts" className="text-ticket">
              Parts SKU search
            </Link>
            {" · "}
            <Link href="/auctions?year=2018&make=Honda&model=Civic" className="hover:text-ticket">
              2018 Civic auctions
            </Link>
          </p>
        </article>
      </section>

      <section className="rounded-sm border border-white/10 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cone">Data providers</p>
        <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Wired vs cataloged</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          Free public APIs run now. Paid catalogs stay honest: a missing key is a missing key, not a fake tile.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {apis.map((api) => (
            <li key={api.id} className="border-t border-white/10 pt-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">
                {api.wired === true ? "Wired" : api.wired === "stub" ? "Hook" : "Catalog"}
                {api.env ? ` · ${api.env}` : ""}
              </p>
              <p className="font-display text-xl uppercase text-fluorescent">{api.name}</p>
              <p className="mt-1 text-sm leading-6 text-aluminum">{api.purpose}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
