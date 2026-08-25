"use client";

import { useMemo, useState } from "react";
import { FLEET_LINES } from "@/lib/jobs/desks";

export function FleetDesk() {
  const [id, setId] = useState(FLEET_LINES[0].id);
  const [decision, setDecision] = useState<"interval" | "defer" | "measure">("measure");
  const line = useMemo(() => FLEET_LINES.find((row) => row.id === id) ?? FLEET_LINES[0], [id]);

  const stamp =
    decision === "interval"
      ? "Approve the interval page. Decline the menu extras unless they showed the part."
      : decision === "defer"
        ? "Defer the upsell. Put a date on the next review. Do not argue adjectives."
        : "Show me the measurement or the interval page. Then I stamp it.";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {FLEET_LINES.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setId(row.id)}
            className={`rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
              row.id === id ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum"
            }`}
          >
            {row.title}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ticket">Interval</p>
          <p className="mt-2 text-sm leading-6 text-aluminum">{line.interval}</p>
        </article>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Common upsell</p>
          <p className="mt-2 text-sm leading-6 text-aluminum">{line.upsell}</p>
        </article>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fluorescent">Ask for</p>
          <p className="mt-2 text-sm leading-6 text-aluminum">{line.askFor}</p>
        </article>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["measure", "Request the number"],
            ["interval", "Approve interval"],
            ["defer", "Defer upsell"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setDecision(key)}
            className={`rounded-sm px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] ${
              decision === key ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="ticket-paper rounded-sm p-5 font-display text-2xl uppercase leading-none text-ticket-ink">{stamp}</p>
    </div>
  );
}
