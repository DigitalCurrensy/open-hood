import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideDetail } from "@/app/guides/[slug]/guide-detail";
import { JsonLd } from "@/components/json-ld";
import { PageBrief } from "@/components/page-brief";
import { allGuides, getGuide, relatedGuides } from "@/lib/guides/glossary";
import { breadcrumbList, howToJsonLd, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return allGuides().map((guide) => ({ slug: guide.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) {
    return { title: "Guide not found" };
  }
  return pageMeta({
    title: guide.title,
    description: guide.plainEnglish,
    path: `/guides/${guide.id}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const path = `/guides/${guide.id}`;
  return (
    <div className="space-y-6">
      <JsonLd
        data={breadcrumbList([
          { name: "Guides", path: "/guides" },
          { name: guide.title, path },
        ])}
      />
      <JsonLd
        data={howToJsonLd({
          name: guide.title,
          description: guide.plainEnglish,
          path,
          steps: guide.steps,
          tools: guide.toolsNeeded,
          supplies: guide.partsNeeded,
        })}
      />
      <PageBrief href="/guides" />
      <GuideDetail guide={guide} related={relatedGuides(guide)} />
    </div>
  );
}
