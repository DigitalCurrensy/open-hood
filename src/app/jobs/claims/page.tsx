import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PhotoDesk } from "@/app/jobs/_components/photo-desk";
import { PageHeader } from "@/components/page-header";
import { CLAIMS_SHOTS } from "@/lib/jobs/checklists";

export const metadata: Metadata = {
  title: "Claims photo list",
  description: "Adjuster and body-shop shot list — VIN, damage with scale, prior damage called out.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="08 · Adjuster / body" title="Claim photo list">
        Wide, medium, close with a coin. Prior damage gets its own frame.
      </PageHeader>
      <PhotoDesk storageKey="autoshield.jobs.claims" shots={CLAIMS_SHOTS} />
    </JobsShell>
  );
}
