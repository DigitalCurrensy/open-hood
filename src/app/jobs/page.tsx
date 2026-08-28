import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { Switchboard } from "@/app/jobs/_components/switchboard";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Job-role tools",
  description:
    "Who are you in the bay? Owner, writer, tech, parts, auction — each desk outputs a counter script, not a booking. No live dealer inventory.",
  path: "/jobs",
});

export default function Page() {
  return (
    <JobsShell>
      <PageBrief href="/jobs" />
      <PageHeader kicker="Clock-in · who are you" title="Job-role desks">
        Every person in the pipeline gets a script, not a booking button. The ticket path is the OS — roles hang
        off the counter script. Everyday owners first. No live dealer inventory. No marketplace.
      </PageHeader>
      <Switchboard />
    </JobsShell>
  );
}
