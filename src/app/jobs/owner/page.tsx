import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { OwnerDesk } from "@/app/jobs/_components/owner-desk";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Owner checklist",
  description: "Confidence card before a shop visit — VIN, one sentence, measurements, out-the-door number.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="01 · Daily driver" title="Before you walk in">
        Tick the card. Write one sentence. Do not authorize adjectives.
      </PageHeader>
      <OwnerDesk />
    </JobsShell>
  );
}
