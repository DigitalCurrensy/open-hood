"use client";

import { useMemo, useState } from "react";
import { DIY_CARDS } from "@/lib/jobs/desks";
import { CheckDesk } from "@/app/jobs/_components/check-desk";

export function DiyDesk() {
  const [id, setId] = useState(DIY_CARDS[0].id);
  const card = useMemo(() => DIY_CARDS.find((row) => row.id === id) ?? DIY_CARDS[0], [id]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {DIY_CARDS.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setId(row.id)}
            className={`rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
              row.id === id ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum hover:text-fluorescent"
            }`}
          >
            {row.title}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">{card.timeBand}</p>
          <h2 className="font-display text-3xl uppercase tracking-wide">Tools</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-aluminum">
            {card.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </article>
        <article className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Torque mindset</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">Use a chart. Don&apos;t guess.</h2>
          <p className="mt-3 text-sm leading-6">{card.torqueMindset}</p>
        </article>
      </div>
      <article className="rounded-sm border border-cone/40 bg-bay-2/80 p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide text-cone">Safety</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-aluminum">
          {card.safety.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </article>
      <CheckDesk
        storageKey={`autoshield.jobs.diy.${card.id}`}
        items={card.steps}
        readyLabel="Job card complete — still use the chart"
        blockedLabel="Tick the steps. Torque is not a vibe."
      />
    </div>
  );
}
