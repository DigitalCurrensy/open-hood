import type { Metadata } from "next";
import { Suspense } from "react";
import { GuidesIndex } from "@/app/guides/guides-index";
import { PageHeader } from "@/components/page-header";
import { allGuides } from "@/lib/guides/glossary";
import { pageMeta } from "@/lib/seo";

const COUNT = allGuides().length;

export const metadata: Metadata = pageMeta({
  title: "How-to",
  description: "Driveway jobs with steps and shop questions. Not a booking page.",
  path: "/guides",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker={`${COUNT} jobs`} title="How-to">
        Cabin filter, oil, pads. Steps plus what to say if you take it to a shop.
      </PageHeader>
      <Suspense
        fallback={
          <div className="flex min-h-[30vh] items-center justify-center text-aluminum">
            <p className="font-mono text-sm uppercase tracking-[0.3em]">Pulling the book…</p>
          </div>
        }
      >
        <GuidesIndex />
      </Suspense>
    </div>
  );
}
