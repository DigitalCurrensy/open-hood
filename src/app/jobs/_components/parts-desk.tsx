"use client";

import { useState } from "react";
import { PARTS_ASK, SKU_LANES } from "@/lib/jobs/desks";

const PARTS = ["Brake pad", "Rotor", "Battery", "Filter", "Body panel", "Lamp", "Sensor"] as const;

export function PartsDesk() {
  const [part, setPart] = useState<(typeof PARTS)[number]>("Brake pad");
  const [lane, setLane] = useState<(typeof SKU_LANES)[number]["id"]>("oem");
  const selected = SKU_LANES.find((row) => row.id === lane) ?? SKU_LANES[0];

  const ticket = `${part} · ${selected.title} · VIN last-8 on the line · installer: shop or DIY`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {PARTS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setName(name)}
            className={`rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
              name === part ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {SKU_LANES.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setLane(row.id)}
            className={`rounded-sm border p-4 text-left ${
              row.id === lane ? "border-ticket bg-bay-2" : "border-white/10 bg-bay-2/80"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">{row.id}</p>
            <h3 className="font-display text-2xl uppercase tracking-wide text-fluorescent">{row.title}</h3>
            <p className="mt-2 text-sm leading-6 text-aluminum">{row.useWhen}</p>
          </button>
        ))}
      </div>
      <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide">The counter sentence</h2>
        <p className="mt-2 text-sm leading-6 text-fluorescent">{selected.sayThis}</p>
        <p className="mt-3 border-l-2 border-grease pl-3 text-sm leading-6 text-aluminum">{selected.doNotClaim}</p>
      </article>
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <ol className="space-y-2">
          {PARTS_ASK.map((item, index) => (
            <li key={item.id} className="rounded-sm border border-white/10 bg-bay-2/80 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">
                Ask {String(index + 1).padStart(2, "0")}
              </p>
              <p className="font-display text-xl uppercase tracking-wide text-fluorescent">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-aluminum">{item.detail}</p>
            </li>
          ))}
        </ol>
        <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Ticket line · no live inventory</p>
          <p className="mt-2 font-display text-2xl uppercase leading-none">{ticket}</p>
          <p className="mt-3 text-sm leading-6">
            We do not show dealer stock. Write the SKU conversation. CAPA is a certification, not a warehouse.
          </p>
        </aside>
      </div>
    </div>
  );

  function setName(name: (typeof PARTS)[number]) {
    setPart(name);
    if (name === "Body panel" || name === "Lamp") setLane("capa");
  }
}
