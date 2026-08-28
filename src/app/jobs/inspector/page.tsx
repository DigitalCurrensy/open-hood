import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PhotoDesk } from "@/app/jobs/_components/photo-desk";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { INSPECTOR_SHOTS } from "@/lib/jobs/checklists";

export const metadata: Metadata = {
  title: "Inspector walk-around",
  description: "PPI / lemon-law adjacent shot list. Document dates and miles. Not legal advice.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageBrief href="/jobs/inspector" />
      <PageHeader kicker="09 · Inspector" title="Walk-around file">
        Same concern, new miles, dated folder. We do not file a claim or give legal advice.
      </PageHeader>
      <PhotoDesk
        storageKey="openhood.jobs.inspector"
        shots={INSPECTOR_SHOTS}
        legal="Not legal advice. Not a lemon-law filing. A photo list for a paper trail you already have."
      />
    </JobsShell>
  );
}
