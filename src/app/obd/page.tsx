import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ObdDesk } from "@/components/obd-desk";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Type the code",
  description: "Type the five-character code from any $20 scanner. We translate it. iPhone Safari cannot pair Bluetooth — type it.",
  path: "/obd",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <div className="space-y-6">
      <PageHeader kicker="No dongle required" title="Type the code">
        Any $20 scanner. Five characters. We write what it means and what to ask before parts. iPhone Safari has no Web Bluetooth — type the code.
      </PageHeader>
      <ObdDesk initialCode={code ?? ""} />
    </div>
  );
}
