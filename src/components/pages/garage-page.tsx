"use client";

import { PageHeader } from "@/components/page-header";
import { SpecSheet } from "@/components/spec-sheet";
import { VehicleGate } from "@/components/vehicle-gate";

export function GaragePage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Garage · fluids card" title="Spec sheet">
        Oil, coolant, PSI, and filter SKUs in plain English. Confirm the under-hood label before you buy.
      </PageHeader>
      <VehicleGate tool="the spec sheet">{(vehicle) => <SpecSheet vehicle={vehicle} />}</VehicleGate>
    </div>
  );
}
