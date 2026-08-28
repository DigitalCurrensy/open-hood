import type { Metadata } from "next";
import { Suspense } from "react";
import { ExpertShell } from "@/app/expert/_components/expert-shell";
import { PlaybookIndex } from "@/app/expert/_components/playbook-index";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { EXPERT_PLAYBOOK_COUNT, EXPERT_TSB_COUNT } from "@/app/expert/_data/book";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Scenario playbooks",
  description:
    "Beginner script plus measurements for the situations owners actually hit. Not a shop marketplace. Not a stolen TSB book.",
  path: "/expert",
});

export default function Page() {
  return (
    <ExpertShell>
      <PageBrief href="/expert" />
      <PageHeader kicker={`Expert · ${EXPERT_PLAYBOOK_COUNT} playbooks`} title="Beginner + master tech">
        Owner jobs with steps and a say-this script. Left column is what a non-mechanic does. Right column is what the
        millimeter means. Failure patterns live on SaferCar — not a pirated dealer PDF. {EXPERT_TSB_COUNT} public
        pattern cards.
      </PageHeader>
      <Suspense
        fallback={
          <div className="flex min-h-[30vh] items-center justify-center text-aluminum">
            <p className="font-mono text-sm uppercase tracking-[0.3em]">Pulling the playbooks…</p>
          </div>
        }
      >
        <PlaybookIndex />
      </Suspense>
    </ExpertShell>
  );
}
