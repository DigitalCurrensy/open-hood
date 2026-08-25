"use client";

import { useMemo, useState } from "react";
import { SAMPLE_JOB_DTCS, lookupJobDtc } from "@/lib/jobs/dtc";
import { DTC_COUNT } from "@/lib/jobs/dtc-dictionary";

export function JobsObdDesk({ initialCode = "" }: { initialCode?: string }) {
  const [raw, setRaw] = useState(initialCode.toUpperCase());
  const [submitted, setSubmitted] = useState(initialCode.toUpperCase());

  const result = useMemo(() => (submitted ? lookupJobDtc(submitted) : null), [submitted]);

  function run(code: string) {
    const next = code.toUpperCase();
    setRaw(next);
    setSubmitted(next);
  }

  return (
    <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          run(raw);
        }}
      >
        <h2 className="font-display text-2xl uppercase tracking-wide">Type the scanner code</h2>
        <p className="mt-1 text-sm leading-6 text-aluminum">
          P, B, C, or U plus four characters. No dongle. {DTC_COUNT} common codes in this book. The light is a pointer,
          not a parts catalog.
        </p>
        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">DTC</span>
          <input
            value={raw}
            onChange={(event) => setRaw(event.target.value.toUpperCase())}
            spellCheck={false}
            autoCapitalize="characters"
            autoComplete="off"
            placeholder="P0420"
            maxLength={8}
            className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-lg uppercase tracking-[0.2em] text-fluorescent placeholder:text-aluminum/40"
          />
        </label>
        <button
          type="submit"
          className="mt-4 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Translate this code
        </button>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="self-center font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">Try</span>
          {SAMPLE_JOB_DTCS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => run(code)}
              className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[11px] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
            >
              {code}
            </button>
          ))}
        </div>
      </form>

      <div>
        {!result ? (
          <div className="ticket-paper flex min-h-[18rem] flex-col justify-between rounded-sm p-5 text-ticket-ink">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Scanner copy · do not throw parts</p>
            <p className="max-w-sm text-sm leading-6">
              P0420 is not automatically a catalytic converter. P0300 is a misfire pattern, not a coil four-pack. Type
              what the $20 tool printed.
            </p>
          </div>
        ) : result.error ? (
          <div className="rounded-sm border border-cone/40 bg-bay-2/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Could not read that</p>
            <p className="mt-2 text-sm leading-6 text-aluminum">{result.error}</p>
          </div>
        ) : (
          <article className="space-y-4 rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">{result.code}</p>
              <h3 className="font-display text-3xl uppercase tracking-wide text-fluorescent">
                {result.entry?.title ?? "Not in our book yet — family still applies"}
              </h3>
              {result.entry ? (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
                  {result.entry.severity}
                </p>
              ) : null}
            </div>
            {result.entry ? (
              <>
                <p className="text-sm leading-6 text-aluminum">{result.entry.layperson}</p>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Likely systems</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {result.entry.likelySystems.map((system) => (
                      <li
                        key={system}
                        className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-fluorescent"
                      >
                        {system}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="border-l-2 border-grease pl-3 text-sm leading-6 text-fluorescent">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cone">Do not throw parts · </span>
                  {result.entry.doNotThrowParts}
                </p>
                <p className="text-sm leading-6 text-aluminum">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">First look · </span>
                  {result.entry.firstLook}
                </p>
              </>
            ) : null}
            {result.generic ? (
              <div className="border-t border-white/10 pt-3 text-sm leading-6 text-aluminum">
                <p>
                  {result.generic.system}. Subsystem looks like {result.generic.subsystem}.{" "}
                  {result.generic.generic ? "Generic (SAE) code." : "Manufacturer-specific code."} {result.generic.hint}
                </p>
                {!result.entry ? (
                  <p className="mt-2 border-l-2 border-grease pl-3 text-fluorescent">{result.generic.doNotThrowParts}</p>
                ) : null}
              </div>
            ) : null}
          </article>
        )}
      </div>
    </div>
  );
}
