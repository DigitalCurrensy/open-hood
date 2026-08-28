import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinderAislePage } from "@/app/finder/_components/finder-aisle-page";
import { FinderShell } from "@/app/finder/_components/finder-shell";
import { JsonLd } from "@/components/json-ld";
import { PageBrief } from "@/components/page-brief";
import { decorateJob, getJob, jobSlugs } from "@/lib/finder";
import { breadcrumbList, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return jobSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) return { title: "Aisle not found" };
  return pageMeta({
    title: `Fix Finder · ${job.stamp}`,
    description: job.plainEnglish,
    path: `/finder/${job.slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) notFound();
  const decorated = decorateJob(job);
  return (
    <FinderShell>
      <JsonLd
        data={breadcrumbList([
          { name: "Fix Finder", path: "/finder" },
          { name: job.title, path: `/finder/${job.slug}` },
        ])}
      />
      <PageBrief href="/finder" />
      <FinderAislePage
        job={decorated.job}
        aisle={decorated.aisle}
        parts={decorated.parts}
        related={decorated.related}
      />
    </FinderShell>
  );
}
