"use client";

import { BayLink } from "@/components/bay-link";
import { FirstRunRail } from "@/components/first-run";
import { PageHeader } from "@/components/page-header";
import { completeFirstRun, writeFirstRunStamp } from "@/lib/first-run";
import { PrintFindingsButton } from "@/components/report/print-findings-button";
import { SpecSheet } from "@/components/spec-sheet";
import { VehicleGate } from "@/components/vehicle-gate";

const CONTINUE = [
  { href: "/quote", stamp: "Ticket", label: "Mark this RO" },
  { href: "/recalls", stamp: "Recalls", label: "NHTSA campaigns" },
  { href: "/directory", stamp: "Shops", label: "Find a rooftop" },
] as const;

export function GaragePage() {
  return (
    <div className="space-y-6">
      <FirstRunRail />
      <PageHeader kicker="Garage · last car on this device" title="Spec sheet">
        Oil, coolant, PSI, and filter SKUs in plain English. Confirm the under-hood label before you buy. The fluids book
        is a pamphlet you can search — this card is this car. Tap a stamp to keep working the same vehicle.
      </PageHeader>
      <VehicleGate tool="the spec sheet">
        {(vehicle) => (
          <div className="space-y-4">
            <ul className="grid gap-2 sm:grid-cols-3">
              {CONTINUE.map((desk) => (
                <li key={desk.href}>
                  <BayLink
                    href={desk.href}
                    onClick={() => {
                      if (desk.href === "/quote") {
                        writeFirstRunStamp("ticket");
                        writeFirstRunStamp("sentence");
                        completeFirstRun();
                      }
                    }}
                    className="desk-tap-hit flex min-h-11 flex-col justify-center rounded-sm border border-white/15 bg-bay-2/80 px-3 py-2 hover:border-ticket/50"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{desk.stamp}</span>
                    <span className="text-sm text-fluorescent">{desk.label}</span>
                  </BayLink>
                </li>
              ))}
            </ul>
            <PrintFindingsButton extras={{ vehicle }} />
            <SpecSheet vehicle={vehicle} />
          </div>
        )}
      </VehicleGate>
    </div>
  );
}
