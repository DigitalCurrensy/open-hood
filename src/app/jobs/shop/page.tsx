import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { ShopDesk } from "@/app/jobs/_components/shop-desk";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Shop quoting",
  description:
    "Fair quoting script for an independent shop — diagnosis split, supplies disclosed, authorization ceiling. Not a marketplace listing.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageBrief href="/jobs/shop" />
      <PageHeader kicker="07 · Independent shop" title="Fair quoting">
        Diagnosis is a line. Supplies have a number. Read the ceiling out loud. We do not list you as a bookable
        bay.
      </PageHeader>
      <ShopDesk />
    </JobsShell>
  );
}
