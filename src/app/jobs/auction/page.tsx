import type { Metadata } from "next";
import { AuctionDesk } from "@/app/jobs/_components/auction-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Auction lanes",
  description: "Public vs dealer lanes, fee gotchas, landed-cost desk. No live auction inventory.",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="10 · Auction / wholesale" title="Lane + landed cost">
        Public vs dealer is paperwork and a clock. Hammer is not the gate.
      </PageHeader>
      <AuctionDesk />
    </JobsShell>
  );
}
