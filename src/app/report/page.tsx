import { ReportDesk } from "@/components/report/report-desk";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Open Hood findings",
  },
  description:
    "Customer copy of the bay: vehicle, quote flags, and what to say at the counter. Print it or download the packet. We do not invent a ticket.",
};

export default function Page() {
  return <ReportDesk />;
}
