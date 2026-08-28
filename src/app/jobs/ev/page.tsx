import type { Metadata } from "next";
import { EvDesk } from "@/app/jobs/_components/ev-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "EV owner desk",
  description: "12V, tires, brakes, cabin, coolant loops. There is no oil change.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageBrief href="/jobs/ev" />
      <PageHeader kicker="12 · EV owner" title="No oil change">
        The 12-volt still dies. Tires still wear. Brake fluid still ages. Decline the ICE menu.
      </PageHeader>
      <EvDesk />
    </JobsShell>
  );
}
