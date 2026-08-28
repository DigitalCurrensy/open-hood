import { AdvocateDesk } from "@/components/agent/advocate-desk";
import { PageBrief } from "@/components/page-brief";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Advocate",
  description:
    "Ask before you authorize. The desk uses VIN, DTC, quote, fluids, guides, directory, recall, and MPG tools. Beginner or Expert — not a shop booking bot.",
  path: "/agent",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBrief href="/agent" />
      <AdvocateDesk />
    </div>
  );
}
