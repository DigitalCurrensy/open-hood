"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ACCESS_COPY, auctionSearchLinks } from "@/lib/auctions/catalog";
import type { AuctionAccess } from "@/lib/auctions/types";
import { AUCTION_EXAMPLES, EXTERNAL_REL } from "@/lib/directory/vehicle-links";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

const ORDER: AuctionAccess[] = ["public_consumer", "public_browse_dealer_bid", "dealer_only"];

export function AuctionsDesk({
  year,
  make,
  model,
  q,
}: {
  year?: string;
  make?: string;
  model?: string;
  q?: string;
}) {
  const [vehicle] = useIdentifiedVehicle();
  const [y, setY] = useState(year || vehicle?.specs.year || "");
  const [mk, setMk] = useState(make || vehicle?.specs.make || "");
  const [md, setMd] = useState(model || vehicle?.specs.model || "");
  const [free, setFree] = useState(q || "");
  const links = useMemo(
    () => auctionSearchLinks({ year: y, make: mk, model: md, q: free }),
    [y, mk, md, free],
  );

  useEffect(() => {
    if (year) setY(year);
    if (make) setMk(make);
    if (model) setMd(model);
    if (q) setFree(q);
  }, [year, make, model, q]);
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {ORDER.map((access) => (
          <article key={access} className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cone">{ACCESS_COPY[access].stamp}</p>
            <h2 className="mt-1 font-display text-2xl uppercase text-fluorescent">{ACCESS_COPY[access].title}</h2>
            <p className="mt-2 text-sm leading-6 text-aluminum">{ACCESS_COPY[access].body}</p>
          </article>
        ))}
      </section>

      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cone">Link-out search</p>
        <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Year / make / model</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-aluminum">
          Query params on this page fill the boxes. We do not scrape Copart or IAA. Each button opens their own search.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Year</span>
            <input
              value={y}
              onChange={(event) => setY(event.target.value)}
              className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent"
            />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Make</span>
            <input
              value={mk}
              onChange={(event) => setMk(event.target.value)}
              className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent"
            />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Model</span>
            <input
              value={md}
              onChange={(event) => setMd(event.target.value)}
              className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent"
            />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Or free text</span>
            <input
              value={free}
              onChange={(event) => setFree(event.target.value)}
              placeholder="1991 NSX"
              className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
            />
          </label>
        </div>
        <p className="mt-4 text-sm text-aluminum">
          Try{" "}
          {AUCTION_EXAMPLES.map((example, index) => (
            <span key={example.href}>
              {index > 0 ? " or " : null}
              <Link href={example.href} className="text-ticket hover:text-fluorescent">
                {example.label}
              </Link>
            </span>
          ))}
        </p>
      </form>

      {ORDER.map((access) => {
        const group = links.filter((link) => link.house.access === access);
        const ticket = access === "public_consumer";
        return (
          <section key={access}>
            <h2 className="font-display text-3xl uppercase text-fluorescent">
              {access === "public_consumer"
                ? "BaT / Cars & Bids lane"
                : access === "public_browse_dealer_bid"
                  ? "Copart / IAA lane"
                  : "Dealer-only wholesale"}
            </h2>
            <div className={`mt-3 grid gap-3 md:grid-cols-2 ${ticket ? "" : ""}`}>
              {group.map((link) => (
                <article
                  key={link.house.id}
                  className={
                    ticket
                      ? "ticket-paper rounded-sm p-5 text-ticket-ink"
                      : "rounded-sm border border-white/10 bg-bay-2/80 p-5"
                  }
                >
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.24em] ${ticket ? "" : "text-cone"}`}
                  >
                    {link.house.lane} · {link.house.access.replace(/_/g, " ")}
                  </p>
                  <h3 className="mt-1 font-display text-2xl uppercase leading-none">{link.house.name}</h3>
                  <p className={`mt-2 text-sm leading-6 ${ticket ? "" : "text-aluminum"}`}>{link.house.whoCanAccess}</p>
                  <p className={`mt-2 text-sm leading-6 ${ticket ? "opacity-80" : "text-aluminum-dim"}`}>
                    Public: {link.house.publicData}
                  </p>
                  <a
                    href={link.href}
                    target="_blank"
                    rel={EXTERNAL_REL}
                    className={
                      ticket
                        ? "mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.16em] underline"
                        : "mt-4 inline-block rounded-sm bg-ticket px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
                    }
                  >
                    {link.query ? `Search ${link.query}` : "Open house"}
                  </a>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
        <Link href="/directory" className="text-ticket">
          Directory
        </Link>
        {" · "}
        <Link href="/directory/parts" className="hover:text-ticket">
          Parts SKUs
        </Link>
      </p>
    </div>
  );
}
