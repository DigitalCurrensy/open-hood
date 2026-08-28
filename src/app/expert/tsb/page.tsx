import type { Metadata } from "next";
import { ExpertShell } from "@/app/expert/_components/expert-shell";
import { TsbDesk } from "@/app/expert/_components/tsb-desk";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { EXPERT_TSB_COUNT } from "@/app/expert/_data/book";

export const metadata: Metadata = {
  title: "Failure patterns",
  description:
    "Common failure patterns by symptom with NHTSA SaferCar pointers. Not pirated TSB PDFs. Honda Accord 2003 Takata is a campaign lookup.",
};

export default function Page() {
  return (
    <ExpertShell>
      <PageBrief href="/expert/tsb" />
      <PageHeader kicker={`Patterns · ${EXPERT_TSB_COUNT} cards`} title="By symptom, not a stolen TSB">
        Public campaigns and owner-known patterns. Link SaferCar. A 2003 Accord Takata inflator is a VIN lookup, not a
        yard airbag.
      </PageHeader>
      <TsbDesk />
    </ExpertShell>
  );
}
