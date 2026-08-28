import { ScanBrief } from "@/app/scan/scan-brief";
import { ScanDesk } from "@/app/scan/scan-desk";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live OBD",
  description:
    "Web Bluetooth ELM327 in Chrome on Android: RPM, speed, coolant, stored codes. iOS types the code. Not Snap-on. Not Autel.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <div className="space-y-6">
      <ScanBrief />
      <PageHeader kicker="Live OBD · generic PIDs" title="Scan bay">
        Chrome on Android can talk to a BLE ELM327. iOS Safari cannot. Type the code from any $20 scanner either way.
        This is not Snap-on or Autel coverage.
      </PageHeader>
      <ScanDesk initialCode={code ?? ""} />
    </div>
  );
}
