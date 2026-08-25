"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import apis from "@/data/apis.json";
import { PlaceCard } from "@/app/directory/place-card";
import { VehicleDataStrip } from "@/app/directory/vehicle-data";
import { FILTER_CHIPS } from "@/lib/directory/filters";
import { chainLocators, DISCLAIMER } from "@/lib/directory/chains";
import type { DirectorySearchResult, PlaceType } from "@/lib/directory/types";

type FilterId = PlaceType | "all";

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
  const [error, setError] = useState("");
  const locators = useMemo(() => chainLocators(query || "near me"), [query]);
  const visible = useMemo(() => {
    if (!result) return [];
    if (type === "all") return result.places;
    return result.places.filter((place) => place.type === type);
  }, [result, type]);

  useEffect(() => {
    if (initialQuery.trim()) void runSearch();
    // First paint only — user edits drive later searches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch() {
    const q = query.trim();
    if (!q) {
      setError("Enter a ZIP or a city.");
      setResult(null);
      return;
    }
    setBusy(true);
    setError("");
    const params = new URLSearchParams({ q, type });
    router.replace(`/directory?${params.toString()}`, { scroll: false });
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
      setError("The directory desk lost the line. Try 90210 — we keep a cached sample for that ZIP.");
      setResult(null);
    } finally {
      setBusy(false);
    }
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
          Everyday owners and industry counters use the same map. We geocode with Nominatim, then pull OSM shops around
          that pin. We do not scrape Copart, Carfax, or dealer sites.
        </p>
        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Where</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="postal-code"
            placeholder="90210 or Columbus, OH"
            className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>
        <fieldset className="mt-4">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Filter</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FILTER_CHIPS.map((chip) => (
              <label
                key={chip.id}
                className={`cursor-pointer rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
                  type === chip.id ? "border-ticket bg-ticket text-ticket-ink" : "border-white/10 text-aluminum"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  className="sr-only"
                  checked={type === chip.id}
                  onChange={() => {
                    setType(chip.id);
                    const next = new URLSearchParams({ q: query.trim(), type: chip.id });
                    router.replace(`/directory?${next.toString()}`, { scroll: false });
                  }}
                />
                {chip.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-60"
          >
            {busy ? "Sweeping the map…" : "Find rooftops"}
          </button>
          <p className="text-sm text-aluminum">
            Try <button type="button" className="text-ticket" onClick={() => setQuery("90210")}>90210</button>
            {" or "}
            <button type="button" className="text-ticket" onClick={() => setQuery("43215")}>43215</button>
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
              </p>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-aluminum">
                {visible.length ? result.message : `Nothing in that filter for this radius. ${DISCLAIMER}`}
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum-dim">{result.attribution}</p>
          </div>
          {visible.length === 0 ? (
            <div className="rounded-sm border border-white/10 p-6">
              <h3 className="font-display text-2xl uppercase text-fluorescent">No pins in this radius</h3>
              <p className="mt-2 text-sm leading-6 text-aluminum">
                OSM is volunteer-mapped. Widen the city name, switch the filter, or set{" "}
                <span className="font-mono text-ticket">GOOGLE_PLACES_API_KEY</span> for a denser pull.
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
                <a href={chain.href} rel="noreferrer" className="underline decoration-ticket-ink/30 underline-offset-2">
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
                <a href={group.href} rel="noreferrer" className="text-fluorescent hover:text-ticket">
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
            <Link href="/auctions" className="hover:text-ticket">
              Auctions
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
