"use client";

import { useState } from "react";
import { ADVISOR_LINES } from "@/lib/jobs/desks";
import { GlossaryDesk } from "@/app/jobs/_components/glossary-desk";

export function AdvisorDesk() {
  const [id, setId] = useState(ADVISOR_LINES[0].id);
  const line = ADVISOR_LINES.find((row) => row.id === id) ?? ADVISOR_LINES[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-2">
          {ADVISOR_LINES.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setId(row.id)}
              className={`block w-full rounded-sm px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.16em] ${
                row.id === id ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum"
              }`}
            >
              {row.writerSays}
            </button>
          ))}
        </div>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Owner hears</p>
          <p className="mt-1 text-sm leading-6 text-aluminum">{line.ownerHears}</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ticket">Say this instead</p>
          <p className="mt-1 font-display text-2xl uppercase leading-none text-fluorescent">{line.better}</p>
        </article>
      </section>
      <GlossaryDesk kicker="Decode the line you just wrote" />
    </div>
  );
}
