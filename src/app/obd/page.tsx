import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ObdDesk } from "@/components/obd-desk";

export const metadata: Metadata = {
  title: "OBD codes",
  description: "Translate a P0xxx code from any $20 scanner — no dongle required.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Scanner copy" title="OBD-II translator">
        Type the code from any $20 scanner. We explain it like a person standing next to you — not a parts catalog.
      </PageHeader>
      <ObdDesk />
    </div>
  );
}
