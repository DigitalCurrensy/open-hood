"use client";

import { MediaCapture, type CompressedImage } from "@/components/media-capture";
import { PLATE_DPPA_CHECKBOX } from "@/lib/history/types";
import { inspectPlateFormat } from "@/lib/plate-format";
import type { IdentifiedVehicle } from "@/lib/types";
import { US_STATES } from "@/lib/us-states";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import { isValidVin, normalizeVin } from "@/lib/vin";
import { useEffect, useMemo, useState } from "react";

const FIELD =
  "mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

interface PlateStatusBody {
  connected?: boolean;
  live?: boolean;
  keyPresent?: boolean;
  carsxe?: boolean;
  marketcheck?: boolean;
  note?: string;
  photoVinHref?: string;
}

interface PlateDecodeBody {
  connected?: boolean;
  inventedVin?: boolean;
  vin?: string;
  plate?: string;
  state?: string;
  note?: string;
  error?: string;
  notice?: string;
  ok?: boolean;
}

function keysOn(status: PlateStatusBody | null): boolean {
  if (!status) return false;
  return Boolean(status.keyPresent || status.carsxe || status.marketcheck);
}

function vendorVin(body: PlateDecodeBody): string {
  if (body.inventedVin) return "";
  const vin = typeof body.vin === "string" ? normalizeVin(body.vin) : "";
  return isValidVin(vin) ? vin : "";
}

