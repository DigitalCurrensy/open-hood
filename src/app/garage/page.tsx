import type { Metadata } from "next";
import { PageBrief } from "@/components/page-brief";
import { GaragePage } from "@/components/pages/garage-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Spec sheet",
  description:
    "Factory-typical oil, coolant, PSI, and filter notes on one card. Honda demo VIN 1HGCM82633A004352 stays 5W-20. Not a licensed Motor or TecDoc catalog.",
  path: "/garage",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBrief href="/garage" />
      <GaragePage />
    </div>
  );
}
