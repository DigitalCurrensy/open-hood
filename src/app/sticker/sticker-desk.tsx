"use client";

import { IdentifyPacket } from "@/app/sticker/identify-packet";
import { STICKER_DISCLAIMER, STICKER_NEXT_DESKS } from "@/config/nav/sticker";
import { chromeData } from "@/lib/chrome-data";
import { buildIdentificationPacket, factoryFacts, type IdentificationPacket } from "@/lib/nhtsa";
import type { IdentifiedVehicle } from "@/lib/types";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import { inspectVinCheckDigit, DEMO_VINS, isValidVin, normalizeVin, VIN_CHECK_DIGIT_INDEX } from "@/lib/vin";
import Link from "next/link";
import { useMemo, useState } from "react";
import "./sticker.css";

export function StickerDesk({
  initialVin = "",
  seeded = null,
  seededPacket = null,
}: {
  initialVin?: string;
  seeded?: IdentifiedVehicle | null;
  seededPacket?: IdentificationPacket | null;
}) {
  const [vehicle, setVehicle] = useIdentifiedVehicle();
  const [busy, setBusy] = useState(false);
  const [fault, setFault] = useState("");
  const [fresh, setFresh] = useState<IdentifiedVehicle | null>(seeded);
  const [packet, setPacket] = useState<IdentificationPacket | null>(seededPacket);

  const vin = normalizeVin(initialVin || fresh?.specs.vin || vehicle?.specs.vin || "");
  const shown = fresh ?? vehicle;
  const facts = useMemo(() => (shown ? factoryFacts(shown.specs) : []), [shown]);
  const livePacket = packet ?? (shown ? buildIdentificationPacket(shown.specs, shown.recalls) : null);

  async function pull(raw: string) {
    const next = normalizeVin(raw);
    if (!isValidVin(next)) {
      setFault("Need a 17-character VIN on the bay. Letters I, O, and Q are never used.");
      return;
    }
    setBusy(true);
    setFault("");
    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: next,
          plate: vehicle?.specs.plate ?? "",
          plateState: vehicle?.specs.plateState ?? "",
          mileage: vehicle?.specs.mileage ?? "",
          concern: vehicle?.specs.concern ?? "",
        }),
      });
      const body = (await response.json()) as IdentifiedVehicle & { error?: string };
      if (!response.ok) throw new Error(body.error || "Decode failed");
      setFresh(body);
      setVehicle(body);
      const ymm = new URLSearchParams({
        year: body.specs.year,
        make: body.specs.make,
        model: body.specs.model,
        vin: body.specs.vin,
      });
      const safer = (await fetch(`/api/expert/safercar?${ymm.toString()}`, { cache: "no-store" })
        .then((res) => res.json())
        .catch(() => null)) as {
        complaints?: IdentificationPacket["complaints"];
        campaignSource?: IdentificationPacket["campaignSource"];
        vendorFile?: boolean;
        stamp?: string;
        stillNotVinTrue?: string;
      } | null;
      const vendorFile = safer?.campaignSource === "vendor" || safer?.vendorFile === true;
      setPacket(
        buildIdentificationPacket(
          body.specs,
          body.recalls,
          safer && typeof safer.complaints?.count === "number" ? safer.complaints : null,
          safer
            ? {
                campaignSource: vendorFile ? "vendor" : "ymm",
                stamp: safer.stamp,
                stillNotVinTrue: safer.stillNotVinTrue,
                vendorFile,
              }
            : undefined,
        ),
      );
    } catch (error) {
      setFault(error instanceof Error ? error.message : "NHTSA did not return a sticker.");
    } finally {
      setBusy(false);
    }
  }

  const headline = shown
    ? [shown.specs.year, shown.specs.make, shown.specs.model, shown.specs.trim || shown.specs.series]
        .filter(Boolean)
        .join(" ")
    : "No VIN on the glass";
  const cells = (shown?.specs.vin || vin || "").padEnd(17, " ").slice(0, 17).split("");
  const checkDigit = inspectVinCheckDigit(shown?.specs.vin || vin);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="sticker-glass rounded-sm p-5">
        <div className="sticker-perforation -mx-5 -mt-5 mb-4" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-black/45">
              Window sticker from decoder
            </p>
            <h2 className="mt-1 font-display text-4xl uppercase leading-none">{headline}</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="sticker-not-monroney rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-grease">
              Not a Monroney
            </p>
            {chromeData.connected ? null : (
              <p className="sticker-not-monroney rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-grease">
                Not Chrome Data
              </p>
            )}
          </div>
        </div>

        <div className="sticker-vin-cells mt-4 font-mono text-[11px] sm:text-sm">
          {cells.map((char, index) => (
            <span
              key={`${char}-${index}`}
              className={
                index === VIN_CHECK_DIGIT_INDEX
                  ? "sticker-vin-cell sticker-vin-check"
                  : "sticker-vin-cell"
              }
              title={index === VIN_CHECK_DIGIT_INDEX ? "ISO 3779 check digit" : undefined}
            >
              {char.trim() || "·"}
            </span>
          ))}
        </div>
        {checkDigit.stamp ? (
          <p className={`mt-3 text-sm leading-6 ${checkDigit.ok ? "text-black/70" : "text-grease"}`}>{checkDigit.stamp}</p>
        ) : null}

        <p className="mt-3 text-sm leading-6 text-black/70">{STICKER_DISCLAIMER}</p>

        {busy ? (
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-black/50">Pulling vPIC…</p>
        ) : null}
        {fault ? <p className="mt-4 text-sm text-grease">{fault}</p> : null}

        {facts.length ? (
          <dl className="mt-5 grid gap-x-4 gap-y-3 sm:grid-cols-2">
            {facts.map((row) => (
              <div key={row.id} className="sticker-fact min-w-0 border-t border-black/10 pt-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">{row.label}</dt>
                <dd className="mt-1 text-sm font-semibold leading-5">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-6 max-w-md text-sm leading-6 text-black/70">
            Stamp a VIN on the bay. Year / make / model is not a window sticker — vPIC needs the 17.
          </p>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Session VIN</p>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {vin
              ? "This sheet is the live DecodeVinValues row for the car on the bay."
              : "No car in session. Use a known VIN or go stamp one."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {isValidVin(vin) ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void pull(vin)}
                className="rounded-sm bg-ticket px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
              >
                {busy ? "Decoding…" : "Refresh from vPIC"}
              </button>
            ) : null}
            {DEMO_VINS.map((demo) => (
              <Link
                key={demo.vin}
                href={`/sticker?vin=${demo.vin}`}
                className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[11px] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
              >
                {demo.label}
              </Link>
            ))}
            <Link
              href="/"
              className="rounded-sm border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent"
            >
              Stamp a VIN
            </Link>
          </div>
        </div>
        <nav aria-label="Next desks" className="flex flex-wrap gap-2">
          {STICKER_NEXT_DESKS.map((desk) => (
            <Link
              key={desk.href}
              href={desk.href}
              className="rounded-sm border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
            >
              {desk.stamp} · {desk.label}
            </Link>
          ))}
        </nav>
      </aside>
      {livePacket ? (
        <div className="lg:col-span-2">
          <IdentifyPacket packet={livePacket} />
        </div>
      ) : null}
    </div>
  );
}
