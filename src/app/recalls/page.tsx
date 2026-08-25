import type { Metadata } from "next";
import { RecallsPage } from "@/components/pages/recalls-page";

export const metadata: Metadata = {
  title: "Recalls",
  description: "NHTSA campaigns in plain English — what it means and what to say at the dealer.",
};

export default function Page() {
  return <RecallsPage />;
}
