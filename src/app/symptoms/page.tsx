import type { Metadata } from "next";
import { SymptomsPage } from "@/components/pages/symptoms-page";

export const metadata: Metadata = {
  title: "Symptom wizard",
  description: "Map a noise and a moment to what the shop should actually inspect.",
};

export default function Page() {
  return <SymptomsPage />;
}
