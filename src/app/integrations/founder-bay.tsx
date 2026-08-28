"use client";

import { useState } from "react";
import type { FounderLane, FounderRow } from "@/app/integrations/bay-types";

const LANE_LABEL: Record<FounderLane, string> = {
  wired: "Live when set",
  paper: "Paper / ROADMAP",
  stripe: "Stripe",
  site: "Site",
};

export function FounderBay({ rows }: { rows: FounderRow[] }) {
  const [copied, setCopied] = useState("");

  async function copy(env: string) {
    const line = `${env}=`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(env);
    } catch {
      setCopied("");
    }
  }

  return (
    <section className="int-punch rounded-sm border border-white/10 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Founder bay · env names</p>
      <p className="mt-1 text-sm leading-6 text-aluminum">
        Copy the name. Paste into <span className="font-mono text-fluorescent">.env</span>. Weekend keys go{" "}
        <span className="font-mono text-fluorescent">configured:true</span> only with a real key. Paper keys stay empty
        without a contract. Stripe live needs a Price ID we already have — escrow stays refused.
      </p>
      <ul className="mt-3 grid gap-2 lg:grid-cols-2">
        {rows.map((row) => (
          <li
            key={row.env}
            className="flex items-start justify-between gap-3 rounded-sm border border-white/10 bg-bay/50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cone">
                {LANE_LABEL[row.lane]}
                {row.weekend ? " · weekend" : ""}
                {" · configured:"}
                {String(row.configured)}
                {row.keyPresent ? " · present" : " · empty"}
              </p>
              <p className="mt-0.5 break-all font-mono text-sm text-fluorescent">{row.env}</p>
              <p className="mt-1 text-xs leading-5 text-aluminum">{row.unlocks}</p>
            </div>
            <button
              type="button"
              onClick={() => void copy(row.env)}
              className="shrink-0 rounded-sm border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ticket hover:border-ticket/60"
            >
              {copied === row.env ? "Copied" : "Copy"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
