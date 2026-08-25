"use client";

import { useState, type ReactNode } from "react";
import { VinIdentify } from "@/components/vin-identify";
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

  if (!vehicle) {
    return (
      <div className="space-y-4">
        <div className="rounded-sm border border-dashed border-white/15 bg-bay-2/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Empty bay</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Identify the car first</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-aluminum">
            {tool} is VIN-backed. Stamp the 17 characters from the door jamb — or try a demo VIN — then this desk unlocks
            for that exact car.
          </p>
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
