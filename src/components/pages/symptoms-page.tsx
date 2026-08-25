"use client";

import { PageHeader } from "@/components/page-header";
import { SymptomWizard } from "@/components/symptom-wizard";
import { VehicleGate } from "@/components/vehicle-gate";

export function SymptomsPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Noise desk" title="Symptom wizard">
        No part names required. We map the sound and the moment to the sentences a service writer should hear.
      </PageHeader>
      <VehicleGate tool="the symptom wizard">{(vehicle) => <SymptomWizard vehicle={vehicle} />}</VehicleGate>
    </div>
  );
}
