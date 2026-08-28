import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlossaryDesk } from "@/app/jobs/_components/glossary-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { JsonLd } from "@/components/json-ld";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { getRoTerm } from "@/lib/jobs/glossary";
import { breadcrumbList, pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = getRoTerm(decodeURIComponent(slug));
  if (!term) return { title: "RO term not found" };
  return pageMeta({
    title: `${term.term} · RO glossary`,
    description: term.means,
    path: `/jobs/ro-terms/${term.slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = getRoTerm(decodeURIComponent(slug));
  if (!term) notFound();

  return (
    <JobsShell>
      <JsonLd
        data={breadcrumbList([
          { name: "Jobs", path: "/jobs" },
          { name: "RO glossary", path: "/jobs/ro-terms" },
          { name: term.term, path: `/jobs/ro-terms/${term.slug}` },
        ])}
      />
      <PageBrief href="/jobs/ro-terms" />
      <PageHeader kicker="Invoice slang" title={term.term}>
        {term.means}
      </PageHeader>
      <GlossaryDesk initialQuery={term.slug} kicker={`Focused on ${term.term}`} />
    </JobsShell>
  );
}
