import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PhotoDesk } from "@/app/jobs/_components/photo-desk";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { PPI_SHOTS } from "@/lib/jobs/checklists";

export const metadata: Metadata = {
  title: "PPI photo list",
  description: "Guided pre-purchase shot list. Not a legal opinion. Not a live lot.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageBrief href="/jobs/ppi" />
      <PageHeader kicker="PPI · before you wire money" title="Guided shot list">
        Date codes, VIN, cluster lamps, a scan screen. Not legal advice. Not an appraisal.
      </PageHeader>
      <PhotoDesk
        storageKey="openhood.jobs.ppi"
        shots={PPI_SHOTS}
        legal="Not a certified inspection and not legal advice. A folder so you can show a shop what you already saw."
      />
    </JobsShell>
  );
}
