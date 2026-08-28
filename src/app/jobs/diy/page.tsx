import type { Metadata } from "next";
import { DiyDesk } from "@/app/jobs/_components/diy-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "DIY job card",
  description: "Weekend mechanic job cards: tools, torque mindset, safety. Use a chart. Don't guess.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageBrief href="/jobs/diy" />
      <PageHeader kicker="02 · Weekend mechanic" title="Job card">
        Tools, a torque mindset, and the safety that keeps a driveway job from becoming a tow.
      </PageHeader>
      <DiyDesk />
    </JobsShell>
  );
}
