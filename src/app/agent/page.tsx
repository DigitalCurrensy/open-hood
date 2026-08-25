import { AdvocateDesk } from "@/components/agent/advocate-desk";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advocate",
  description:
    "Ask a master mechanic advocate before you authorize a repair. Quote scripts, symptom questions, and OBD in plain English.",
};

export default function Page() {
  return <AdvocateDesk />;
}
