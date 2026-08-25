import type { Metadata } from "next";
import { MechanicPage } from "@/components/pages/mechanic-page";

export const metadata: Metadata = {
  title: "Mechanic mode",
  description: "Printable three-bullet counter script plus rotor and spec talking points.",
};

export default function Page() {
  return <MechanicPage />;
}
