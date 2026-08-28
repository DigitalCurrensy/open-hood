import { LogBrief } from "@/app/log/log-brief";
import { LogDesk } from "@/app/log/log-desk";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service log",
  description:
    "Date, miles, and what was done — on this device. Open Findings when you want it on the customer copy.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <LogBrief />
      <PageHeader kicker="Owner notebook · this device" title="Service log">
        Date, miles, and what was done. The book stays on this phone. Open Findings when you want the printout.
      </PageHeader>
      <LogDesk />
    </div>
  );
}
