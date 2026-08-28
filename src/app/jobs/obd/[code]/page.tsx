import type { Metadata } from "next";
import { JobsObdDesk } from "@/app/jobs/_components/obd-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { JsonLd } from "@/components/json-ld";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { DTC_COUNT } from "@/lib/jobs/dtc-dictionary";
import { breadcrumbList, pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const stamp = decodeURIComponent(code).toUpperCase();
  return pageMeta({
    title: `${stamp} · OBD`,
    description: `Jobs-bay translation for ${stamp}. Android Chrome can pull Mode 03. iOS Safari: no Web Bluetooth — type the code or use TestFlight native.`,
    path: `/jobs/obd/${stamp}`,
  });
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const initialCode = decodeURIComponent(code).toUpperCase();

  return (
    <JobsShell>
      <JsonLd
        data={breadcrumbList([
          { name: "Jobs", path: "/jobs" },
          { name: "OBD", path: "/jobs/obd" },
          { name: initialCode, path: `/jobs/obd/${initialCode}` },
        ])}
      />
      <PageBrief href="/jobs/obd" />
      <PageHeader kicker={`Codes · ${DTC_COUNT} in the book`} title="Do not throw parts">
        Android Chrome can pull Mode 03 from a BLE ELM327. iOS Safari has no Web Bluetooth — type the code or use
        TestFlight native. P0420 is not a converter. P0300 is not a coil kit.
      </PageHeader>
      <JobsObdDesk initialCode={initialCode} />
    </JobsShell>
  );
}
