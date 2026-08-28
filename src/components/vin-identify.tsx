"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MediaCapture, type CompressedImage } from "@/components/media-capture";
import { parseOcrText, recognizeLocalText } from "@/lib/ocr-local";
import type { IdentifiedVehicle } from "@/lib/types";
import { POPULAR_MAKES, US_STATES } from "@/lib/us-states";
import { PLATE_DPPA_CHECKBOX } from "@/lib/history/types";
import { inspectPlateFormat } from "@/lib/plate-format";
import { DEMO_VINS, inspectVinCheckDigit, isValidVin, normalizeVin, VIN_CHECK_DIGIT_INDEX } from "@/lib/vin";

interface VinIdentifyProps {
  vin: string;
  onVinChange: (vin: string) => void;
  vehicle: IdentifiedVehicle | null;
  onIdentified: (vehicle: IdentifiedVehicle) => void;
  onClear: () => void;
  variant?: "full" | "compact";
  autoDecode?: boolean;
}

export function VinIdentify({
  vin,
  onVinChange,
  vehicle,
  onIdentified,
  onClear,
  variant = "full",
  autoDecode = false,
}: VinIdentifyProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"decode" | "ocr" | "ymm" | "plate" | null>(null);
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
  const [cloudOcr, setCloudOcr] = useState(false);
  const [plateKeyOn, setPlateKeyOn] = useState(false);
  const [dppaAck, setDppaAck] = useState(false);

  const cells = Array.from({ length: 17 }, (_, index) => vin[index] ?? "");
  const years = Array.from({ length: 40 }, (_, index) => String(new Date().getFullYear() + 1 - index));
  const checkDigit = inspectVinCheckDigit(vin);
  const plateFormat = inspectPlateFormat({ plate, state: plateState });
  const canDecodePlate = plateKeyOn && dppaAck;

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/ocr", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/history/plate", { cache: "no-store" }).then((response) => response.json()),
    ])
      .then(([ocrBody, plateBody]: [{ available?: boolean }, {
        connected?: boolean;
        live?: boolean;
        keyPresent?: boolean;
        carsxe?: boolean;
        marketcheck?: boolean;
      }]) => {
        if (cancelled) return;
        setCloudOcr(Boolean(ocrBody.available));
        setPlateKeyOn(
          Boolean(plateBody.keyPresent ?? (plateBody.carsxe || plateBody.marketcheck || plateBody.connected || plateBody.live)),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setCloudOcr(false);
        setPlateKeyOn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  async function decodeFromPlate(nextPlate: string, nextState: string): Promise<boolean> {
    if (!plateKeyOn) return false;
    if (!dppaAck) {
      setError("Check the DPPA / permissible-purpose box. A key alone does not turn the decoder on.");
      return false;
    }
    const response = await fetch("/api/history/plate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: nextPlate, state: nextState, permissiblePurpose: true }),
    });
    const body = (await response.json()) as {
      connected?: boolean;
      inventedVin?: boolean;
      vin?: string;
      error?: string;
      notice?: string;
    };
    if (body.inventedVin) {
      setError("Decoder invented a VIN. We refused it. Type the 17 from the door jamb.");
      return false;
    }
    const hit = typeof body.vin === "string" ? normalizeVin(body.vin) : "";
    if (!isValidVin(hit)) {
      setOcrNote(body.notice || body.error || "Decoder returned no VIN. Type the 17 from the door jamb.");
      return false;
    }
    onVinChange(hit);
    await identify({
      vin: hit,
      plate: nextPlate,
      plateState: nextState,
      mileage,
      concern,
    });
    setOcrNote(body.notice || `Plate hit ${hit}. Identity still goes through NHTSA.`);
    return true;
  }

  useEffect(() => {
    if (!autoDecode) return;
    const next = normalizeVin(vin);
    if (!isValidVin(next)) return;
    const handle = window.setTimeout(() => {
      void decodeFromVin(next);
    }, 0);
    return () => window.clearTimeout(handle);
    // Stamp once from a share URL — later edits are the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDecode]);

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

  async function applyPhotoRead(vinHit: string, plateGuess: string, note: string) {
    if (vinHit) {
      setOcrNote(note);
      onVinChange(vinHit);
      await identify({
        vin: vinHit,
        plate: plateGuess || plate,
        plateState,
        mileage,
        concern,
      });
      return true;
    }
    if (plateGuess) {
      setPlate(plateGuess);
      if (canDecodePlate && plateState) {
        if (await decodeFromPlate(plateGuess, plateState)) return true;
        setOcrNote(`Read plate-like text “${plateGuess}”. Decoder missed. Type the VIN — we did not invent one.`);
        return true;
      }
      setOcrNote(
        plateKeyOn
          ? `Read plate-like text “${plateGuess}”. Check the DPPA box and pick a US state to ask the decoder. We did not invent a VIN.`
          : `Read plate-like text “${plateGuess}”. Plate stays a note. Type the VIN from the door jamb — we never invent one from a plate.`,
      );
      return true;
    }
    return false;
  }

  async function onPhoto(image: CompressedImage) {
    setError("");
    setBusy("ocr");
    try {
      if (cloudOcr) {
        setOcrNote("Reading the door jamb with the bay reader…");
        try {
          const response = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: image.base64,
              mimeType: image.mimeType,
              kind: "vin",
            }),
          });
          const body = (await response.json()) as {
            vin?: string;
            plate?: string;
            error?: string;
            usedCloud?: boolean;
          };
          if (body.usedCloud && (await applyPhotoRead(body.vin ?? "", body.plate ?? "", body.vin ? `Found VIN ${body.vin} in the photo.` : ""))) {
            return;
          }
          if (body.usedCloud && body.error) {
            setOcrNote(`${body.error} Trying this device next.`);
          }
        } catch {
          setOcrNote("Bay reader missed. Trying this device…");
        }
      } else {
        setOcrNote("Reading on this device — photo reading is off on this bay.");
      }

      const raw = await recognizeLocalText(image.dataUrl);
      const parsed = parseOcrText(raw);
      if (await applyPhotoRead(parsed.vins[0] ?? "", parsed.plateGuess, parsed.vins[0] ? `Found VIN ${parsed.vins[0]} in the photo.` : "")) {
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
      <div className="desk-tap space-y-5 rounded-sm border border-white/10 bg-bay-2/80 p-4 sm:p-6">
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
                className={`vin-cell flex aspect-square items-center justify-center rounded-[2px] border bg-steel font-mono text-sm text-fluorescent sm:text-base ${
                  index === VIN_CHECK_DIGIT_INDEX ? "border-ticket/70" : "border-white/15"
                }`}
                title={index === VIN_CHECK_DIGIT_INDEX ? "ISO 3779 check digit" : undefined}
              >
                {char}
              </span>
            ))}
          </div>
          {checkDigit.stamp ? (
            <p className={`mt-3 text-sm leading-6 ${checkDigit.ok ? "text-ticket" : "text-cone"}`}>{checkDigit.stamp}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void decodeFromVin(vin)}
              className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
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
                className="min-h-11 rounded-sm px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum"
              >
                Clear bay
              </button>
            ) : null}
          </div>
        </div>

        <MediaCapture
          label="Plate / VIN photo"
          hint={
            cloudOcr
              ? "Choose a photo or use the camera. We shrink it to JPEG, then the bay reader runs first. If that misses, this device still tries. A plate is a hint — not a VIN."
              : "Choose a photo or use the camera. We shrink it to JPEG and read it on this device. Photo reading is off on this bay. A plate is a hint — not a VIN."
          }
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
                list="openhood-makes"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                placeholder="Honda"
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
              />
              <datalist id="openhood-makes">
                {POPULAR_MAKES.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </Field>
            <Field label="Model">
              <input
                list="openhood-models"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Accord"
                className="w-full rounded-sm border border-white/15 bg-bay px-2 py-2 text-sm"
              />
              <datalist id="openhood-models">
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
            className="mt-3 min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
          >
            {busy === "ymm" ? "Looking up…" : "Identify without a VIN"}
          </button>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-aluminum">Plate desk · miles, concern</p>
          <p className="mt-1 text-sm text-aluminum">
            {canDecodePlate
              ? "Commercial plate-to-VIN is on for this check. Identity still goes through NHTSA after the plate hits."
              : plateKeyOn
                ? "A plate key is in env. Decoder stays note-only until you check the DPPA / permissible-purpose box. We never invent a VIN."
                : "No CARSXE_API_KEY or MARKETCHECK_API_KEY. Plate-to-VIN is {connected:false}. State + plate is a note. We never invent a VIN from a plate."}
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
          {plateFormat.stamp ? (
            <p className={`mt-2 text-sm leading-6 ${plateFormat.recognized ? "text-ticket" : "text-aluminum"}`}>
              {plateFormat.stamp}
            </p>
          ) : null}
          {plateKeyOn ? (
            <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-aluminum">
              <input
                type="checkbox"
                checked={dppaAck}
                onChange={(event) => setDppaAck(event.target.checked)}
                className="mt-1 size-4 shrink-0 accent-[var(--ticket)]"
              />
              <span>{PLATE_DPPA_CHECKBOX}</span>
            </label>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {vehicle ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  setBusy("ymm");
                  void identify({
                    vin: vehicle.specs.vin,
                    year: vehicle.specs.year,
                    make: vehicle.specs.make,
                    model: vehicle.specs.model,
                    trim: vehicle.specs.trim,
                    engine: vehicle.specs.engineModel,
                    plate,
                    plateState,
                    mileage,
                    concern,
                  })
                    .then(() => {
                      setOcrNote(
                        plate
                          ? `${inspectPlateFormat({ plate, state: plateState }).stamp}. ${canDecodePlate ? "" : "No VIN was invented."}`
                          : "Plate note cleared.",
                      );
                    })
                    .catch((err) => {
                      setError(err instanceof Error ? err.message : "Could not save the plate note.");
                    })
                    .finally(() => setBusy(null));
                }}
                className="min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
              >
                Save plate as a note
              </button>
            ) : null}
            {plateKeyOn ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  setBusy("plate");
                  setError("");
                  void decodeFromPlate(plate, plateState)
                    .catch((err) => {
                      setError(err instanceof Error ? err.message : "Plate decoder missed.");
                    })
                    .finally(() => setBusy(null));
                }}
                className="min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
              >
                {busy === "plate" ? "Asking decoder…" : "Try plate decoder"}
              </button>
            ) : null}
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
            <a
              key={demo.vin}
              href={`/?vin=${demo.vin}`}
              className="desk-tap-hit inline-flex min-h-11 items-center rounded-sm border border-white/10 px-3 py-2 font-mono text-[11px] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
              onClick={(event) => {
                if (busy !== null) {
                  event.preventDefault();
                  return;
                }
                if (variant === "full") return;
                event.preventDefault();
                void decodeFromVin(demo.vin);
              }}
            >
              {demo.label}
            </a>
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
              <Stamp
                label="Check digit"
                value={
                  inspectVinCheckDigit(vehicle.specs.vin).ok
                    ? "ISO 3779 pass"
                    : vehicle.specs.vin
                      ? "Fails — WMI may still decode"
                      : "—"
                }
              />
              <Stamp label="Miles" value={vehicle.specs.mileage} />
              {vehicle.specs.tpms || vehicle.specs.hybrid ? (
                <div className="col-span-2 flex flex-wrap gap-1.5">
                  {vehicle.specs.tpms ? <OptionChip label="TPMS" value={vehicle.specs.tpms} /> : null}
                  {vehicle.specs.hybrid ? <OptionChip label="Hybrid" value={vehicle.specs.hybrid} /> : null}
                </div>
              ) : null}
              <div className="col-span-2 border-t border-black/10 pt-3 font-mono text-xs tracking-[0.18em]">
                {vehicle.specs.vin ? `VIN ${vehicle.specs.vin}` : "No VIN — typical specs for this combo"}
                {vehicle.specs.plate ? ` · Plate ${vehicle.specs.plateState} ${vehicle.specs.plate} (note)` : ""}
              </div>
              {vehicle.specs.vin ? (
                <a
                  href={`/sticker?vin=${vehicle.specs.vin}`}
                  className="col-span-2 font-mono text-[11px] uppercase tracking-[0.16em] underline"
                >
                  Open identification packet
                </a>
              ) : null}
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

function OptionChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-sm border border-black/15 bg-black/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]">
      {label} · {value}
    </span>
  );
}

function engineLine(vehicle: IdentifiedVehicle): string {
  const { engineDisplacement, engineHP, cylinders, engineConfig, engineModel } = vehicle.specs;
  return [engineDisplacement, engineHP && `${engineHP} hp`, cylinders && `${cylinders} cyl`, engineConfig, engineModel]
    .filter(Boolean)
    .join(" · ");
}
