import { DeskBrief } from "@/app/trust/_components/desk-brief";
import { ReliabilityDesk } from "@/app/reliability/reliability-desk";
import { PageHeader } from "@/components/page-header";
import { RELIABILITY_BRIEF } from "@/config/nav/trust";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reliability file · how we count",
  description:
    "Complaint counts, not Consumer Reports. NHTSA SaferCar filings by component, mapped to playbooks. CR is a magazine we do not license.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <DeskBrief brief={RELIABILITY_BRIEF} beginnerHint="Beginner · file + one vote" expertHint="Expert · filings / year" />
      <PageHeader kicker="Reliability · published method" title="How we count">
        Complaint counts, not Consumer Reports. SaferCar filings by component, mapped to playbooks. CR is a magazine we
        do not license.
      </PageHeader>
      <ReliabilityDesk />
    </div>
  );
}
