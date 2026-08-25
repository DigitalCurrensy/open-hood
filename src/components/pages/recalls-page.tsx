"use client";

import { PageHeader } from "@/components/page-header";
import { RecallsDesk } from "@/components/recalls-desk";
import { VehicleGate } from "@/components/vehicle-gate";

export function RecallsPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="NHTSA campaign file" title="Recalls">
        What the campaign means in plain English, plus the sentence to use at the dealer desk. Open campaigns are free.
      </PageHeader>
      <VehicleGate tool="the recall file">{(vehicle) => <RecallsDesk vehicle={vehicle} />}</VehicleGate>
    </div>
  );
}
