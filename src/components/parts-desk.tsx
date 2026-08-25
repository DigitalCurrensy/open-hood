"use client";

import { buyLinks, PARTS_DISCLAIMER, partsForVehicle } from "@/lib/parts";
import type { IdentifiedVehicle } from "@/lib/types";

export function PartsDesk({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const rows = partsForVehicle(vehicle);

  if (rows.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-white/15 p-5 text-sm text-aluminum">
        No SKUs on the fluids card yet. Decode a VIN on the bay first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-aluminum">{PARTS_DISCLAIMER}</p>
      <ul className="space-y-4">
        {rows.map((row) => {
          const links = buyLinks(row.query);
          return (
            <li key={row.name} className="grid gap-4 rounded-sm border border-white/10 bg-bay-2/80 p-5 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">SKU / search</p>
                <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">{row.name}</h3>
                <p className="mt-1 font-mono text-xs text-ticket">{row.sku}</p>
                <p className="mt-2 text-sm leading-6 text-aluminum">{row.note}</p>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">DIY band</dt>
                    <dd>{row.diyBand}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">Shop band</dt>
                    <dd>{row.shopBand}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <BuyLink href={links.rockauto} label="Search RockAuto" />
                <BuyLink href={links.autozone} label="Search AutoZone" />
                <BuyLink href={links.amazon} label="Search Amazon" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BuyLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      rel="noreferrer"
      className="rounded-sm border border-white/15 px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent hover:border-ticket/60 hover:text-ticket"
    >
      {label}
    </a>
  );
}
