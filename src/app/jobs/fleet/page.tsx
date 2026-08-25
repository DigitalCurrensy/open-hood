import type { Metadata } from "next";
import { FleetDesk } from "@/app/jobs/_components/fleet-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Fleet interval vs upsell",
  description: "Approve the OEM interval page, not the menu. Ask for millimeters.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="11 · Fleet / shop manager" title="Interval vs upsell">
        Stamp the book, not the pitch. Measurements beat a multi-point adjective.
      </PageHeader>
      <FleetDesk />
    </JobsShell>
  );
}
