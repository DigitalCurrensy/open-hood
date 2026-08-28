import type { Metadata } from "next";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { ObdDesk } from "@/components/obd-desk";

export const metadata: Metadata = {
  title: "OBD codes",
  description:
    "Chrome on Android can pair a BLE ELM327 and read stored codes. iOS Safari: no Web Bluetooth — type the code or use TestFlight native. Then take it to quote defense.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <div className="space-y-6">
      <PageBrief href="/obd" />
      <PageHeader kicker="Scanner copy" title="OBD-II translator">
        Chrome on Android can pair a BLE ELM327. iOS Safari has no Web Bluetooth — type the code or use TestFlight
        native. Same English either way. Not a parts catalog.
      </PageHeader>
      <ObdDesk initialCode={code ?? ""} />
    </div>
  );
}
