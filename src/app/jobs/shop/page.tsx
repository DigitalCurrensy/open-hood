import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { ShopDesk } from "@/app/jobs/_components/shop-desk";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Shop quoting",
  description: "Fair quoting norms for an independent shop — diagnosis split, supplies disclosed, call before extras.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="07 · Independent shop" title="Fair quoting">
        Diagnosis is a line. Supplies have a number. Authorization is a ceiling, not a vibe.
      </PageHeader>
      <ShopDesk />
    </JobsShell>
  );
}
