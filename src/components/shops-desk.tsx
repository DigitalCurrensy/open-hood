"use client";

import { useState } from "react";
import { mapsShopUrl, SHOP_JOBS, SHOP_QUESTIONS } from "@/lib/shops";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function ShopsDesk() {
  const [vehicle] = useIdentifiedVehicle();
  const [zip, setZip] = useState("");
  const [job, setJob] = useState<(typeof SHOP_JOBS)[number]["id"]>("independent");
  const [url, setUrl] = useState("");
  const make = vehicle?.specs.make;

  function openSearch() {
    const next = mapsShopUrl(zip, job, make);
    setUrl(next);
    window.open(next, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          openSearch();
        }}
      >
        <h2 className="font-display text-2xl uppercase tracking-wide">Maps search — not a marketplace</h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          RepairPal, Openbay, and YourMechanic book shops and take a cut. We do not. This button opens Google Maps with
          a search you could have typed yourself. We do not certify anyone.
        </p>
        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">ZIP or city</span>
          <input
            value={zip}
            onChange={(event) => setZip(event.target.value)}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="97214"
            className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>
        <fieldset className="mt-4">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">What you need</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SHOP_JOBS.map((option) => (
              <label
                key={option.id}
                className={`cursor-pointer rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
                  job === option.id ? "border-ticket bg-ticket text-ticket-ink" : "border-white/10 text-aluminum"
                }`}
              >
                <input
                  type="radio"
                  name="job"
                  className="sr-only"
                  checked={job === option.id}
                  onChange={() => setJob(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        {make ? (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
            Search will mention {make}
          </p>
        ) : null}
        <button
          type="submit"
          className="mt-5 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Open Maps search
        </button>
        {url ? (
          <p className="mt-3 break-all font-mono text-[11px] text-aluminum">
            Last search:{" "}
            <a href={url} className="text-ticket" rel="noreferrer">
              {url}
            </a>
          </p>
        ) : (
          <p className="mt-3 text-sm text-aluminum">Enter a ZIP and we will build the Maps URL in front of you.</p>
        )}
      </form>

      <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Call script · before you book</p>
        <ol className="mt-4 list-decimal space-y-3 pl-4 text-sm leading-6">
          {SHOP_QUESTIONS.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
