"use client";

import { chromeFieldLedger } from "@/lib/chrome-data";
import { vpicCompleteness, type VpicCompleteness } from "@/lib/nhtsa";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import "./sticker.css";

export function ChromeLedger({ completeness = null }: { completeness?: VpicCompleteness | null }) {
  const ledger = chromeFieldLedger();
  const [vehicle] = useIdentifiedVehicle();
  const score = completeness ?? (vehicle ? vpicCompleteness(vehicle.specs) : vpicCompleteness(null));

  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Chrome Data</p>
          <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">connected: false</h2>
        </div>
        <p className="sticker-not-monroney rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-grease">
          Not Chrome · not Monroney
        </p>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">{ledger.liveWhen}</p>
      <p className="mt-3 text-sm leading-6 text-aluminum">{ledger.reason}</p>
      <p className="mt-2 text-sm leading-6 text-aluminum">{ledger.outreach}</p>

      <div className="mt-4 rounded-sm border border-white/10 bg-bay/40 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">vPIC completeness · not Chrome</p>
        <p className="mt-2 font-display text-3xl uppercase text-fluorescent">{score.percent}</p>
        <p className="mt-1 text-sm leading-6 text-aluminum">{score.stamp}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-sm bg-white/10" aria-hidden="true">
          <div className="h-full bg-ticket" style={{ width: `${Math.min(100, score.percent)}%` }} />
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {score.lanes.map((lane) => (
            <li key={lane.id} className="font-mono text-[11px] uppercase tracking-[0.12em] text-aluminum">
              {lane.label} · {lane.filled}/{lane.of}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FieldColumn kicker="On this VIN · vPIC" rows={ledger.vpic} />
        <FieldColumn kicker="Chrome / J.D. Power only" rows={ledger.chromeOnly} dark />
      </div>
    </section>
  );
}

function FieldColumn({
  kicker,
  rows,
  dark = false,
}: {
  kicker: string;
  rows: readonly { id: string; label: string; note: string }[];
  dark?: boolean;
}) {
  return (
    <div className={dark ? "rounded-sm border border-grease/40 bg-bay/40 p-3" : "rounded-sm border border-white/10 p-3"}>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{kicker}</p>
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="border-t border-white/10 pt-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fluorescent">{row.label}</p>
            <p className="mt-0.5 text-sm leading-5 text-aluminum">{row.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
