"use client";

import Link from "next/link";
import { SALES_DISCLOSURES } from "@/lib/jobs/checklists";
import { CheckDesk } from "@/app/jobs/_components/check-desk";

export function SalesDesk() {
  return (
    <div className="space-y-4">
      <article className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">F&amp;I · do not bury</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none">PPI first, products second</h2>
        <p className="mt-3 text-sm leading-6">
          Independent pre-purchase inspection — lift, scan, walk-around. We do not invent a live lot. If they skip the
          PPI, write that on the order. Add-ons are yes/no lines, not fine print.
        </p>
        <p className="mt-3 text-sm leading-6">
          Shot list lives at{" "}
          <Link href="/jobs/ppi" className="underline">
            /jobs/ppi
          </Link>
          .
        </p>
      </article>
      <CheckDesk
        storageKey="autoshield.jobs.sales"
        items={SALES_DISCLOSURES}
        readyLabel="Disclosures walked — they can still decline every product"
        blockedLabel="Don't send them to F&I until the add-ons have names"
      />
    </div>
  );
}
