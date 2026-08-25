import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { GuidesIndex } from "@/app/guides/guides-index";
import { allGuides } from "@/lib/guides/glossary";

const COUNT = allGuides().length;

export const metadata: Metadata = {
  title: "How-to glossary",
  description:
    "Cars for dummies, next generation — real driveway and counter jobs mapped to verified how-to videos. Not a random dump.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker={`How-to · ${COUNT} jobs`} title="Cars for dummies">
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
