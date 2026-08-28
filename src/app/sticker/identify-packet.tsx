import { saferCarCampaignHref, type IdentificationPacket } from "@/lib/nhtsa";
import Link from "next/link";

export function IdentifyPacket({ packet }: { packet: IdentificationPacket }) {
  const { specs, engine, campaigns, complaints, saferCarUrl, stamp, headline, checkDigit, wmi, completeness } =
    packet;

  return (
    <section className="space-y-4" aria-label="Identification packet">
      <div className="rounded-sm border border-ticket/40 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Identification packet</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none text-fluorescent">{headline || "No nameplate"}</h2>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum">
          {specs.vin ? `VIN ${specs.vin}` : "No VIN — year / make / model only"}
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Stamp label="Decode" value={[specs.year, specs.make, specs.model].filter(Boolean).join(" ") || "—"} />
          <Stamp label="Engine / displacement" value={engine.line || engine.displacement || "—"} />
          <Stamp
            label="NHTSA complaints"
            value={
              complaints.count
                ? `${complaints.count} filed · crash ${complaints.crash} · fire ${complaints.fire}`
                : "None in this pull"
            }
          />
          <Stamp label="Nameplate campaigns" value={`${packet.campaignCount} grouped by campaign #`} />
          <Stamp
            label="Check digit"
            value={
              checkDigit.ready
                ? checkDigit.ok
                  ? `Pass · pos 9 is ${checkDigit.actual}`
                  : `Fail · saw ${checkDigit.actual || "—"}, expected ${checkDigit.expected || "—"}`
                : "Need 17"
            }
          />
          <Stamp
            label="vPIC completeness"
            value={`${completeness.percent} · ${completeness.populated}/${completeness.considered} fields`}
          />
        </dl>
        {complaints.topComponents.length ? (
          <p className="mt-3 text-sm leading-6 text-aluminum">
            Top complaint parts: {complaints.topComponents.slice(0, 3).join(" · ")}
          </p>
        ) : null}
        {wmi.stamp ? <p className="mt-3 text-sm leading-6 text-aluminum">{wmi.stamp}</p> : null}
        {checkDigit.stamp ? (
          <p
            className={`identify-stamp mt-3 rounded-sm border px-3 py-2 font-mono text-[11px] uppercase leading-5 tracking-[0.12em] ${
              checkDigit.ok ? "border-ticket/50 text-ticket" : "border-cone/60 text-cone"
            }`}
          >
            {checkDigit.stamp}
          </p>
        ) : null}
        <p className="identify-stamp mt-3 rounded-sm border border-grease/50 px-3 py-2 font-mono text-[11px] uppercase leading-5 tracking-[0.12em] text-ticket">
          {stamp}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-aluminum">
          {packet.vendorFile ? "Campaign source · vendor file" : "Campaign source · year / make / model"}
        </p>
        <p className="mt-2 text-sm leading-6 text-aluminum">{packet.stillNotVinTrue}</p>
        <p className="mt-2 text-sm leading-6 text-aluminum">{completeness.stamp}</p>
        {packet.plateFormat?.stamp ? (
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {packet.plateFormat.stamp}. {packet.plateFormat.note}
          </p>
        ) : null}
        {specs.vin ? (
          <a
            href={saferCarUrl}
            rel="noreferrer"
            className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
          >
            SaferCar VIN deep link
          </a>
        ) : (
          <p className="mt-3 text-sm text-aluminum">Stamp a VIN to unlock the official SaferCar VIN tool.</p>
        )}
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Packet desks">
          {specs.vin ? (
            <Link
              href={`/vin?vin=${specs.vin}`}
              className="rounded-sm border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent"
            >
              VIN packet
            </Link>
          ) : null}
          <Link
            href={specs.vin ? `/sticker?vin=${specs.vin}` : "/sticker"}
            className="rounded-sm border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum"
          >
            Decoder sticker
          </Link>
          <Link
            href="/recalls"
            className="rounded-sm border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum"
          >
            Recall desk
          </Link>
        </nav>
      </div>

      {campaigns.length ? (
        <ol className="space-y-3">
          {campaigns.map((group) => (
            <li key={group.campaignNumber || group.component} className="rounded-sm border border-white/10 bg-bay-2/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">
                {group.campaignNumber || "No campaign #"}
              </p>
              <h3 className="mt-1 font-display text-xl uppercase tracking-wide text-fluorescent">{group.component}</h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ticket">{group.openedStamp}</p>
              {group.heuristicAsk ? (
                <p className="mt-1 text-sm leading-6 text-aluminum">{group.heuristicStamp}</p>
              ) : null}
              {group.consequence ? (
                <p className="mt-2 text-sm leading-6 text-aluminum">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ticket">Consequence · </span>
                  {group.consequence}
                </p>
              ) : null}
              {group.remedy ? (
                <p className="mt-2 text-sm leading-6 text-aluminum">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ticket">Remedy · </span>
                  {group.remedy}
                </p>
              ) : null}
              <a
                href={saferCarCampaignHref(group.campaignNumber, specs.vin)}
                rel="noreferrer"
                className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
              >
                {specs.vin ? "SaferCar with this VIN" : "Open this campaign on NHTSA"}
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-sm border border-dashed border-white/15 px-4 py-3 text-sm leading-6 text-aluminum">
          NHTSA returned no year/make/model campaigns in this pull. That is not a close-out. Check SaferCar if you have
          the VIN.
        </p>
      )}
    </section>
  );
}

function Stamp({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-5 text-fluorescent">{value}</dd>
    </div>
  );
}
