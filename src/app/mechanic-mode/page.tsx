import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { MechanicPage } from "@/components/pages/mechanic-page";
import { IosHonesty } from "./ios-honesty";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "What to say",
  description: "Three sentences for the service writer. Then decide. Not an App Store product.",
  path: "/mechanic-mode",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Three lines" title="What to say">
        Write them on the RO or say them. iPhone Safari: type the scanner code. No App Store listing.
      </PageHeader>
      <IosHonesty />
      <MechanicPage />
    </div>
  );
}
