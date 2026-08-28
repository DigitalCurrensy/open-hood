import { HistoryBrief } from "@/app/history/history-brief";
import { HistoryDesk } from "@/app/history/history-desk";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Identity / history",
  description:
    "NHTSA VIN decode, recalls, complaints, and NCAP on this desk. Not a Carfax file. Not Consumer Reports. VinAudit / CarsXE history only if a key is on. Carfax and NMVTIS stay paid link-outs.",
  path: "/history",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <HistoryBrief />
      <PageHeader kicker="Window 08 · the jacket" title="Identity / history">
        What NHTSA can prove on this VIN. Not a Carfax file. Title bay is empty unless VINAUDIT_API_KEY or a CarsXE
        history env is on. Carfax, AutoCheck, and NICB stay outbound. We do not invent accidents.
      </PageHeader>
      <Suspense
        fallback={
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-aluminum">Opening the jacket…</p>
        }
      >
        <HistoryDesk />
      </Suspense>
    </div>
  );
}
