import type { Metadata } from "next";
import { PageBrief } from "@/components/page-brief";
import { MechanicPage } from "@/components/pages/mechanic-page";
import { IosHonesty } from "./ios-honesty";

export const metadata: Metadata = {
  title: "Mechanic mode",
  description:
    "Printable counter script plus rotor millimeters. Android Chrome pairs a BLE ELM327. iOS Safari: no Web Bluetooth — type the code or use TestFlight native. Not on the App Store.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBrief href="/mechanic-mode" />
      <IosHonesty />
      <MechanicPage />
    </div>
  );
}
