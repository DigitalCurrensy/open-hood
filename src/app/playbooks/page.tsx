import type { Metadata } from "next";
import Link from "next/link";
import { TicketPath } from "@/app/_components/ticket-path";
import { PageHeader } from "@/components/page-header";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Playbooks, not a cart",
  description:
    "Owner playbooks on the ticket path. Open Hood sends a script — not RepairPal, YourMechanic, or AutoZone. No book-this-shop button.",
  path: "/playbooks",
});

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Operating path · station 04" title="Playbooks, not a cart">
        Named situations feed the counter script. RepairPal routes a shop. YourMechanic sends a person. AutoZone
        sells the SKU. We print the sentence.
      </PageHeader>

      <TicketPath current="script" />

      <article className="ticket-paper rounded-sm p-6 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">What you walk out with</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none">Say-this, not book-this</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6">
          A playbook is a named jam on the ticket path — brakes, a light, a quote — not an aisle of parts and not
          a shop network. After you say the lines, OSM rooftops are a map. The print packet is paper at the window.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-6">
          This page does not invent a cart, a booking button, or a review wall. Do not approve until you can say the
          hold line.
        </p>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em]">
          <Link href="/expert" className="rounded-sm bg-bay px-4 py-2 text-fluorescent">
            Open the playbook aisle
          </Link>
          {" · "}
          <Link href="/jobs/owner" className="underline">
            Owner script
          </Link>
          {" · "}
          <Link href="/quote#compare-3" className="underline">
            Compare three ROs
          </Link>
          {" · "}
          <Link href="/trust#hold" className="underline">
            Do not approve until
          </Link>
          {" · "}
          <Link href="/report" className="underline">
            Print packet
          </Link>
        </p>
      </article>
    </div>
  );
}
