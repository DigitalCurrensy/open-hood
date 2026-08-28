import Link from "next/link";
import { typicalIntervalCards } from "@/lib/fluids";
import type { IdentifiedVehicle } from "@/lib/types";

export function SpecSheet({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const { fluids, recalls, specs } = vehicle;
  const preview = recalls.slice(0, 3);
  const catalog = fluids.source === "catalog";
  const sourceKicker = catalog
    ? "Catalog match · JSON / code book"
    : "HEURISTIC — not Motor, not TIS, door jamb wins";
  const sourceStamp = catalog ? "CATALOG" : "HEURISTIC";
  const sourceLine = catalog
    ? "Factory-typical catalog — still confirm the door jamb. Not Motor. Not OEM TIS. Door jamb owns PSI."
    : "BOOK LANE IS HEURISTIC — not Motor, not TIS, door jamb wins. Do not pour from this guess. Confirm the under-hood cap and the owner's manual before you buy oil.";
  const intervals = typicalIntervalCards(specs);

  const rows = [
    ["Engine oil", `${fluids.oilViscosity}`, fluids.oilSpec],
    ["Capacity", fluids.oilCapacityQt, "With filter unless noted"],
    ["Coolant", fluids.coolant, ""],
    ["Transmission", fluids.transmissionFluid, ""],
    ["Brake fluid", fluids.brakeFluid, ""],
    ["Tire PSI front", fluids.tirePsiFront, "Door sticker wins over sidewall"],
    ["Tire PSI rear", fluids.tirePsiRear, ""],
    ["Oil filter", fluids.oilFilterSku, ""],
    ["Air filter", fluids.airFilterSku, ""],
    ["Cabin filter", fluids.cabinFilterSku, "Often a 5-minute glove-box job"],
    ["Spark plug gap", fluids.sparkPlugGap, ""],
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
      <article className="ticket-paper rounded-sm p-5 text-ticket-ink sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em]">Liquid / fluids spec · copy 2</p>
            <h3 className="font-display text-4xl uppercase leading-none">One-tap card</h3>
          </div>
          <span
            className={`shrink-0 rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${
              catalog ? "bg-ticket-ink text-ticket" : "bg-[#b42318] text-[#f3d36b]"
            }`}
          >
            {sourceStamp}
          </span>
        </div>

        <p
          className={`mt-4 rounded-sm border px-3 py-2 font-mono text-[11px] uppercase leading-4 tracking-[0.12em] ${
            catalog ? "border-ticket-ink/25 bg-black/5" : "border-[#b42318] bg-[#b42318] text-[#f3d36b]"
          }`}
        >
          <span className={`block tracking-[0.22em] ${catalog ? "opacity-70" : "font-semibold"}`}>{sourceKicker}</span>
          <span className="mt-1 block normal-case tracking-normal">{sourceLine}</span>
        </p>

        <dl className="mt-5 divide-y divide-black/10">
          {rows.map(([label, value, note]) => (
            <div key={label} className="grid grid-cols-[8.5rem_1fr] gap-2 py-2.5 sm:grid-cols-[10rem_1fr]">
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">{label}</dt>
              <dd>
                <p className="font-semibold">{value || "—"}</p>
                {note ? <p className="text-xs opacity-70">{note}</p> : null}
              </dd>
            </div>
          ))}
        </dl>

        {fluids.caveats.length ? (
          <ul className="mt-4 space-y-1 text-xs">
            {fluids.caveats.map((caveat) => (
              <li key={caveat}>— {caveat}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5 border-t border-black/10 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">
            Typical interval · not TIS
          </p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {intervals.map((card) => (
              <li key={card.id} className="rounded-sm border border-black/10 bg-black/5 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
                  {card.stamp} · {card.title}
                </p>
                <p className="mt-1 text-xs leading-5">{card.reading}</p>
                <p className="mt-1">
                  <Link href={`/expert/${card.playbookSlug}`} className="font-mono text-[10px] uppercase tracking-[0.14em] underline">
                    {card.playbookSlug}
                  </Link>
                  {" · "}
                  <Link href={`/quote?job=${card.quoteSlug}`} className="font-mono text-[10px] uppercase tracking-[0.14em] underline">
                    quote {card.quoteSlug}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs opacity-70">
            Oil 5k/10k · cabin 15k · coolant 5yr/100k · brake fluid 3yr. Factory-typical US pamphlet. Not Motor. Not OEM
            TIS. The cap and the door jamb still win.
          </p>
        </div>
      </article>

      <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <h3 className="font-display text-2xl uppercase tracking-wide text-fluorescent">Open recalls</h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">NHTSA campaign file</p>
        {recalls.length === 0 ? (
          <p className="mt-4 text-sm text-aluminum">No recall rows returned for this year/make/model.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {preview.map((recall) => (
              <li key={recall.campaignNumber || recall.component} className="border-t border-white/10 pt-3">
                <p className="font-mono text-[11px] text-cone">{recall.campaignNumber}</p>
                <p className="text-sm font-semibold text-fluorescent">{recall.component}</p>
                <p className="mt-1 line-clamp-4 text-sm text-aluminum">{recall.summary}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
          <Link href="/recalls" className="text-ticket hover:underline">
            Full recall file ({recalls.length})
          </Link>
          <Link
            href={`/catalog?year=${encodeURIComponent(vehicle.specs.year)}&make=${encodeURIComponent(vehicle.specs.make)}&model=${encodeURIComponent(vehicle.specs.model)}`}
            className="text-aluminum hover:text-ticket"
          >
            Fluids book
          </Link>
          <Link href="/parts" className="text-aluminum hover:text-ticket">
            Buy the filters yourself
          </Link>
        </div>
      </article>
    </div>
  );
}
