import type { Metadata } from "next";
import { Suspense } from "react";
import { FinderDesk } from "@/app/finder/_components/finder-desk";
import { FinderShell } from "@/app/finder/_components/finder-shell";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { FINDER_JOB_COUNT, normalizeFinderCode } from "@/lib/finder";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; q?: string; symptom?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const code = normalizeFinderCode(params.code ?? "");
  const q = (params.q ?? params.symptom ?? "").trim();
  if (code) {
    return pageMeta({
      title: `Fix Finder · ${code}`,
      description: `${code} → likely jobs → parts aisle. Diagnose first. Search URLs, not shelf count.`,
      path: "/finder",
      index: false,
    });
  }
  if (q) {
    return pageMeta({
      title: `Fix Finder · ${q}`,
      description: `${q} → likely jobs → parts aisle. DIY vs shop. Search URLs for this car.`,
      path: "/finder",
      index: false,
    });
  }
  return pageMeta({
    title: "Fix Finder",
    description:
      "Code or symptom → likely jobs → parts aisle. P0420 holds the converter. Search URLs, not TecDoc SKUs.",
    path: "/finder",
  });
}

export default function Page() {
  return (
    <FinderShell>
      <PageBrief href="/finder" />
      <PageHeader kicker={`Fix Finder · ${FINDER_JOB_COUNT} aisle tickets`} title="Code or symptom">
        Type what the scanner printed, or the smell / squeal. We name the jobs, then the boxes — and we hold the ones
        you should not throw.
      </PageHeader>
      <Suspense
        fallback={
          <div className="flex min-h-[30vh] items-center justify-center text-aluminum">
            <p className="font-mono text-sm uppercase tracking-[0.3em]">Walking the aisle…</p>
          </div>
        }
      >
        <FinderDesk />
      </Suspense>
    </FinderShell>
  );
}
