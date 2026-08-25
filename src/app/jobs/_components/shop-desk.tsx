"use client";

import { useMemo, useState } from "react";
import { SHOP_NORMS } from "@/lib/jobs/checklists";
import { CheckDesk } from "@/app/jobs/_components/check-desk";

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function ShopDesk() {
  const [hours, setHours] = useState("1.5");
  const [rate, setRate] = useState("165");
  const [parts, setParts] = useState("220");
  const [suppliesPct, setSuppliesPct] = useState("8");
  const [diag, setDiag] = useState("140");

  const numbers = useMemo(() => {
    const labor = (Number(hours) || 0) * (Number(rate) || 0);
    const partsN = Number(parts) || 0;
    const diagN = Number(diag) || 0;
    const supplies = labor * ((Number(suppliesPct) || 0) / 100);
    const preTax = labor + partsN + supplies + diagN;
    return { labor, partsN, diagN, supplies, preTax };
  }, [hours, rate, parts, suppliesPct, diag]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <form className="rounded-sm border border-white/10 bg-bay-2/80 p-5" onSubmit={(event) => event.preventDefault()}>
          <h2 className="font-display text-2xl uppercase tracking-wide">Estimate skeleton</h2>
          <p className="mt-1 text-sm leading-6 text-aluminum">
            Diagnosis is a line. Supplies are disclosed. This is not a labor-time book — you type the hours you will
            stand behind.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Num label="Diag $" value={diag} onChange={setDiag} />
            <Num label="Repair hours" value={hours} onChange={setHours} />
            <Num label="Door rate" value={rate} onChange={setRate} />
            <Num label="Parts $" value={parts} onChange={setParts} />
            <Num label="Supplies %" value={suppliesPct} onChange={setSuppliesPct} />
          </div>
        </form>
        <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Written estimate · pre-tax</p>
          <dl className="mt-3 space-y-1 font-mono text-sm">
            <Row k="Diagnosis" v={money(numbers.diagN)} />
            <Row k="Labor" v={money(numbers.labor)} />
            <Row k="Parts" v={money(numbers.partsN)} />
            <Row k="Supplies (disclosed)" v={money(numbers.supplies)} />
            <Row k="Authorize up to" v={money(numbers.preTax)} />
          </dl>
          <p className="mt-4 text-sm leading-6">Call before extras. Measurements on the ticket. Old parts in the trunk.</p>
        </aside>
      </div>
      <CheckDesk
        storageKey="autoshield.jobs.shop"
        items={SHOP_NORMS}
        readyLabel="Fair shop — the ticket can be read out loud"
        blockedLabel="Norms still open. Don't hand them a surprise total."
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-t border-black/10 pt-1">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
