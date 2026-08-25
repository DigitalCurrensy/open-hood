import type { Metadata } from "next";
import { JobsObdDesk } from "@/app/jobs/_components/obd-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageHeader } from "@/components/page-header";
import { DTC_COUNT } from "@/lib/jobs/dtc-dictionary";

export const metadata: Metadata = {
  title: "OBD codes",
  description: "Type a P/B/C/U code. Layperson English, likely systems, do not throw parts.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <JobsShell>
      <PageHeader kicker={`Codes · ${DTC_COUNT} in the book`} title="Do not throw parts">
        The light is a pointer. P0420 is not automatically a converter. P0300 is not a coil kit.
      </PageHeader>
      <JobsObdDesk initialCode={code ?? ""} />
    </JobsShell>
  );
}
