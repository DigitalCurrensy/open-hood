import type { Metadata } from "next";
import { Suspense } from "react";
import { GuidesIndex } from "@/app/guides/guides-index";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { allGuides } from "@/lib/guides/glossary";
import { pageMeta } from "@/lib/seo";

const COUNT = allGuides().length;

export const metadata: Metadata = pageMeta({
  title: "How-to glossary",
  description:
    "Driveway and counter jobs with beginner steps, safety notes, and a verified video or an honest search link. Not a random dump. Not a shop booking page.",
  path: "/guides",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBrief href="/guides" />
      <PageHeader kicker={`How-to · ${COUNT} jobs`} title="How-to bay">
        Next generation. A searchable bay of jobs a non-mechanic can understand, each mapped to a real video — or a
        search link when one ID is not honest enough.
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
