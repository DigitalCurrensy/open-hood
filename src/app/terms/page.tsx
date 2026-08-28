import { TermsDesk } from "@/app/terms/terms-desk";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Terms of use",
  description:
    "The rules of this bay in plain English. Free, no account, no cut of the repair. We are not your inspector, your tech, or your lawyer.",
  path: "/terms",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Paperwork 01 · terms" title="Terms of use">
        The rules of this bay, in the same plain English we use at the counter. Read them once. Nothing here needs
        an account.
      </PageHeader>
      <TermsDesk />
    </div>
  );
}
