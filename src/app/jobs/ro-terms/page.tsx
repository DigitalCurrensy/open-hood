import type { Metadata } from "next";
import { GlossaryDesk } from "@/app/jobs/_components/glossary-desk";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "RO glossary",
  description: "Invoice slang: LOF, MPI, R&R, NTF, shop supplies, while we're in there.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; term?: string; slug?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q || params.term || params.slug || "";
  return (
    <JobsShell>
      <PageBrief href="/jobs/ro-terms" />
      <PageHeader kicker="Invoice slang" title="RO terms">
        What the ticket means, what to say, and the trap on that line.
      </PageHeader>
      <GlossaryDesk initialQuery={initialQuery} />
    </JobsShell>
  );
}
