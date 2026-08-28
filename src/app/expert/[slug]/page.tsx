import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpertShell } from "@/app/expert/_components/expert-shell";
import { PlaybookDetail } from "@/app/expert/_components/playbook-detail";
import { JsonLd } from "@/components/json-ld";
import { PageBrief } from "@/components/page-brief";
import { expertPlaybookSlugs, getExpertPlaybook, relatedExpertPlaybooks } from "@/app/expert/_data/book";
import { breadcrumbList, pageMeta } from "@/lib/seo";

const RESERVED = new Set(["tsb", "cheatsheet"]);

export function generateStaticParams() {
  return expertPlaybookSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const playbook = getExpertPlaybook(slug);
  if (!playbook) return { title: "Playbook not found" };
  return pageMeta({
    title: playbook.title,
    description: playbook.plainEnglish,
    path: `/expert/${playbook.slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();
  const playbook = getExpertPlaybook(slug);
  if (!playbook) notFound();
  return (
    <ExpertShell>
      <JsonLd
        data={breadcrumbList([
          { name: "Expert", path: "/expert" },
          { name: playbook.title, path: `/expert/${playbook.slug}` },
        ])}
      />
      <PageBrief href={`/expert/${playbook.slug}`} />
      <PlaybookDetail playbook={playbook} related={relatedExpertPlaybooks(playbook)} />
    </ExpertShell>
  );
}
