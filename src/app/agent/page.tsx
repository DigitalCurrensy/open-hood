import { AdvocateDesk } from "@/components/agent/advocate-desk";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Ask",
  description:
    "Ask before you authorize. VIN, quote line, noise, or scanner code. Sentences for the counter — not a shop booking bot.",
  path: "/agent",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <AdvocateDesk />
    </div>
  );
}
