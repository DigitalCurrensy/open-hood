import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { SalesDesk } from "@/app/jobs/_components/sales-desk";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Dealer sales / F&I",
  description: "What not to bury in F&I. PPI reminder. Add-ons are yes/no lines.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="06 · Dealer sales" title="Don't bury it in F&I">
        PPI on paper. Products have names. Decline is a complete sentence.
      </PageHeader>
      <SalesDesk />
    </JobsShell>
  );
}
