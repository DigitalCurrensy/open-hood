import type { Metadata } from "next";
import { GaragePage } from "@/components/pages/garage-page";

export const metadata: Metadata = {
  title: "Spec sheet",
  description: "Factory-typical fluids, filters, and PSI on one shop ticket.",
};

export default function Page() {
  return <GaragePage />;
}
