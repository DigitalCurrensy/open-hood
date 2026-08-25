"use client";

import type { IdentifiedVehicle, RecallRecord } from "@/lib/types";
import { explainRecall, nhtsaVinUrl, urgencyLabel } from "@/lib/recall-plain";

export function RecallsDesk({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const recalls = vehicle.recalls;

  if (recalls.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-white/15 bg-bay-2/60 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Empty file</p>
        <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">No campaigns in this pull</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-aluminum">
          NHTSA returned no rows for this year, make, and model. That is not a warranty. Confirm against the VIN on
          NHTSA&apos;s own site — campaigns can be VIN-specific.
        </p>
        <a
          href={nhtsaVinUrl(vehicle.specs.vin)}
          className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.16em] text-ticket"
          rel="noreferrer"
        >
          Check this VIN on NHTSA
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-aluminum">
        {recalls.length} campaign{recalls.length === 1 ? "" : "s"} from NHTSA for this year/make/model. Open campaigns
        are free at the dealer. A shop quoting the same repair as paid work should show you why the VIN is not covered.
      </p>
      <a
        href={nhtsaVinUrl(vehicle.specs.vin)}
        className="inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
        rel="noreferrer"
      >
        Official VIN lookup on NHTSA
      </a>
      <ul className="space-y-4">
        {recalls.map((recall) => (
          <RecallCard key={recall.campaignNumber || recall.component} recall={recall} vin={vehicle.specs.vin} />
        ))}
      </ul>
    </div>
  );
}

function RecallCard({ recall, vin }: { recall: RecallRecord; vin: string }) {
  const explained = explainRecall(recall, vin);
  return (
    <article className="grid gap-4 rounded-sm border border-white/10 bg-bay-2/80 p-5 md:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">
          {recall.campaignNumber || "No campaign #"} · {urgencyLabel(explained.urgency)}
        </p>
        <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">{recall.component}</h3>
        {recall.reportReceivedDate ? (
          <p className="mt-1 font-mono text-[11px] text-aluminum">Reported {recall.reportReceivedDate}</p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-aluminum">{explained.meaning}</p>
        {recall.summary ? <p className="mt-3 text-sm leading-6 text-fluorescent/80">{recall.summary}</p> : null}
        {recall.remedy ? (
          <p className="mt-3 text-sm leading-6 text-aluminum">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Remedy · </span>
            {recall.remedy}
          </p>
        ) : null}
      </div>
      <aside className="ticket-paper rounded-sm p-4 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Say this at the dealer</p>
        <p className="mt-2 text-sm leading-6">{explained.atTheCounter}</p>
        <a
          href={explained.nhtsaSearch}
          className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.16em] underline"
          rel="noreferrer"
        >
          Open this campaign on NHTSA
        </a>
      </aside>
    </article>
  );
}
