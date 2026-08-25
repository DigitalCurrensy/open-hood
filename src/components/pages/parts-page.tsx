"use client";

import { PageHeader } from "@/components/page-header";
import { PartsDesk } from "@/components/parts-desk";
import { VehicleGate } from "@/components/vehicle-gate";

export function PartsPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="DIY buy path" title="Parts desk">
        Search URLs from the card SKUs. We do not invent live inventory or dealer stock.
      </PageHeader>
      <VehicleGate tool="the parts desk">{(vehicle) => <PartsDesk vehicle={vehicle} />}</VehicleGate>
    </div>
  );
}
