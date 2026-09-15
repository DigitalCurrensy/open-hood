import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SymptomsPage } from "@/components/pages/symptoms-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "What is that noise",
  description: "Pick the sound and when it happens. We give shop questions, not a parts list.",
  path: "/symptoms",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Sound + moment" title="What is that noise">
        Squeal when braking is not “buy pads.” We map the sound to questions the shop has to answer.
      </PageHeader>
      <SymptomsPage />
    </div>
  );
}
