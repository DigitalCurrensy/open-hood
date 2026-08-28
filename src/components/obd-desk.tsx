"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ElmBay } from "@/components/elm-bay";
import { dtcSayThis, lookupDtc, SAMPLE_DTCS } from "@/lib/dtc";
import { quoteFromDtcHref } from "@/lib/obd";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function ObdDesk({ initialCode = "" }: { initialCode?: string }) {
  const [vehicle] = useIdentifiedVehicle();
  const [raw, setRaw] = useState(initialCode.toUpperCase());
  const [submitted, setSubmitted] = useState(initialCode.toUpperCase());

  const result = useMemo(
    () => (submitted ? lookupDtc(submitted, vehicle?.recalls ?? []) : null),
    [submitted, vehicle],
  );

  function run(code: string) {
    const next = code.toUpperCase();
    setRaw(next);
    setSubmitted(next);
  }

  return (
    <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <ElmBay onCodes={(codes) => run(codes[0] ?? "")} />

        <form
          className="desk-tap rounded-sm border border-white/10 bg-bay-2/80 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            run(raw);
          }}
        >
          <h2 className="font-display text-2xl uppercase tracking-wide">Type the code</h2>
          <p className="mt-1 text-sm leading-6 text-aluminum">
            iOS Safari has no Web Bluetooth — type the code from any $20 scanner, or use TestFlight native.
            Android Chrome can pull Mode 03 above. Same dictionary either way — we do not invent the diagnosis.
          </p>
          <label className="mt-4 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">DTC from the scanner</span>
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
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
            >
              Translate this code
            </button>
            {submitted ? (
              <Link
                href={quoteFromDtcHref(submitted)}
                className="inline-flex min-h-11 items-center rounded-sm border border-ticket/50 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-ticket"
              >
                Type to quote
              </Link>
            ) : (
              <Link
                href="/quote"
                className="inline-flex min-h-11 items-center rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
              >
                Quote defense
              </Link>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="self-center font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">
              Common codes
            </span>
            {SAMPLE_DTCS.map((code) => (
              <Link
                key={code}
                href={`/obd/${code}`}
                className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[11px] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
              >
                {code}
              </Link>
            ))}
          </div>
          {vehicle ? (
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
              Cross-checking recalls on {vehicle.specs.year} {vehicle.specs.make} {vehicle.specs.model}
            </p>
          ) : (
            <p className="mt-4 text-sm text-aluminum">
              Identify a VIN on the{" "}
              <Link href="/" className="text-ticket">
                bay
              </Link>{" "}
              to overlay open campaigns on this code.
            </p>
          )}
        </form>
      </div>

      <div>
        {!result ? (
          <div className="ticket-paper flex min-h-[18rem] flex-col justify-between rounded-sm p-5 text-ticket-ink">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Scanner copy · customer</p>
            <p className="max-w-sm text-sm leading-6">
              The light is a pointer, not a parts list. P0420 is not automatically a catalytic converter. P0300 is a
              misfire pattern, not a coil pack by default.
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
                {result.entry?.title ?? "No paragraph in our book yet"}
              </h3>
              {result.entry ? (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
                  {result.entry.severity} · typical {result.entry.costBand}
                </p>
              ) : null}
            </div>
            {result.entry ? (
              <>
                <p className="text-sm leading-6 text-aluminum">{result.entry.plainEnglish}</p>
                <p className="text-sm leading-6 text-fluorescent">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Usual first look · </span>
                  {result.entry.typicalCause}
                </p>
                <p className="border-l-2 border-ticket pl-3 text-sm leading-6">{result.entry.askTheShop}</p>
                <blockquote className="ticket-paper rounded-sm p-4 text-ticket-ink">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Say this</p>
                  <p className="mt-2 text-sm leading-6">{dtcSayThis(result.code, result.entry.askTheShop)}</p>
                </blockquote>
                <p className="font-mono text-[11px] uppercase tracking-wide text-aluminum">
                  {result.entry.diySafe
                    ? "Safe to look at in the driveway (cap, boot, connector)"
                    : "Not a driveway parts-cannon — pay for the test"}
                </p>
              </>
            ) : null}
            {result.generic ? (
              <div className="border-t border-white/10 pt-3 text-sm leading-6 text-aluminum">
                <p>
                  SAE layout: {result.generic.system}. Subsystem looks like {result.generic.subsystem}.{" "}
                  {result.generic.generic ? "Generic (SAE) code." : "Manufacturer-specific code."}
                </p>
                <p className="mt-1">{result.generic.hint}</p>
              </div>
            ) : null}
            {result.relatedRecalls.length > 0 ? (
              <div className="border-t border-white/10 pt-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">
                  Related campaigns on this VIN
                </p>
                <ul className="mt-2 space-y-2">
                  {result.relatedRecalls.slice(0, 3).map((recall) => (
                    <li key={recall.campaignNumber}>
                      <Link href="/recalls" className="text-sm text-ticket hover:underline">
                        {recall.campaignNumber} · {recall.component}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="border-t border-white/10 pt-3">
              <Link
                href={quoteFromDtcHref(result.code)}
                className="inline-flex min-h-11 items-center rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
              >
                Take {result.code} to quote defense
              </Link>
              <p className="mt-2 text-sm leading-6 text-aluminum">
                Paste the RO. Circle the line they hung on this pointer. The code is not a parts list.
              </p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
