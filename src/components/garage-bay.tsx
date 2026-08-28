"use client";

import { useMemo, useState } from "react";
import { BayLink } from "@/components/bay-link";
import { VinIdentify } from "@/components/vin-identify";
import { BAY_NAV } from "@/config/nav/consumer";
import { DEMO_VIN, DEMO_VIN_LABEL } from "@/lib/seo";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

const TRY_CHIPS = [
  { href: `/?vin=${DEMO_VIN}`, label: DEMO_VIN_LABEL },
  { href: "/directory/90210", label: "90210 rooftops" },
  { href: "/guides/oil-change", label: "oil-change" },
  { href: "/guides/cabin-filter", label: "cabin-filter" },
  { href: "/obd/P0420", label: "P0420" },
  { href: "/auctions?year=2018&make=Honda&model=Civic", label: "2018 Civic lane" },
] as const;

const CONTINUE = [
  { href: "/quote", stamp: "Ticket", label: "Mark this RO" },
  { href: "/recalls", stamp: "Recalls", label: "NHTSA campaigns" },
  { href: "/directory", stamp: "Shops", label: "Find a rooftop" },
] as const;

const BAY_CARDS = BAY_NAV.filter((item) => item.href !== "/");

export function GarageBay({ initialVin = "" }: { initialVin?: string }) {
  const [vehicle, setVehicle] = useIdentifiedVehicle();
  const [vinInput, setVinInput] = useState(initialVin);
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
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">
            {vehicle ? "Last car on this device" : "Bay 01 · live"}
          </p>
          <h1 className="font-display text-5xl uppercase leading-none tracking-wide text-fluorescent sm:text-6xl">
            {title}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-aluminum">
          We translate factory data and the shop ticket into sentences you can say out loud. We do not book appointments
          or take a cut of the repair.
        </p>
      </div>

      {vehicle ? (
        <ul className="grid gap-2 sm:grid-cols-3">
          {CONTINUE.map((desk) => (
            <li key={desk.href}>
              <BayLink
                href={desk.href}
                className="desk-tap-hit flex min-h-11 flex-col justify-center rounded-sm border border-white/15 bg-bay-2/80 px-3 py-2 hover:border-ticket/50"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{desk.stamp}</span>
                <span className="text-sm text-fluorescent">{desk.label}</span>
              </BayLink>
            </li>
          ))}
        </ul>
      ) : null}

      <VinIdentify
        vin={displayedVin}
        onVinChange={setVinInput}
        vehicle={vehicle}
        onIdentified={setVehicle}
        onClear={clearVehicle}
        autoDecode={Boolean(initialVin)}
      />

      <p className="flex flex-wrap items-center gap-2 text-sm text-aluminum">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">Try</span>
        {TRY_CHIPS.map((chip) => (
          <BayLink
            key={chip.href}
            href={chip.href}
            className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[11px] text-ticket hover:border-ticket/50 hover:text-fluorescent"
          >
            {chip.label}
          </BayLink>
        ))}
      </p>

      <section className="space-y-3">
        <h2 className="font-display text-3xl uppercase tracking-wide text-fluorescent">
          {vehicle ? "Continue from this car" : "All bays"}
        </h2>
        {!vehicle ? (
          <p className="text-sm leading-6 text-aluminum">
            Specs, quote markup, and recalls get sharper after you identify the car. Every desk below is open now.
          </p>
        ) : null}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BAY_CARDS.map((tool) => (
            <li key={tool.href}>
              <BayLink
                href={tool.href}
                className="block h-full rounded-sm border border-white/10 bg-bay-2/80 p-4 hover:border-ticket/50"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">{tool.stamp}</p>
                <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">{tool.label}</h3>
                <p className="mt-2 text-sm leading-6 text-aluminum">{tool.blurb}</p>
              </BayLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
