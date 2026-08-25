import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideDetail } from "@/app/guides/[slug]/guide-detail";
import { allGuides, getGuide, relatedGuides } from "@/lib/guides/glossary";

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
  return {
    title: guide.title,
    description: guide.plainEnglish,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuideDetail guide={guide} related={relatedGuides(guide)} />;
}
