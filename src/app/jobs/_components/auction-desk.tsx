"use client";

import { useMemo, useState } from "react";
import { AUCTION_GOTCHAS } from "@/lib/jobs/checklists";
import { CheckDesk } from "@/app/jobs/_components/check-desk";

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function AuctionDesk() {
  const [lane, setLane] = useState<"public" | "dealer">("public");
  const [hammer, setHammer] = useState("4200");
  const [feePct, setFeePct] = useState(lane === "public" ? "12" : "6");
  const [gate, setGate] = useState("79");
  const [title, setTitle] = useState("85");
  const [transport, setTransport] = useState("350");

  const landed = useMemo(() => {
    const h = Number(hammer) || 0;
    const fee = h * ((Number(feePct) || 0) / 100);
    const extras = (Number(gate) || 0) + (Number(title) || 0) + (Number(transport) || 0);
    return { fee, extras, total: h + fee + extras };
  }, [hammer, feePct, gate, title, transport]);

  function pickLane(next: "public" | "dealer") {
    setLane(next);
    setFeePct(next === "public" ? "12" : "6");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <h2 className="font-display text-2xl uppercase tracking-wide">What the lane means</h2>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => pickLane("public")}
              className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
                lane === "public" ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum"
              }`}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => pickLane("dealer")}
              className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
                lane === "dealer" ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum"
              }`}
            >
              Dealer
            </button>
          </div>
          {lane === "public" ? (
            <p className="mt-3 text-sm leading-6 text-aluminum">
              Anyone with a paddle. As-is is the default. Buyer premium is often higher. Arbitration is thin or gone.
              Title delays are common. You are not looking at a dealer pack.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-aluminum">
              Licensed dealers. Run numbers, condition reports, and a short arbitration clock on some announcements.
              Still not a warranty. Still not live inventory on this site.
            </p>
          )}
        </article>
        <form className="rounded-sm border border-white/10 bg-bay-2/80 p-5" onSubmit={(event) => event.preventDefault()}>
          <h2 className="font-display text-2xl uppercase tracking-wide">Landed cost</h2>
          <p className="mt-1 text-sm leading-6 text-aluminum">
            Typical ranges, not this week&apos;s sale. Hammer is not what you pay at the gate.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Num label="Hammer $" value={hammer} onChange={setHammer} />
            <Num label="Buyer fee %" value={feePct} onChange={setFeePct} />
            <Num label="Gate / doc $" value={gate} onChange={setGate} />
            <Num label="Title $" value={title} onChange={setTitle} />
            <Num label="Transport $" value={transport} onChange={setTransport} />
          </div>
          <p className="ticket-paper mt-4 rounded-sm p-4 font-mono text-sm text-ticket-ink">
            Fee {money(landed.fee)} · extras {money(landed.extras)} · landed {money(landed.total)}
          </p>
        </form>
      </div>
      <CheckDesk
        storageKey="openhood.jobs.auction"
        items={AUCTION_GOTCHAS}
        readyLabel="You know the clock and the paper"
        blockedLabel="Don't bid until the gotchas are ticked"
      />
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-fluorescent"
      />
    </label>
  );
}
