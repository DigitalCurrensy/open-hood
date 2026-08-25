"use client";

import { MechanicDesk } from "@/components/mechanic-desk";
import { PageHeader } from "@/components/page-header";
import { VehicleGate } from "@/components/vehicle-gate";

export function MechanicPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Counter copy" title="Mechanic mode">
        Don&apos;t authorize until you can say this out loud. Print it or paste it into your notes.
      </PageHeader>
      <VehicleGate tool="mechanic mode">{(vehicle) => <MechanicDesk vehicle={vehicle} />}</VehicleGate>
    </div>
  );
}
