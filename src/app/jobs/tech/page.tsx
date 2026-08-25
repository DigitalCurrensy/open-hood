import type { Metadata } from "next";
import { JobsShell } from "@/app/jobs/_components/jobs-shell";
import { TechDesk } from "@/app/jobs/_components/tech-desk";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Tech desk",
  description: "What the customer will ask, and a pad for millimeters — rotors are not 'due.'",
};

export default function Page() {
  return (
    <JobsShell>
      <PageHeader kicker="04 · Technician / ASE" title="Numbers, not adjectives">
        They will ask for the test. Write mm on the rotors. We do not invent the book spec.
      </PageHeader>
      <TechDesk />
    </JobsShell>
  );
}
