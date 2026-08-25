import type { Metadata } from "next";
import { AdvisorDesk } from "@/app/jobs/_components/advisor-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "RO decoder",
  description: "Service advisor vocabulary: LOF, alignment, trans service — what the owner actually hears.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="03 · Service writer" title="RO decoder">
        LOF is oil. &quot;Due&quot; is not a millimeter. Pick the line you wrote.
      </PageHeader>
      <AdvisorDesk />
    </JobsShell>
  );
}