export function PlateDesk() {
  const [vehicle, setVehicle] = useIdentifiedVehicle();
  const [plate, setPlate] = useState(vehicle?.specs.plate ?? "");
  const [state, setState] = useState(vehicle?.specs.plateState ?? "");
  const [status, setStatus] = useState<PlateStatusBody | null>(null);
  const [note, setNote] = useState("");
  const [fault, setFault] = useState("");
  const [busy, setBusy] = useState<"note" | "ocr" | "decode" | null>(null);
  const [cloudOcr, setCloudOcr] = useState(false);
  const [dppaAck, setDppaAck] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/history/plate", { cache: "no-store" }).then((res) => res.json()),
      fetch("/api/ocr", { cache: "no-store" }).then((res) => res.json()),
    ])
      .then(([plateBody, ocrBody]: [PlateStatusBody, { available?: boolean }]) => {
        if (cancelled) return;
        setStatus(plateBody);
        setCloudOcr(Boolean(ocrBody.available));
      })
      .catch(() => {
        if (!cancelled) setStatus({ connected: false, note: "Plate adapter did not answer. A plate is a note." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const keyPresent = keysOn(status);
  const decoderOn = keyPresent && dppaAck;
  const format = useMemo(() => inspectPlateFormat({ plate, state }), [plate, state]);

  function saveNote(nextPlate = plate, nextState = state) {
    const cleanPlate = nextPlate.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
    const cleanState = nextState.trim().toUpperCase().slice(0, 2);
    setPlate(cleanPlate);
    setState(cleanState);
    if (!vehicle) {
      setNote("Plate stored on this desk as a note. Stamp a VIN — we will not invent one from the plate.");
      return;
    }
    const next: IdentifiedVehicle = {
      ...vehicle,
      specs: { ...vehicle.specs, plate: cleanPlate, plateState: cleanState },
    };
    setVehicle(next);
    const verdict = inspectPlateFormat({ plate: cleanPlate, state: cleanState });
    setNote(
      cleanPlate
        ? `${verdict.stamp || "Plate saved as a note."} Not a DMV decode. We did not invent a VIN.`
        : "Plate note cleared.",
    );
  }

  async function bindVin(nextVin: string, nextPlate: string, nextState: string) {
    const clean = normalizeVin(nextVin);
    if (!isValidVin(clean)) return;
    const response = await fetch("/api/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vin: clean,
        plate: nextPlate,
        plateState: nextState,
        mileage: vehicle?.specs.mileage ?? "",
        concern: vehicle?.specs.concern ?? "",
      }),
    });
    const body = (await response.json()) as IdentifiedVehicle & { error?: string };
    if (!response.ok) throw new Error(body.error || "Identify failed");
    setVehicle(body);
  }

  async function tryDecode(nextPlate = plate, nextState = state) {
    if (!keyPresent) {
      setFault("No CARSXE_API_KEY or MARKETCHECK_API_KEY. Plate-to-VIN is {connected:false}. We will not invent a VIN from a plate.");
      saveNote(nextPlate, nextState);
      return;
    }
    if (!dppaAck) {
      setFault("Check the DPPA / permissible-purpose box. A key alone does not turn the decoder on.");
      saveNote(nextPlate, nextState);
      return;
    }
    setBusy("decode");
    setFault("");
    try {
      const response = await fetch("/api/history/plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: nextPlate, state: nextState, permissiblePurpose: true }),
      });
      const body = (await response.json()) as PlateDecodeBody;
      const hit = vendorVin(body);
      if (hit) {
        await bindVin(hit, nextPlate, nextState);
        setNote(body.notice || `Plate hit ${hit}. Identity still goes through NHTSA.`);
        return;
      }
      if (body.connected === false) {
        setFault(body.error || body.note || "Plate adapter is off. Plate stays a note.");
        saveNote(nextPlate, nextState);
        return;
      }
      setFault(body.notice || body.error || "Decoder returned no VIN. Type the 17 from the door jamb.");
      saveNote(nextPlate, nextState);
    } catch {
      setFault("Plate decoder did not answer. Photo the VIN.");
    } finally {
      setBusy(null);
    }
  }

  async function onPhoto(image: CompressedImage) {
    setBusy("ocr");
    setFault("");
    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image.base64, mimeType: image.mimeType, kind: "vin" }),
      });
      const body = (await response.json()) as { vin?: string; plate?: string; error?: string; usedCloud?: boolean };
      const photoVin = typeof body.vin === "string" ? normalizeVin(body.vin) : "";
      if (isValidVin(photoVin)) {
        if (body.plate) {
          setPlate(body.plate.toUpperCase());
          saveNote(body.plate, state);
        }
        await bindVin(photoVin, body.plate ?? plate, state);
        setNote(`Read VIN ${photoVin} in the photo. We did not invent it from a plate.`);
        return;
      }
      if (body.plate) {
        setPlate(body.plate.toUpperCase());
        saveNote(body.plate, state);
        if (decoderOn && state) {
          await tryDecode(body.plate, state);
          return;
        }
        setNote(
          decoderOn
            ? `Read plate ${body.plate}. Pick a US state, then try the decoder. We did not invent a VIN.`
            : `Read plate ${body.plate}. Stored as a note. We did not invent a VIN.`,
        );
        return;
      }
      setFault(body.error || "No plate in that photo. Type it, or photo the door jamb VIN.");
    } catch {
      setFault("OCR missed. Type the plate, or stamp the VIN.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
        {decoderOn ? "Live · plate decoder" : "Plate desk · note only"}
      </p>
      <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">US plate</h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        {keyPresent
          ? status?.note
          : "No CARSXE_API_KEY or MARKETCHECK_API_KEY. Plate-to-VIN is {connected:false}. State + plate ride as a note. We never invent a VIN from a plate."}
      </p>
      {format.stamp ? (
        <p className={`mt-2 text-sm leading-6 ${format.recognized ? "text-ticket" : "text-aluminum"}`}>{format.stamp}</p>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-[7rem_1fr]">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">State</span>
          <select value={state} onChange={(event) => setState(event.target.value)} className={FIELD}>
            <option value="">State</option>
            {US_STATES.map((row) => (
              <option key={row.code} value={row.code}>
                {row.code} · {row.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Plate</span>
          <input
            value={plate}
            onChange={(event) => setPlate(event.target.value.toUpperCase())}
            autoComplete="off"
            spellCheck={false}
            placeholder="7ABC123"
            className={`${FIELD} font-mono uppercase tracking-[0.16em]`}
          />
        </label>
      </div>
      {keyPresent ? (
        <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-aluminum">
          <input
            type="checkbox"
            checked={dppaAck}
            onChange={(event) => setDppaAck(event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-[var(--ticket)]"
          />
          <span>{PLATE_DPPA_CHECKBOX}</span>
        </label>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => {
            setBusy("note");
            setFault("");
            saveNote();
            setBusy(null);
          }}
          className="min-h-11 rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
        >
          Save plate as a note
        </button>
        {keyPresent ? (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void tryDecode()}
            className="min-h-11 rounded-sm border border-white/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
          >
            {busy === "decode" ? "Asking decoder…" : "Try plate decoder"}
          </button>
        ) : null}
      </div>
      <div className="mt-4">
        <MediaCapture
          label="Plate photo"
          hint={
            cloudOcr
              ? "We call the existing bay reader. A plate in the photo is a note — not a VIN — unless the decoder hits after you check DPPA."
              : "Photo reading is off. Type the plate, or photo the door-jamb VIN on Identify."
          }
          alt="License plate"
          compact
          busy={busy === "ocr"}
          onReady={(image) => void onPhoto(image)}
          onError={setFault}
        />
      </div>
      {note ? <p className="mt-3 text-sm leading-6 text-ticket">{note}</p> : null}
      {fault ? <p className="mt-3 text-sm leading-6 text-cone">{fault}</p> : null}
    </section>
  );
}
