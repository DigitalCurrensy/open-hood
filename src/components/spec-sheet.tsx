import Link from "next/link";
import type { IdentifiedVehicle } from "@/lib/types";

export function SpecSheet({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const { fluids, recalls } = vehicle;
  const preview = recalls.slice(0, 3);
  const sourceLabel =
    fluids.source === "catalog" ? "Matched OEM-typical catalog" : "Factory-typical heuristic — confirm the under-hood label";

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
            <h3 className="font-display text-4xl uppercase leading-none">
              One-tap card
            </h3>
          </div>
          <span className="max-w-[10rem] text-right font-mono text-[10px] uppercase leading-4 tracking-wide opacity-70">
            {sourceLabel}
          </span>
        </div>

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
      </article>

      <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <h3 className="font-display text-2xl uppercase tracking-wide text-fluorescent">
          Open recalls
        </h3>
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
          <Link href="/parts" className="text-aluminum hover:text-ticket">
            Buy the filters yourself
          </Link>
        </div>
      </article>
    </div>
  );
}
