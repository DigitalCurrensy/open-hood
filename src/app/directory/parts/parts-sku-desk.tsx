"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listPartTypes, partSearchLinks } from "@/lib/directory/parts";
import { SKU_SEARCH_EXTRAS, SKU_SEARCH_HREF_COUNT, retailerSearchHrefs } from "@/lib/directory/sku-search";
import { EXAMPLE_VEHICLE, EXTERNAL_REL, partsExampleHref } from "@/lib/directory/vehicle-links";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function PartsSkuDesk({
  year,
  make,
  model,
  part,
}: {
  year?: string;
  make?: string;
  model?: string;
  part?: string;
}) {
  const [vehicle] = useIdentifiedVehicle();
  const types = listPartTypes();
  const [y, setY] = useState(year || vehicle?.specs.year || "");
  const [mk, setMk] = useState(make || vehicle?.specs.make || "");
  const [md, setMd] = useState(model || vehicle?.specs.model || "");
  const [partId, setPartId] = useState(part || types[0]?.id || "oil-filter");
  const selected = types.find((item) => item.id === partId) ?? types[0];
  const links = useMemo(
    () => partSearchLinks(y, mk, md, selected?.query ?? "oil filter"),
    [y, mk, md, selected?.query],
  );

  useEffect(() => {
    if (year) setY(year);
    if (make) setMk(make);
    if (model) setMd(model);
    if (part) setPartId(part);
  }, [year, make, model, part]);

  const shops = [
    ["RockAuto", links.rockauto, "Catalog search. Confirm the application. Not a cart."],
    ["AutoZone", links.autozone, "Retail search. Still not a shelf-count."],
    ["O’Reilly", links.oreilly, "Parts plus loaner tools. Confirm the application."],
    ["NAPA", links.napa, "Store search. We do not know the back-room count."],
    ["Amazon", links.amazon, "Marketplace search. Read the fitment notes."],
    ["eBay Motors", links.ebayMotors, "Used and aftermarket. Browse API needs a secret — this is a URL only."],
  ] as const;

  return (
    <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="font-display text-2xl uppercase tracking-wide">Build the query</h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          TecDoc / TecAlliance is a paid catalog. This desk will not fake interchange. It opens the same search you
          could type yourself.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Year</span>
            <input
              value={y}
              onChange={(event) => setY(event.target.value)}
              inputMode="numeric"
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
        </div>
        <fieldset className="mt-4">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Part type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {types.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={partId === item.id}
                className={`rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
                  partId === item.id ? "border-ticket bg-ticket text-ticket-ink" : "border-white/10 text-aluminum"
                }`}
                onClick={() => setPartId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="mt-4 font-mono text-[11px] text-aluminum">Query: {links.query || "year make model + part"}</p>
        <p className="mt-3 text-sm text-aluminum">
          Try{" "}
          <Link href={partsExampleHref("oil-filter")} className="text-ticket">
            2018 Honda Civic oil filter
          </Link>
          {" · "}
          <Link href={partsExampleHref("brake-pads")} className="text-ticket">
            brake pads
          </Link>
          {" · "}
          <button
            type="button"
            className="text-ticket"
            onClick={() => {
              setY(EXAMPLE_VEHICLE.year);
              setMk(EXAMPLE_VEHICLE.make);
              setMd(EXAMPLE_VEHICLE.model);
              setPartId("oil-filter");
            }}
          >
            fill Civic
          </button>
        </p>
      </form>

      <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Open these · no cart</p>
        <ul className="mt-4 space-y-4">
          {shops.map(([name, href, note]) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel={EXTERNAL_REL}
                className="font-display text-2xl uppercase leading-none underline"
              >
                {name}
              </a>
              <p className="mt-1 text-sm leading-6">{note}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em]">
          {SKU_SEARCH_HREF_COUNT} search hrefs in the table · checkout refused
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em]">
          <Link href="/directory">Back to rooftops</Link>
        </p>
      </aside>
    </div>
    <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">SKU search stamps · no inventory</p>
      <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">More store searches</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
        RockAuto / AutoZone / O’Reilly / NAPA hrefs for common jobs. We do not know what is on the shelf. We will
        not grow a cart.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SKU_SEARCH_EXTRAS.map((extra) => {
          const hrefs = retailerSearchHrefs(extra.q);
          return (
            <li key={extra.id} className="rounded-sm border border-white/10 p-3">
              <p className="font-display text-lg uppercase leading-none">{extra.label}</p>
              <p className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                {hrefs.map((store) => (
                  <a
                    key={store.id}
                    href={store.href}
                    target="_blank"
                    rel={EXTERNAL_REL}
                    className="rounded-sm border border-white/15 px-2 py-1 text-ticket hover:border-ticket/50"
                  >
                    {store.name}
                  </a>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
    </div>
  );
}
