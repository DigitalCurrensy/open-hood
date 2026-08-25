"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PhotoIntake } from "@/components/photo-intake";
import type { CompressedImage } from "@/lib/image";
import { parseOcrText, recognizeLocalText } from "@/lib/ocr-local";
import type { IdentifiedVehicle } from "@/lib/types";
import { POPULAR_MAKES, US_STATES } from "@/lib/us-states";
import { DEMO_VINS, normalizeVin } from "@/lib/vin";

interface VinIdentifyProps {
  vin: string;
  onVinChange: (vin: string) => void;
  vehicle: IdentifiedVehicle | null;
  onIdentified: (vehicle: IdentifiedVehicle) => void;
  onClear: () => void;
  variant?: "full" | "compact";
}

export function VinIdentify({
  vin,
  onVinChange,
  vehicle,
  onIdentified,
  onClear,
  variant = "full",
}: VinIdentifyProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"decode" | "ocr" | "ymm" | null>(null);
  const [year, setYear] = useState(vehicle?.specs.year ?? "");
  const [make, setMake] = useState(vehicle?.specs.make ?? "");
  const [model, setModel] = useState(vehicle?.specs.model ?? "");
  const [trim, setTrim] = useState(vehicle?.specs.trim ?? "");
  const [engine, setEngine] = useState(vehicle?.specs.engineModel ?? "");
  const [plate, setPlate] = useState(vehicle?.specs.plate ?? "");
  const [plateState, setPlateState] = useState(vehicle?.specs.plateState ?? "");
  const [mileage, setMileage] = useState(vehicle?.specs.mileage ?? "");
  const [concern, setConcern] = useState(vehicle?.specs.concern ?? "");
  const [models, setModels] = useState<string[]>([]);
  const [ocrNote, setOcrNote] = useState("");

  const cells = Array.from({ length: 17 }, (_, index) => vin[index] ?? "");
  const years = Array.from({ length: 40 }, (_, index) => String(new Date().getFullYear() + 1 - index));

  useEffect(() => {
    if (!year || !make) return;
    const controller = new AbortController();
    const selectedYear = year;
    const selectedMake = make;
    fetch(`/api/catalog?year=${encodeURIComponent(selectedYear)}&make=${encodeURIComponent(selectedMake)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((payload: { models?: string[] }) => {
        setModels(payload.models ?? []);
      })
      .catch(() => {
        /* keep popular fallback empty */
      });
    return () => controller.abort();
  }, [year, make]);

  async function identify(payload: Record<string, string>) {
    setError("");
    const response = await fetch("/api/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json()) as IdentifiedVehicle & { error?: string };
    if (!response.ok) throw new Error(body.error || "Identify failed");
    onIdentified(body);
    if (body.specs.vin) onVinChange(body.specs.vin);
  }

  async function decodeFromVin(nextVin: string) {
    setBusy("decode");
    try {
      await identify({
        vin: normalizeVin(nextVin),
        plate,
        plateState,
        mileage,
        concern,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decode failed");
    } finally {
      setBusy(null);
    }
  }

  async function identifyByYmm() {
    setBusy("ymm");
    try {
      await identify({ year, make, model, trim, engine, plate, plateState, mileage, concern });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identify failed");
    } finally {
      setBusy(null);
    }
  }

  async function onPhoto(image: CompressedImage) {
    setError("");
    setOcrNote("Reading on this device — no cloud key required…");
    setBusy("ocr");
    try {
      const raw = await recognizeLocalText(image.dataUrl);
      const parsed = parseOcrText(raw);
      if (parsed.vins[0]) {
        setOcrNote(`Found VIN ${parsed.vins[0]} in the photo.`);
        onVinChange(parsed.vins[0]);
        await identify({
          vin: parsed.vins[0],
          plate: parsed.plateGuess || plate,
          plateState,
          mileage,
          concern,
        });
        return;
      }
      if (parsed.plateGuess) {
        setPlate(parsed.plateGuess);
        setOcrNote(
          `Read plate-like text “${parsed.plateGuess}”. We do not buy a commercial plate-to-VIN API — pick year, make, and model, or type the VIN from the door jamb.`,
        );
        return;
      }
      setOcrNote(
        "No VIN in that photo. Type the 17 characters, or identify with year / make / model. A plate alone cannot unlock factory specs.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that photo");
      setOcrNote("");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={variant === "full" ? "grid gap-6 md:grid-cols-[1.15fr_0.85fr]" : "grid gap-6"}>
      <div className="space-y-5 rounded-sm border border-white/10 bg-bay-2/80 p-4 sm:p-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-aluminum">Door-jamb / barcode VIN</p>
          <label className="mt-3 block">
            <span className="sr-only">Vehicle identification number</span>
            <input
              value={vin}
              onChange={(event) => onVinChange(normalizeVin(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === "Enter") void decodeFromVin(vin);
              }}
              spellCheck={false}
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={17}
              placeholder="17 characters"
              className="w-full border-0 bg-transparent font-mono text-lg uppercase tracking-[0.2em] text-fluorescent placeholder:text-aluminum/40 focus:outline-none"
            />
          </label>
          <div className="mt-3 grid grid-cols-[repeat(17,minmax(0,1fr))] gap-1" aria-hidden="true">
            {cells.map((char, index) => (
              <span
                key={index}
                className="vin-cell flex aspect-square items-center justify-center rounded-[2px] border border-white/15 bg-steel font-mono text-sm text-fluorescent sm:text-base"
              >
                {char}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void decodeFromVin(vin)}
              className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
            >
              {busy === "decode" ? "Decoding…" : "Stamp & decode"}
            </button>
            {vehicle ? (
              <button
                type="button"
                onClick={() => {
                  onVinChange("");
                  onClear();
                }}
                className="rounded-sm px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum"
              >
                Clear bay
              </button>
            ) : null}
          </div>
        </div>

        <PhotoIntake
          label="Plate / VIN photo"
          hint="We shrink it to JPEG on your phone, then read it here. No OpenAI key required. A plate is a hint — not a VIN."
          alt="Uploaded VIN or license plate"
          busy={busy === "ocr"}
          onReady={(image) => void onPhoto(image)}
          onError={setError}
        />
        {ocrNote ? <p className="text-sm leading-6 text-ticket">{ocrNote}</p> : null}

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-aluminum">No VIN? Year, make, model</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Field label="Year">
              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
              >
                <option value="">Year</option>
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Make">
              <input
                list="autoshield-makes"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                placeholder="Honda"
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
              />
              <datalist id="autoshield-makes">
                {POPULAR_MAKES.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </Field>
            <Field label="Model">
              <input
                list="autoshield-models"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Accord"
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
              />
              <datalist id="autoshield-models">
                {models.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </Field>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Field label="Trim">
              <input
                value={trim}
                onChange={(event) => setTrim(event.target.value)}
                placeholder="EX-L"
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
              />
            </Field>
            <Field label="Engine">
              <input
                value={engine}
                onChange={(event) => setEngine(event.target.value)}
                placeholder="3.0L V6"
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
              />
            </Field>
          </div>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void identifyByYmm()}
            className="mt-3 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
          >
            {busy === "ymm" ? "Looking up…" : "Identify without a VIN"}
          </button>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-aluminum">Plate, miles, concern</p>
          <p className="mt-1 text-sm text-aluminum">
            Plate + state is a note for you. We cannot legally turn a plate into a VIN without a paid DMV feed.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Field label="US state">
              <select
                value={plateState}
                onChange={(event) => setPlateState(event.target.value)}
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
              >
                <option value="">State</option>
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.code} · {state.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Plate">
              <input
                value={plate}
                onChange={(event) => setPlate(event.target.value.toUpperCase())}
                placeholder="7ABC123"
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 font-mono text-sm"
              />
            </Field>
            <Field label="Mileage">
              <input
                value={mileage}
                onChange={(event) => setMileage(event.target.value)}
                inputMode="numeric"
                placeholder="128400"
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 font-mono text-sm"
              />
            </Field>
          </div>
          <label className="mt-2 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">What&apos;s wrong</span>
            <textarea
              value={concern}
              onChange={(event) => setConcern(event.target.value)}
              rows={2}
              placeholder="Squeal when braking. Shop quoted pads and rotors."
              className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
            />
          </label>
        </div>

        {error ? <p className="text-sm text-cone">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <span className="self-center font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">
            Try a known VIN
          </span>
          {DEMO_VINS.map((demo) => (
            <button
              key={demo.vin}
              type="button"
              disabled={busy !== null}
              onClick={() => void decodeFromVin(demo.vin)}
              className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[11px] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      {variant === "full" ? (
        <aside className="jamb-sticker rounded-sm p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/50">Manufacturer label · MFD</p>
          {vehicle ? (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Stamp label="Year" value={vehicle.specs.year} />
              <Stamp label="Make" value={vehicle.specs.make} />
              <Stamp label="Model" value={vehicle.specs.model} />
              <Stamp label="Trim" value={vehicle.specs.trim || vehicle.specs.series} />
              <Stamp label="Engine" value={engineLine(vehicle)} />
              <Stamp label="Fuel" value={vehicle.specs.fuelType} />
              <Stamp label="How" value={vehicle.specs.identifiedBy === "vin" ? "VIN decode" : "Year / make / model"} />
              <Stamp label="Miles" value={vehicle.specs.mileage} />
              <div className="col-span-2 border-t border-black/10 pt-3 font-mono text-xs tracking-[0.18em]">
                {vehicle.specs.vin ? `VIN ${vehicle.specs.vin}` : "No VIN — typical specs for this combo"}
                {vehicle.specs.plate ? ` · Plate ${vehicle.specs.plateState} ${vehicle.specs.plate}` : ""}
              </div>
              {vehicle.specs.concern ? (
                <p className="col-span-2 text-sm leading-6">{vehicle.specs.concern}</p>
              ) : null}
            </dl>
          ) : (
            <p className="mt-6 max-w-xs text-sm leading-6 text-black/70">
              VIN is best. No VIN? Year, make, and model still unlock fluids and recalls. A plate photo is a reminder,
              not a DMV lookup.
            </p>
          )}
        </aside>
      ) : null}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Stamp({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-black/45">{label}</dt>
      <dd className="font-semibold uppercase tracking-wide">{value || "—"}</dd>
    </div>
  );
}

function engineLine(vehicle: IdentifiedVehicle): string {
  const { engineDisplacement, cylinders, engineConfig, engineModel } = vehicle.specs;
  return [engineDisplacement, cylinders && `${cylinders} cyl`, engineConfig, engineModel]
    .filter(Boolean)
    .join(" · ");
}
