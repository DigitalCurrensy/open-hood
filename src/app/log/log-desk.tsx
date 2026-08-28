"use client";

import { useReadingLevel } from "@/components/reading-level";
import {
  SERVICE_LOG_PRINTOUT_INSTRUCTION,
  SERVICE_LOG_PRINTOUT_HREF,
  buildServiceLogExport,
  emptyDraft,
  formatCost,
  formatMiles,
  serviceLogFilename,
  type ServiceLogDraft,
  type ServiceLogEntry,
} from "@/lib/service-log";
import { ServiceLogError } from "@/lib/service-log/parse";
import { useServiceLog } from "@/lib/service-log/store";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import "./log.css";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

export function LogDesk() {
  const { entries, add, remove } = useServiceLog();
  const [level] = useReadingLevel();
  const expert = level === "expert";
  const [draft, setDraft] = useState<ServiceLogDraft>(() => emptyDraft());
  const [fault, setFault] = useState("");

  function patch<K extends keyof ServiceLogDraft>(key: K, value: ServiceLogDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (fault) setFault("");
  }

  function onStamp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      add(draft);
      setDraft(emptyDraft());
      setFault("");
    } catch (error) {
      setFault(error instanceof ServiceLogError || error instanceof Error ? error.message : "Could not stamp the line.");
    }
  }

  function onExport() {
    const packet = buildServiceLogExport(entries);
    const blob = new Blob([`${JSON.stringify(packet, null, 2)}\n`], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = serviceLogFilename(packet.exportedAt);
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
      <form className="rounded-sm border border-white/10 bg-bay-2/80 p-5" onSubmit={onStamp}>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
          {expert ? "Expert line" : "Three fields"}
        </p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">Stamp a line</h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          {expert
            ? "RO number and SKUs if they are on the ticket. Shop, cost, and notes if you have them."
            : "Date, miles, and what was done. Switch to Expert for the RO and SKUs."}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Date</span>
            <input
              required
              type="date"
              name="date"
              value={draft.date}
              onChange={(event) => patch("date", event.target.value)}
              className={FIELD}
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Mileage</span>
            <input
              required
              name="mileage"
              inputMode="numeric"
              autoComplete="off"
              value={draft.mileage}
              onChange={(event) => patch("mileage", event.target.value)}
              placeholder="48210"
              className={`${FIELD} log-miles`}
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">What was done</span>
          <textarea
            required
            name="what"
            rows={3}
            value={draft.what}
            onChange={(event) => patch("what", event.target.value)}
            placeholder="Oil + filter, drain-plug washer"
            className={FIELD}
          />
        </label>

        {expert ? (
          <fieldset className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <legend className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">On the RO</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Shop name</span>
                <input
                  name="shop"
                  value={draft.shop}
                  onChange={(event) => patch("shop", event.target.value)}
                  placeholder="Name on the RO"
                  className={FIELD}
                />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Cost</span>
                <input
                  name="cost"
                  inputMode="decimal"
                  value={draft.cost}
                  onChange={(event) => patch("cost", event.target.value)}
                  placeholder="214.50"
                  className={FIELD}
                />
              </label>
            </div>
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">OEM RO#</span>
              <input
                name="oemRo"
                value={draft.oemRo}
                onChange={(event) => patch("oemRo", event.target.value)}
                placeholder="Dealer RO number"
                className={`${FIELD} font-mono`}
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Parts SKUs</span>
              <input
                name="partsSkus"
                value={draft.partsSkus}
                onChange={(event) => patch("partsSkus", event.target.value)}
                placeholder="15400-PLM-A02, 91312-PAA-A01"
                className={`${FIELD} font-mono`}
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Notes</span>
              <textarea
                name="notes"
                rows={2}
                value={draft.notes}
                onChange={(event) => patch("notes", event.target.value)}
                placeholder="Next interval in miles, not months"
                className={FIELD}
              />
            </label>
          </fieldset>
        ) : null}

        {fault ? (
          <p role="alert" className="mt-3 text-sm leading-6 text-cone">
            {fault}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-4 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Stamp the line
        </button>
      </form>

      <div className="space-y-4">
        <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Include in printout</p>
          <h3 className="mt-1 font-display text-3xl uppercase leading-none">Customer copy</h3>
          <p className="mt-3 text-sm leading-6">{SERVICE_LOG_PRINTOUT_INSTRUCTION}</p>
          <Link
            href={SERVICE_LOG_PRINTOUT_HREF}
            className="mt-4 inline-block rounded-sm bg-ticket-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
          >
            Open Findings
          </Link>
        </aside>

        <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5" aria-labelledby="log-on-device">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">On this device</p>
              <h3 id="log-on-device" className="font-display text-2xl uppercase tracking-wide">
                The book
              </h3>
              <p aria-live="polite" className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
                {entries.length === 0
                  ? "No lines yet"
                  : `${entries.length} ${entries.length === 1 ? "line" : "lines"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onExport}
              disabled={entries.length === 0}
              className="rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export JSON
            </button>
          </div>

          {entries.length === 0 ? (
            <p className="mt-5 text-sm leading-6 text-aluminum">
              Date, miles, and what was done — then stamp it. This desk does not invent a history.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {entries.map((entry) => (
                <LogLine key={entry.id} entry={entry} onScratch={() => remove(entry.id)} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function LogLine({ entry, onScratch }: { entry: ServiceLogEntry; onScratch: () => void }) {
  const extras = [
    entry.shop,
    entry.cost ? formatCost(entry.cost) : "",
    entry.oemRo ? `RO ${entry.oemRo}` : "",
    entry.partsSkus?.length ? entry.partsSkus.join(" · ") : "",
  ].filter(Boolean);

  return (
    <li className="log-line flex flex-col gap-3 rounded-sm border border-white/10 p-3 sm:flex-row sm:items-stretch">
      <div className="log-stub flex shrink-0 flex-col justify-between rounded-sm px-3 py-2 text-ticket-ink sm:w-36">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Date</span>
        <span className="font-mono text-sm">{entry.date}</span>
        <span className="log-miles mt-2 font-mono text-xs">{formatMiles(entry.mileage)} mi</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-fluorescent">{entry.what}</p>
        {extras.length ? (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-aluminum">{extras.join(" · ")}</p>
        ) : null}
        {entry.notes ? <p className="mt-1 text-sm leading-6 text-aluminum">{entry.notes}</p> : null}
      </div>
      <button
        type="button"
        onClick={onScratch}
        aria-label={`Scratch ${entry.date} ${entry.what}`}
        className="self-start font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:text-cone sm:self-center"
      >
        Scratch
      </button>
    </li>
  );
}
