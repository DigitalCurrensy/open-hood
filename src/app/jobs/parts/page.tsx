import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PartsDesk } from "@/app/jobs/_components/parts-desk";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Parts counter",
  description: "OEM vs aftermarket vs CAPA — the SKU conversation. No fake live inventory.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="05 · Parts counter" title="SKU conversation">
        OEM, aftermarket, CAPA body. Ask the VIN. We do not pretend a dealer shelf is on this page.
      </PageHeader>
      <PartsDesk />
    </JobsShell>
  );
}
