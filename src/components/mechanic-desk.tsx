"use client";

import Link from "next/link";
import { useState } from "react";
import { scriptAsText, talkingPoints } from "@/lib/mechanic-points";
import type { IdentifiedVehicle } from "@/lib/types";
import { useLastQuote } from "@/lib/vehicle-session";

export function MechanicDesk({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const [quote] = useLastQuote();
  const points = talkingPoints(vehicle, quote);
  const [copied, setCopied] = useState(false);
  const title = [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ");

  async function copy() {
    try {
      await navigator.clipboard.writeText(scriptAsText(vehicle, points));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
      <article className="print-ticket ticket-paper rounded-sm p-6 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Repair order · customer talking points</p>
        <h2 className="mt-1 font-display text-4xl uppercase leading-none">{title}</h2>
        <p className="mt-1 font-mono text-xs tracking-[0.14em]">VIN {vehicle.specs.vin}</p>
        <ol className="mt-6 space-y-4">
          {points.slice(0, 6).map((point, index) => (
            <li key={point.title} className="border-t border-black/15 pt-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
                {index + 1} · {point.title}
              </p>
              <p className="mt-1 text-sm leading-6">{point.sayThis}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs leading-5 opacity-70">
          Open Hood is a translator, not a shop. Measurements beat adjectives. Call before extras.
        </p>
      </article>

      <aside className="no-print space-y-4">
        <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <h3 className="font-display text-2xl uppercase tracking-wide">Take it to the counter</h3>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            Print this yellow copy or paste it into a note. If you marked up a quote, the first bullets are from that
            ticket. The rest are spec talking points for this VIN.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
            >
              Print script
            </button>
            <button
              type="button"
              onClick={() => void copy()}
              className="rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
            >
              {copied ? "Copied" : "Copy to notes"}
            </button>
          </div>
          {!quote ? (
            <p className="mt-4 text-sm text-aluminum">
              No marked-up quote in this session yet. Run{" "}
              <Link href="/quote" className="text-ticket">
                quote defense
              </Link>{" "}
              and come back — or use the spec lines as-is.
            </p>
          ) : (
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
              Includes the last quote script
            </p>
          )}
        </div>
        <div className="rounded-sm border border-white/10 p-5 text-sm leading-6 text-aluminum">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Rotor rule</p>
          <p className="mt-2">
            If they say the rotors are done, the only fair sentence is a millimeter reading next to the discard spec.
            &quot;They&apos;re rusty&quot; on the hat is not a thickness measurement.
          </p>
        </div>
        <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5 text-sm leading-6 text-aluminum">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Scanner</p>
          <p className="mt-2">
            Chrome on Android can pair a BLE ELM327 on the OBD desk. iPhone has no Web Bluetooth — type the code from
            any $20 tool. Live RPM lives on the scan bay.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/obd"
              className="inline-flex min-h-11 items-center rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
            >
              Read codes · /obd
            </Link>
            <Link
              href="/scan"
              className="inline-flex min-h-11 items-center rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
            >
              Live PIDs · /scan
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
