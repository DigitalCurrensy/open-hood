"use client";

import { COMPARE_DEMO, COMPARE_SLOTS, compareThreeRos, type CompareSlotId } from "@/app/book/_components/compare-ros";
import { BayLink } from "@/components/bay-link";
import { emptyVehicleSpecs } from "@/lib/nhtsa";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import { useMemo, useState } from "react";
import "./compare-ticket.css";

const EMPTY: Record<CompareSlotId, string> = { a: "", b: "", c: "" };
const FALLBACK_SPECS = emptyVehicleSpecs();
const EMPTY_FLAGS = [
  ["Flush / menu", "A packed service menu is a flag, not a part you buy here."],
  ["Shop supplies", "Percentage pads get circled. We do not pick a winner."],
  ["No SKU cart", "Flags only. No checkout. No book-this-shop."],
] as const;

function money(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function CompareTicket() {
  const [vehicle] = useIdentifiedVehicle();
  const [pastes, setPastes] = useState(EMPTY);
  const [zip, setZip] = useState("");
  const [marked, setMarked] = useState(false);
  const zipValue = zip.replace(/\D/g, "").slice(0, 5);
  const specs = vehicle?.specs ?? FALLBACK_SPECS;
  const car = [specs.year, specs.make, specs.model].filter(Boolean).join(" ") || "This car — identify first if you have the VIN";

  const board = useMemo(
    () => (marked ? compareThreeRos(pastes, specs, zipValue) : null),
    [marked, pastes, specs, zipValue],
  );

  function patch(id: CompareSlotId, value: string) {
    setPastes((current) => ({ ...current, [id]: value }));
    setMarked(false);
  }

  return (
    <section id="compare-3" className="compare-carbon compare-stack space-y-4 rounded-sm border border-white/10 p-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Three tickets · one flag board</p>
        <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-fluorescent">Paste / paste / paste</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          Three ROs on one carbon. We grease-pencil flags. We do not pick a winner, book a bay, or sell a SKU. Typical-hour
          book — not Motor. Empty board waits for three pastes. A cart would erase the job.
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">{car}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {COMPARE_SLOTS.map((slot) => (
          <label key={slot.id} className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">{slot.stamp}</span>
            <textarea
              value={pastes[slot.id]}
              onChange={(event) => patch(slot.id, event.target.value)}
              rows={7}
              placeholder={`${slot.shop} line items\nCabin air filter $85\nShop supplies 8%`}
              className="mt-1.5 min-h-11 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block max-w-[8rem]">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">Shop ZIP</span>
          <input
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={zip}
            onChange={(event) => {
              setZip(event.target.value.replace(/\D/g, "").slice(0, 5));
              setMarked(false);
            }}
            placeholder="ZIP"
            className="mt-1.5 min-h-11 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>
        <button
          type="button"
          onClick={() => setMarked(true)}
          className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Mark the three
        </button>
        <button
          type="button"
          onClick={() => {
            setPastes(COMPARE_DEMO);
            setZip("90210");
            setMarked(false);
          }}
          className="min-h-11 rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
        >
          Load three demos
        </button>
      </div>

      {!board ? (
        <div className="space-y-4">
          <div className="compare-perforation opacity-50" />
          <ul className="grid gap-3 lg:grid-cols-3">
            {COMPARE_SLOTS.map((slot) => (
              <li key={slot.id} className="rounded-sm border border-dashed border-white/15 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum-dim">{slot.stamp}</p>
                <h3 className="mt-2 font-display text-2xl uppercase leading-none text-fluorescent">Empty paste</h3>
                <p className="mt-2 text-sm leading-6 text-aluminum">
                  Drop {slot.shop} line items here. Flags need three tickets — or one honest paste and two blanks.
                </p>
              </li>
            ))}
          </ul>
          <ul className="grid gap-3 lg:grid-cols-3">
            {EMPTY_FLAGS.map(([stamp, line]) => (
              <li key={stamp} className="ticket-paper rounded-sm p-4 text-ticket-ink">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em]">{stamp}</p>
                <p className="mt-2 text-sm leading-6">{line}</p>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
            No buy · no cart · no book-this-shop · ZIP is a band only if you type one
          </p>
        </div>
      ) : null}

      {board ? (
        <div className="space-y-4">
          <div className="compare-perforation opacity-50" />
          {board.filled.length ? (
            <ul className="grid gap-3 lg:grid-cols-3">
              {board.rows.map((row) => {
                const result = row.result;
                if (!result) {
                  return (
                    <li key={row.id} className="rounded-sm border border-dashed border-white/15 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum-dim">{row.stamp}</p>
                      <p className="mt-2 text-sm leading-6 text-aluminum">Empty paste. Flags need line items.</p>
                    </li>
                  );
                }
                const heavy = board.heaviest === row.id && board.filled.length > 1;
                return (
                  <li
                    key={row.id}
                    data-heavy={heavy || undefined}
                    className="compare-copy ticket-paper rounded-sm p-4 text-ticket-ink"
                  >
                    {heavy ? <span className="compare-ring">Heaviest</span> : null}
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em]">{row.stamp}</p>
                    <h3 className="mt-1 font-display text-2xl uppercase leading-none">
                      {result.isQuoteFair ? "Mostly fair" : "Do not authorize yet"}
                    </h3>
                    <p className="mt-2 font-mono text-sm">{money(result.totalQuoted)}</p>
                    <p className="mt-2 text-sm leading-5">{result.summary}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
                      {result.book.hits} book hit · {result.book.misses} miss
                      {row.packed ? " · packed menu" : ""}
                    </p>
                    {result.flags.length ? (
                      <ul className="mt-3 space-y-1">
                        {result.flags.map((flag) => (
                          <li key={flag.id} className="font-mono text-[11px] uppercase tracking-[0.12em]">
                            {flag.severity} · {flag.title}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm">No classic upsell stamp. Still ask for OEM numbers.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-aluminum">
              Paste at least one RO. Three is the job. Flags, not a buy button.
            </p>
          )}

          {board.spread ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
              Spread {money(board.spread.low)} – {money(board.spread.high)} · Δ {money(board.spread.delta)} · not a buy
              button
            </p>
          ) : null}

          <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Authorization hold</p>
            <h3 className="mt-1 font-display text-3xl uppercase leading-none">{board.holdUntil}</h3>
            <p className="mt-3 text-sm leading-6">
              A hold on this bay is a sentence, not a shop deposit. The honesty ledger and DEMO hold live on Trust. We
              do not take a card here.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em]">
              <BayLink href="/trust#hold" className="underline">
                Open /trust · hold
              </BayLink>
              {" · "}
              <BayLink href="/directory" className="underline">
                OSM rooftops — no book
              </BayLink>
              {" · "}
              <BayLink href="/jobs/owner" className="underline">
                Owner script
              </BayLink>
            </p>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
