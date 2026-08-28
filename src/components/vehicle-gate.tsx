"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { VinIdentify } from "@/components/vin-identify";
import { HISTORY_STATUS_API_PATH } from "@/config/nav/history";
import { shouldShowFirstRun, writeFirstRunStamp } from "@/lib/first-run";
import { DEMO_VIN, DEMO_VIN_LABEL } from "@/lib/seo";
import type { IdentifiedVehicle } from "@/lib/types";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function VehicleGate({
  tool,
  children,
}: {
  tool: string;
  children: (vehicle: IdentifiedVehicle) => ReactNode;
}) {
  const [vehicle, setVehicle] = useIdentifiedVehicle();
  const [vinInput, setVinInput] = useState(vehicle?.specs.vin ?? "");
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoError, setDemoError] = useState("");
  const [plateLive, setPlateLive] = useState(false);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (vehicle?.specs.vin) writeFirstRunStamp("identified");
  }, [vehicle?.specs.vin]);

  useEffect(() => {
    let cancelled = false;
    void fetch(HISTORY_STATUS_API_PATH, { cache: "no-store" })
      .then((response) => response.json())
      .then((body: { live?: boolean }) => {
        if (!cancelled) setPlateLive(Boolean(body.live));
      })
      .catch(() => {
        if (!cancelled) setPlateLive(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function stampDemoVin() {
    setDemoBusy(true);
    setDemoError("");
    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: DEMO_VIN }),
      });
      const body = (await response.json()) as IdentifiedVehicle & { error?: string };
      if (!response.ok) throw new Error(body.error || "Demo decode failed");
      setVinInput(body.specs.vin || DEMO_VIN);
      setVehicle(body);
      writeFirstRunStamp("identified");
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : "Demo decode failed");
    } finally {
      setDemoBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-aluminum">Checking this device…</p>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-4">
        <div className="rounded-sm border border-dashed border-white/15 bg-bay-2/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Empty bay</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Identify the car first</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-aluminum">
            {tool} needs a car on this device. Stamp a 17-character VIN <em>or</em> year / make / model. Then this desk
            can work the ticket.
          </p>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {plateLive
              ? "A plate can decode on this bay — a commercial key is on."
              : "A plate is a note. Photo the VIN."}
          </p>
          {hydrated && shouldShowFirstRun() ? (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
              First visit · demo VIN is one tap. Then garage → quote.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void stampDemoVin()}
            disabled={demoBusy}
            className="mt-4 inline-flex min-h-11 items-center rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-60"
          >
            {demoBusy ? "Stamping the demo VIN…" : `Demo VIN · ${DEMO_VIN_LABEL}`}
          </button>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
            {DEMO_VIN}
          </p>
          {demoError ? <p className="mt-2 text-sm text-cone">{demoError}</p> : null}
        </div>
        <VinIdentify
          variant="compact"
          vin={vinInput}
          onVinChange={setVinInput}
          vehicle={null}
          onIdentified={setVehicle}
          onClear={() => {
            setVinInput("");
            setVehicle(null);
          }}
        />
      </div>
    );
  }

  const title = [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">
          Working on <span className="text-fluorescent">{title}</span>
          {vehicle.specs.engineDisplacement ? ` · ${vehicle.specs.engineDisplacement}` : ""}
        </p>
        <button
          type="button"
          onClick={() => {
            setVinInput("");
            setVehicle(null);
          }}
          className="self-start font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:text-ticket"
        >
          Change car
        </button>
      </div>
      {children(vehicle)}
    </div>
  );
}
