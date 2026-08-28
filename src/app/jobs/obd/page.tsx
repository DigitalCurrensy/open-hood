import type { Metadata } from "next";
import { JobsObdDesk } from "@/app/jobs/_components/obd-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { DTC_COUNT } from "@/lib/jobs/dtc-dictionary";

export const metadata: Metadata = {
  title: "OBD codes",
  description:
    "Android Chrome reads stored DTCs from a BLE ELM327. iOS Safari: no Web Bluetooth — type the code or use TestFlight native. Do not throw parts.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <JobsShell>
      <PageBrief href="/jobs/obd" />
      <PageHeader kicker={`Codes · ${DTC_COUNT} in the book`} title="Do not throw parts">
        Android Chrome can pull Mode 03 from a BLE ELM327. iOS Safari has no Web Bluetooth — type the code or use
        TestFlight native. P0420 is not a converter. P0300 is not a coil kit.
      </PageHeader>
      <JobsObdDesk initialCode={code ?? ""} />
    </JobsShell>
  );
}
