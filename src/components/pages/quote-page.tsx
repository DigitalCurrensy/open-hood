"use client";

import { PageHeader } from "@/components/page-header";
import { QuoteDesk } from "@/components/quote-desk";
import { VehicleGate } from "@/components/vehicle-gate";

export function QuotePage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Quote desk · grease pencil" title="Quote defense">
        Paste the line items or drop a photo of the RO. Don&apos;t authorize until you can say the script at the
        counter.
      </PageHeader>
      <VehicleGate tool="quote defense">{(vehicle) => <QuoteDesk vehicle={vehicle} />}</VehicleGate>
    </div>
  );
}
