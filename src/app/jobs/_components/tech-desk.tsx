"use client";

import { useMemo, useState } from "react";
import { TECH_CUSTOMER_ASKS, TECH_MEASURES } from "@/lib/jobs/desks";

export function TechDesk() {
  const [job, setJob] = useState(TECH_CUSTOMER_ASKS[0].job);
  const [measureId, setMeasureId] = useState(TECH_MEASURES[0].id);
  const [measured, setMeasured] = useState("");
  const [minimum, setMinimum] = useState("");

  const asks = useMemo(() => TECH_CUSTOMER_ASKS.find((row) => row.job === job) ?? TECH_CUSTOMER_ASKS[0], [job]);
  const measure = useMemo(() => TECH_MEASURES.find((row) => row.id === measureId) ?? TECH_MEASURES[0], [measureId]);

  const measuredN = Number.parseFloat(measured);
  const minimumN = Number.parseFloat(minimum);
  const verdict =
    Number.isFinite(measuredN) && Number.isFinite(minimumN)
      ? measuredN >= minimumN
        ? `In spec · ${measuredN} ${measure.unit} vs min ${minimumN}`
        : `Below minimum · ${measuredN} ${measure.unit} / min ${minimumN}`
      : "Type both numbers. We do not invent the book spec.";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide">What they will ask</h2>
        <p className="mt-1 text-sm leading-6 text-aluminum">
          The owner read a script. Answer with a number or a test name — not &quot;these fail a lot on this car.&quot;
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TECH_CUSTOMER_ASKS.map((row) => (
            <button
              key={row.job}
              type="button"
              onClick={() => setJob(row.job)}
              className={`rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
                row.job === job ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum"
              }`}
            >
              {row.job}
            </button>
          ))}
        </div>
        <ol className="mt-4 space-y-3">
          {asks.questions.map((question, index) => (
            <li key={question} className="border-t border-white/10 pt-3 text-sm leading-6 text-fluorescent">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-1 block">{question}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide">Measurement culture</h2>
        <p className="mt-1 text-sm leading-6 text-aluminum">
          Rotors are millimeters. &quot;They&apos;re due&quot; is not a thickness. You bring the book number; we only compare.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TECH_MEASURES.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setMeasureId(row.id)}
              className={`rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
                row.id === measureId ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum"
              }`}
            >
              {row.title}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-aluminum">{measure.hint}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">Measured ({measure.unit})</span>
            <input
              value={measured}
              onChange={(event) => setMeasured(event.target.value)}
              inputMode="decimal"
              className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-fluorescent"
            />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">Book min ({measure.unit})</span>
            <input
              value={minimum}
              onChange={(event) => setMinimum(event.target.value)}
              inputMode="decimal"
              className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-fluorescent"
            />
          </label>
        </div>
        <p className="ticket-paper mt-4 rounded-sm p-4 font-mono text-sm text-ticket-ink">{verdict}</p>
      </section>
    </div>
  );
}
