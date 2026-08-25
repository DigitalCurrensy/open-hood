import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { Switchboard } from "@/app/jobs/_components/switchboard";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Job-role tools",
  description: "Who are you in the bay? Owner, writer, tech, parts, auction — a working desk each, under 30 seconds.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="Clock-in · who are you" title="Job-role desks">
        Every person in the pipeline gets a tool, not a brochure. Everyday owners first. No live dealer inventory.
      </PageHeader>
      <Switchboard />
    </JobsShell>
  );
}
