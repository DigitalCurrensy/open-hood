import { DeskBrief } from "@/app/trust/_components/desk-brief";
import { ValueDesk } from "@/app/value/value-desk";
import { PageHeader } from "@/components/page-header";
import { VALUE_BRIEF } from "@/config/nav/trust";
import { kbbKeyConfigured } from "@/lib/value";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Value band",
  description:
    "Year, make, model, miles, and condition → a transparent remaining-value band. KBB, Edmunds, and NADA are consumer search links. Illustration, not a Cox/KBB feed — unless a key is on this bay, and even then we do not invent their number.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <DeskBrief brief={VALUE_BRIEF} beginnerHint="Beginner · band + book links" expertHint="Expert · keep-rate math" />
      <PageHeader kicker="Value · not their book" title="Remaining-value band">
        Year, miles, and condition. A keep-rate you can read. Then open KBB, Edmunds, or NADA for their number.
      </PageHeader>
      <ValueDesk kbbConfigured={kbbKeyConfigured()} />
    </div>
  );
}
