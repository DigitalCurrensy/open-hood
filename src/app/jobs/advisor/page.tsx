import type { Metadata } from "next";
import { AdvisorDesk } from "@/app/jobs/_components/advisor-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "RO decoder",
  description:
    "Service advisor counter script: LOF, alignment, trans service — what the owner hears, and the sentence to say instead. Not a booking desk.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageBrief href="/jobs/advisor" />
      <PageHeader kicker="03 · Service writer" title="RO decoder">
        LOF is oil. &quot;Due&quot; is not a millimeter. Pick the line you wrote. Walk out with a script, not a
        booking.
      </PageHeader>
      <AdvisorDesk />
    </JobsShell>
  );
}
