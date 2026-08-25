"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VinIdentify } from "@/components/vin-identify";
import { BAY_TOOLS } from "@/lib/nav";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function GarageBay() {
  const [vehicle, setVehicle] = useIdentifiedVehicle();
  const [vinInput, setVinInput] = useState("");
  const displayedVin = vinInput || vehicle?.specs.vin || "";

  const title = useMemo(() => {
    if (!vehicle) return "Identify the car before they write the RO";
    const { year, make, model, trim } = vehicle.specs;
    return [year, make, model, trim].filter(Boolean).join(" ");
  }, [vehicle]);

  function clearVehicle() {
    setVinInput("");
    setVehicle(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">Bay 01 · live</p>
          <h1 className="font-display text-5xl uppercase leading-none tracking-wide text-fluorescent sm:text-6xl">
            {title}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-aluminum">
          We translate factory data and the shop ticket into sentences you can say out loud. We do not book appointments
          or take a cut of the repair.
        </p>
      </div>

      <VinIdentify
        vin={displayedVin}
        onVinChange={setVinInput}
        vehicle={vehicle}
        onIdentified={setVehicle}
        onClear={clearVehicle}
      />

      {vehicle ? (
        <section className="space-y-3">
          <h2 className="font-display text-3xl uppercase tracking-wide text-fluorescent">Tools unlocked</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BAY_TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="block h-full rounded-sm border border-white/10 bg-bay-2/80 p-4 hover:border-ticket/50"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">{tool.stamp}</p>
                  <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">{tool.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-aluminum">{tool.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-aluminum-dim">
          Identify the car — VIN, photo, or year/make/model — to unlock the spec sheet, quote markup, and recalls.
        </p>
      )}
    </div>
  );
}
