import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { OwnerDesk } from "@/app/jobs/_components/owner-desk";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Owner checklist",
  description:
    "Station 04 on the ticket path: owner counter script before you authorize. Next is OSM rooftops (no book) or the print packet. We do not book the shop.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageBrief href="/jobs/owner" />
      <PageHeader kicker="Station 04 · counter script" title="Before you walk in">
        You are on the ticket path: quote flags already marked, or you write the sentence now. Do not approve until
        you can say the hold line. Next is OSM rooftops (no book) or the print packet. This desk does not book a
        shop.
      </PageHeader>
      <OwnerDesk />
    </JobsShell>
  );
}
