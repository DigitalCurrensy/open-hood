"use client";

import type { IdentifiedVehicle } from "@/lib/types";
import {
  groupRecallsByCampaign,
  saferCarCampaignHref,
  STILL_NOT_VIN_TRUE,
  VIN_OPEN_CLOSED_STAMP,
} from "@/lib/nhtsa";
import { explainRecall, nhtsaVinUrl, urgencyLabel } from "@/lib/recall-plain";
import { useMemo } from "react";

export function RecallsDesk({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const groups = useMemo(() => groupRecallsByCampaign(vehicle.recalls), [vehicle.recalls]);
  const vin = vehicle.specs.vin;

  if (groups.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-white/15 bg-bay-2/60 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Empty file</p>
        <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">No campaigns in this pull</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-aluminum">
          NHTSA returned no year / make / model rows. That is not a warranty. {VIN_OPEN_CLOSED_STAMP} {STILL_NOT_VIN_TRUE}
        </p>
        <a href={nhtsaVinUrl(vin)} className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.16em] text-ticket" rel="noreferrer">
          Check this VIN on SaferCar
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-ticket/40 bg-bay-2/80 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Nameplate list · grouped by campaign</p>
        <p className="mt-2 text-sm leading-6 text-aluminum">{VIN_OPEN_CLOSED_STAMP}</p>
        <p className="mt-2 text-sm leading-6 text-aluminum">{STILL_NOT_VIN_TRUE}</p>
        {vin ? (
          <a
            href={nhtsaVinUrl(vin)}
            className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
            rel="noreferrer"
          >
            SaferCar VIN deep link
          </a>
        ) : (
          <p className="mt-3 text-sm text-aluminum">Stamp a VIN on Identify if you want the official VIN tool.</p>
        )}
      </div>
      <p className="text-sm text-aluminum">
        {groups.length} campaign{groups.length === 1 ? "" : "s"} from NHTSA for this year/make/model. Open campaigns are
        free at the dealer. A shop quoting the same repair as paid work should show you why the VIN is not covered.
      </p>
      <ul className="space-y-4">
        {groups.map((group) => (
          <RecallCard
            key={group.campaignNumber || group.component}
            campaignNumber={group.campaignNumber}
            component={group.component}
            consequence={group.consequence}
            remedy={group.remedy}
            summary={group.summary}
            reportReceivedDate={group.reportReceivedDate}
            openedStamp={group.openedStamp}
            heuristicAsk={group.heuristicAsk}
            heuristicStamp={group.heuristicStamp}
            vin={vin}
          />
        ))}
      </ul>
    </div>
  );
}

function RecallCard({
  campaignNumber,
  component,
  consequence,
  remedy,
  summary,
  reportReceivedDate,
  openedStamp,
  heuristicAsk,
  heuristicStamp,
  vin,
}: {
  campaignNumber: string;
  component: string;
  consequence: string;
  remedy: string;
  summary: string;
  reportReceivedDate: string;
  openedStamp: string;
  heuristicAsk: boolean;
  heuristicStamp: string;
  vin: string;
}) {
  const explained = explainRecall(
    { campaignNumber, component, summary, consequence, remedy, reportReceivedDate },
    vin,
  );
  return (
    <article className="grid gap-4 rounded-sm border border-white/10 bg-bay-2/80 p-5 md:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">
          {campaignNumber || "No campaign #"} · {urgencyLabel(explained.urgency)}
        </p>
        <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">{component}</h3>
        {reportReceivedDate ? (
          <p className="mt-1 font-mono text-[11px] text-aluminum">Reported {reportReceivedDate}</p>
        ) : null}
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ticket">{openedStamp}</p>
        {heuristicAsk ? <p className="mt-1 text-sm leading-6 text-aluminum">{heuristicStamp}</p> : null}
        {consequence ? (
          <p className="mt-3 text-sm leading-6 text-aluminum">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Consequence · </span>
            {consequence}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-aluminum">{explained.meaning}</p>
        )}
        {summary ? <p className="mt-3 text-sm leading-6 text-fluorescent/80">{summary}</p> : null}
        {remedy ? (
          <p className="mt-3 text-sm leading-6 text-aluminum">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Remedy · </span>
            {remedy}
          </p>
        ) : null}
      </div>
      <aside className="ticket-paper rounded-sm p-4 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Say this at the dealer</p>
        <p className="mt-2 text-sm leading-6">{explained.atTheCounter}</p>
        <a
          href={saferCarCampaignHref(campaignNumber, vin)}
          className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.16em] underline"
          rel="noreferrer"
        >
          {vin ? "SaferCar with this VIN" : "Open this campaign on NHTSA"}
        </a>
      </aside>
    </article>
  );
}
