"use client";

import { BayLink } from "@/components/bay-link";
import { useIdentifiedVehicle, useLastQuote } from "@/lib/vehicle-session";

export const TICKET_PATH = [
  {
    id: "identify",
    n: "01",
    stamp: "Identify",
    href: "/",
    line: "VIN first. Year, make, and model if you do not have one.",
  },
  {
    id: "spec",
    n: "02",
    stamp: "Spec",
    href: "/garage",
    line: "Oil, coolant, and PSI for this car. The cap still wins.",
  },
  {
    id: "quote",
    n: "03",
    stamp: "Quote flags",
    href: "/quote",
    line: "Paste the RO. We mark the padded lines.",
  },
  {
    id: "compare",
    n: "04",
    stamp: "Compare 3",
    href: "/quote#compare-3",
    line: "Three pastes. Flags. No buy button.",
  },
  {
    id: "script",
    n: "05",
    stamp: "Counter script",
    href: "/mechanic-mode",
    line: "Three lines you say before you authorize.",
  },
  {
    id: "shops",
    n: "06",
    stamp: "Shops",
    href: "/directory",
    line: "OSM rooftops near a ZIP. We do not book a bay.",
  },
  {
    id: "print",
    n: "07",
    stamp: "Print packet",
    href: "/report",
    line: "Walk the yellow copy to the window.",
  },
] as const;

export type TicketStationId = (typeof TICKET_PATH)[number]["id"];

function nameplate(year: string, make: string, model: string, vin: string): string {
  const title = [year, make, model].filter(Boolean).join(" ");
  return title || (vin ? `VIN ${vin.slice(0, 8)}…` : "This car");
}

function nextStation(hasCar: boolean, hasQuote: boolean): TicketStationId {
  if (!hasCar) return "identify";
  if (!hasQuote) return "quote";
  return "compare";
}

export function TicketPath({
  showNextBay = false,
  current,
}: {
  showNextBay?: boolean;
  current?: TicketStationId;
}) {
  const [vehicle] = useIdentifiedVehicle();
  const [quote] = useLastQuote();
  const hasCar = Boolean(vehicle);
  const hasQuote = Boolean(quote);
  const next = showNextBay && hasCar ? nextStation(true, hasQuote) : null;
  const nextRow = next ? TICKET_PATH.find((row) => row.id === next) : undefined;
  const car = vehicle
    ? nameplate(vehicle.specs.year, vehicle.specs.make, vehicle.specs.model, vehicle.specs.vin)
    : "";

  return (
    <section aria-label="Ticket path" className="space-y-3">
      {showNextBay && nextRow ? (
        <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
            Next bay · {car}
            {hasQuote ? " · flags on this device" : " · no RO marked yet"}
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">{nextRow.stamp}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6">{nextRow.line} We send a script. We do not book a person or a bay.</p>
          <BayLink
            href={nextRow.href}
            className="desk-tap-hit mt-4 inline-flex min-h-11 items-center rounded-sm bg-bay px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-fluorescent"
          >
            Open {nextRow.stamp}
          </BayLink>
        </aside>
      ) : null}

      <div className="ticket-paper rounded-sm p-4 text-ticket-ink sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Ticket path · we send a script</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-70">
            Identify → spec → flags → compare-3 → script → OSM → print
          </p>
        </div>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TICKET_PATH.map((step) => {
            const here = current === step.id;
            const upcoming = next === step.id;
            return (
              <li key={step.id} className="min-w-0">
                <BayLink
                  href={step.href}
                  aria-label={`${step.n} ${step.stamp}. ${step.line}`}
                  aria-current={here ? "step" : undefined}
                  className={`block h-full min-h-11 min-w-0 rounded-sm px-2.5 py-2 ${
                    here || upcoming
                      ? "bg-bay text-fluorescent"
                      : "border border-black/15 hover:bg-black/5"
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
                    {step.n}
                    {upcoming ? " · next" : here ? " · here" : ""}
                  </p>
                  <p className="font-display text-lg uppercase leading-none tracking-wide">{step.stamp}</p>
                  <p className={`mt-1.5 text-sm leading-5 ${here || upcoming ? "text-aluminum" : ""}`}>
                    {step.line}
                  </p>
                </BayLink>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-sm leading-6">
          RepairPal routes a shop. YourMechanic sends a person. AutoZone sells the part. This strip does not book,
          dispatch, or cart a SKU. Compare-3 is three pastes and flags — not a winner and not a checkout.
        </p>
      </div>
    </section>
  );
}
