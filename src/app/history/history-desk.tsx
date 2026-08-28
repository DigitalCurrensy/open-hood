"use client";

import { TitleSnapshotBay } from "@/app/history/title-snapshot";
import { useReadingLevel } from "@/components/reading-level";
import {
  HISTORY_API_PATH,
  HISTORY_LOG_HREF,
  HISTORY_NEXT_DESKS,
  HISTORY_PHOTO_VIN_HREF,
  HISTORY_PLATE_API_PATH,
  HISTORY_STATUS_API_PATH,
  mergeHistoryTimeline,
  type HistoryCatalog,
  type HistoryDossier,
  type HistoryEvent,
  type HistoryPlateDecode,
  type HistoryPlateStatus,
} from "@/lib/history";
import { useServiceLog } from "@/lib/service-log/store";
import { US_STATES } from "@/lib/us-states";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import { DEMO_VINS, isValidVin, normalizeVin } from "@/lib/vin";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import "./history.css";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";
const EXTERNAL = "noopener noreferrer";

export function HistoryDesk() {
  const [level] = useReadingLevel();
  const expert = level === "expert";
  const [vehicle] = useIdentifiedVehicle();
  const { entries } = useServiceLog();
  const search = useSearchParams();
  const queryVin = normalizeVin(search.get("vin") ?? "");

  const [vinDraft, setVinDraft] = useState(queryVin);
  const [plateDraft, setPlateDraft] = useState("");
  const [stateDraft, setStateDraft] = useState("");
  const [catalog, setCatalog] = useState<HistoryCatalog | null>(null);
  const [plateLive, setPlateLive] = useState<HistoryPlateStatus | null>(null);
  const [titleLive, setTitleLive] = useState(false);
  const [dossier, setDossier] = useState<HistoryDossier | null>(null);
  const [busy, setBusy] = useState<"vin" | "plate" | null>(null);
  const [fault, setFault] = useState("");
  const [plateNotice, setPlateNotice] = useState("");

  const vin = vinDraft || (vehicle?.specs.vin ? normalizeVin(vehicle.specs.vin) : "");
  const plate = plateDraft || (vehicle?.specs.plate ?? "").toUpperCase();
  const state = stateDraft || (vehicle?.specs.plateState ?? "").toUpperCase();

  useEffect(() => {
    let cancelled = false;
    const seeded = isValidVin(queryVin)
      ? fetch(HISTORY_API_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: queryVin }),
        }).then((res) => res.json())
      : Promise.resolve(null);

    void Promise.all([
      fetch(HISTORY_API_PATH, { cache: "no-store" }).then((res) => res.json()),
      fetch(HISTORY_STATUS_API_PATH, { cache: "no-store" }).then((res) => res.json()),
      seeded,
    ])
      .then(([body, status, pulled]: [HistoryCatalog, HistoryPlateStatus & { ok?: boolean }, HistoryDossier | { error?: string } | null]) => {
        if (cancelled) return;
        if (body.ok) setCatalog(body);
        if (body.ok && body.title) setTitleLive(Boolean(body.title.live));
        if (status.note) setPlateLive(status);
        if (pulled && "live" in pulled) setDossier(pulled);
        if (pulled && "error" in pulled && pulled.error) setFault(pulled.error);
      })
      .catch(() => {
        /* VIN lookup still tells the truth */
      });
    return () => {
      cancelled = true;
    };
  }, [queryVin]);

  const lookupVin = useCallback(async (raw: string) => {
    const next = normalizeVin(raw);
    if (!isValidVin(next)) {
      setFault("Enter a 17-character VIN. Letters I, O, and Q are never used.");
      return;
    }
    setBusy("vin");
    setFault("");
    setPlateNotice("");
    try {
      const response = await fetch(HISTORY_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: next }),
      });
      const body = (await response.json()) as HistoryDossier | { ok?: false; error?: string };
      if (!response.ok || !("live" in body)) {
        setFault(body && "error" in body && body.error ? body.error : "NHTSA could not decode that VIN.");
        return;
      }
      setVinDraft(next);
      setDossier(body);
    } catch {
      setFault("The jacket did not come back. Try the VIN again.");
    } finally {
      setBusy(null);
    }
  }, []);

  async function onVin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookupVin(vin);
  }

  async function onPlate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plateLive?.live) {
      setFault("Commercial plate-to-VIN is off. Photo the VIN on the bay.");
      return;
    }
    setBusy("plate");
    setFault("");
    setPlateNotice("");
    try {
      const response = await fetch(HISTORY_PLATE_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate, state }),
      });
      const body = (await response.json()) as HistoryPlateDecode | { ok?: false; error?: string };
      if (!response.ok || !("provider" in body)) {
        setFault(body && "error" in body && body.error ? body.error : "Plate decoder missed.");
        return;
      }
      setPlateNotice(body.notice);
      if (body.vin) setVinDraft(body.vin);
      if (body.dossier) setDossier(body.dossier);
    } catch {
      setFault("Plate decoder did not answer. Photo the VIN on the bay.");
    } finally {
      setBusy(null);
    }
  }

  const timeline = useMemo<HistoryEvent[]>(() => {
    if (!dossier) return [];
    return mergeHistoryTimeline(dossier.live.recalls, entries);
  }, [dossier, entries]);

  const sources = catalog?.sources ?? dossier?.sources ?? [];
  const liveSources = sources.filter((row) => row.lane === "live");
  const paidSources = sources.filter((row) => row.lane === "link-out");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <form className="rounded-sm border border-white/10 bg-bay-2/80 p-5" onSubmit={onVin}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Live · NHTSA vPIC</p>
            <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">The 17</h2>
            <p className="mt-2 text-sm leading-6 text-aluminum">
              {expert
                ? "DecodeVinValues. Trim and series are decoder fields. Campaigns are year/make/model, not VIN open/closed."
                : "Type the VIN from the door or the windshield. That unlocks what this bay can prove."}
            </p>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">VIN</span>
              <input
                name="vin"
                value={vin}
                onChange={(event) => {
                  setVinDraft(normalizeVin(event.target.value));
                  if (fault) setFault("");
                }}
                autoComplete="off"
                spellCheck={false}
                placeholder="1HGCM82633A004352"
                className={`${FIELD} vin-cell font-mono uppercase tracking-[0.18em]`}
              />
            </label>
            <button
              type="submit"
              disabled={busy !== null}
              className="mt-4 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
            >
              {busy === "vin" ? "Pulling NHTSA…" : "Decode identity"}
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEMO_VINS.map((row) => (
                <button
                  key={row.vin}
                  type="button"
                  onClick={() => {
                    setVinDraft(row.vin);
                    void lookupVin(row.vin);
                  }}
                  className="rounded-sm border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
                >
                  {row.label}
                </button>
              ))}
            </div>
          </form>

          <form className="rounded-sm border border-white/10 bg-bay-2/80 p-5" onSubmit={onPlate}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
              {plateLive?.live ? "Live · commercial plate" : "Link-out · plate is a note"}
            </p>
            <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">US plate</h2>
            <p className="mt-2 text-sm leading-6 text-aluminum">
              {plateLive?.live
                ? plateLive.note
                : "Commercial plate-to-VIN needs a paid decoder. No key on this machine — photo the VIN."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[7rem_1fr]">
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">State</span>
                <select
                  name="state"
                  value={state}
                  onChange={(event) => setStateDraft(event.target.value)}
                  className={FIELD}
                >
                  <option value="">State</option>
                  {US_STATES.map((row) => (
                    <option key={row.code} value={row.code}>
                      {row.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Plate</span>
                <input
                  name="plate"
                  value={plate}
                  onChange={(event) => setPlateDraft(event.target.value.toUpperCase())}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="7XER187"
                  className={`${FIELD} font-mono uppercase tracking-[0.16em]`}
                />
              </label>
            </div>
            {plateLive?.live ? (
              <button
                type="submit"
                disabled={busy !== null}
                className="mt-4 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
              >
                {busy === "plate" ? "Asking the decoder…" : "Decode plate"}
              </button>
            ) : (
              <Link
                href={HISTORY_PHOTO_VIN_HREF}
                className="mt-4 inline-block rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
              >
                Photo the VIN on the bay
              </Link>
            )}
            {plateNotice ? <p className="mt-3 text-sm leading-6 text-fluorescent">{plateNotice}</p> : null}
          </form>
        </div>

        <Ledger
          live={liveSources}
          paid={paidSources}
          plateLive={Boolean(plateLive?.live)}
          titleLive={titleLive}
          expert={expert}
        />
      </div>

      {fault ? (
        <p role="alert" className="rounded-sm border border-cone/40 bg-bay-2/80 px-4 py-3 text-sm leading-6 text-cone">
          {fault}
        </p>
      ) : null}

      <TitleSnapshotBay vin={isValidVin(vin) ? vin : ""} />

      {dossier ? (
        <DossierView dossier={dossier} timeline={timeline} logCount={entries.length} expert={expert} />
      ) : (
        <p className="text-sm leading-6 text-aluminum">
          No jacket yet. Decode a VIN — or stamp a line on the{" "}
          <Link href={HISTORY_LOG_HREF} className="text-ticket">
            service log
          </Link>{" "}
          so the timeline has owner ink when the 17 lands.
        </p>
      )}

      <nav aria-label="Next desks" className="flex flex-wrap gap-2">
        {HISTORY_NEXT_DESKS.map((desk) => (
          <Link
            key={desk.href}
            href={desk.href}
            className="rounded-sm border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
          >
            {desk.stamp}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Ledger({
  live,
  paid,
  plateLive,
  titleLive,
  expert,
}: {
  live: HistoryCatalog["sources"];
  paid: HistoryCatalog["sources"];
  plateLive: boolean;
  titleLive: boolean;
  expert: boolean;
}) {
  return (
    <aside className="history-jacket rounded-sm border border-white/10 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Live vs link-out</p>
      <h2 className="mt-1 font-display text-3xl uppercase leading-none">The split</h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        {expert
          ? "Left column is api.nhtsa.gov + this device. Right column is a purchase you make somewhere else."
          : "Green stripe is what we pull. Orange stripe is a report you buy. No fake wrecks in either pile."}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="history-live rounded-sm border border-white/10 bg-bay/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">Live here</p>
          <ul className="mt-2 space-y-2">
            {live.map((row) => (
              <li key={row.id}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fluorescent">{row.label}</p>
                <p className="text-xs leading-5 text-aluminum">
                  {row.id === "plate" && !plateLive
                    ? "Off until a commercial key is set."
                    : row.id === "title" && !titleLive
                      ? "Dark. Empty bay. Not a Carfax file."
                      : row.id === "title" && titleLive
                        ? "Keyed. Named VinAudit or CarsXE snapshot — still not a Carfax file."
                        : row.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="history-paid rounded-sm border border-white/10 bg-bay/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">Link-out</p>
          <ul className="mt-2 space-y-2">
            {paid.map((row) => (
              <li key={row.id}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fluorescent">{row.label}</p>
                <p className="text-xs leading-5 text-aluminum">{row.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function DossierView({
  dossier,
  timeline,
  logCount,
  expert,
}: {
  dossier: HistoryDossier;
  timeline: HistoryEvent[];
  logCount: number;
  expert: boolean;
}) {
  const specs = dossier.live.identity;
  const cells = (dossier.vin || "").padEnd(17, " ").slice(0, 17).split("");

  return (
    <div className="space-y-4">
      <section className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <div className="history-perforation -mx-5 -mt-5 mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Factory jacket · not a Carfax file</p>
        <h2 className="mt-1 font-display text-4xl uppercase leading-none">{dossier.headline}</h2>
        <div className="history-vin-cells mt-4 font-mono text-[11px] sm:text-sm">
          {cells.map((char, index) => (
            <span key={`${char}-${index}`} className="history-vin-cell">
              {char.trim() || "·"}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6">{dossier.disclaimer}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          {specs.manufacturer || "Manufacturer not on the decode"}
          {specs.plant ? ` · ${specs.plant}` : ""}
        </p>
      </section>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Options / packages</p>
        <h3 className="font-display text-2xl uppercase tracking-wide">Decoder trim, not window sticker</h3>
        <p className="mt-2 text-sm leading-6 text-aluminum">{dossier.live.optionsNote}</p>
        {dossier.live.options.length ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {dossier.live.options.map((row) => (
              <div key={row.id} className="min-w-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">{row.label}</dt>
                <dd className="mt-1 text-sm text-fluorescent">{row.value}</dd>
                {expert ? <dd className="text-xs text-aluminum">{row.note}</dd> : null}
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-aluminum">No trim or series on this decode.</p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <SafetyCard
          stamp="Recalls"
          title={`${dossier.live.recalls.length} campaigns`}
          body={
            dossier.live.recalls.length
              ? "Nameplate campaigns from api.nhtsa.gov. Close them on SaferCar with this VIN."
              : "NHTSA did not return a campaign list for that year / make / model."
          }
        >
          <ul className="mt-3 space-y-2 text-sm">
            {dossier.live.recalls.slice(0, expert ? 8 : 4).map((row) => (
              <li key={row.campaignNumber || row.component}>
                <p className="text-fluorescent">{row.component}</p>
                <p className="font-mono text-[11px] text-aluminum">{row.campaignNumber || "No campaign #"}</p>
              </li>
            ))}
          </ul>
        </SafetyCard>
        <SafetyCard
          stamp="Complaints"
          title={`${dossier.live.complaints.count} filed`}
          body={`Crash ${dossier.live.complaints.crash} · fire ${dossier.live.complaints.fire}. Other owners on this nameplate — not this VIN’s wrecks.`}
        >
          {dossier.live.complaints.topComponents.length ? (
            <p className="mt-3 text-sm text-aluminum">Top: {dossier.live.complaints.topComponents.join(" · ")}</p>
          ) : null}
        </SafetyCard>
        <SafetyCard
          stamp="NCAP"
          title={dossier.live.ncap[0] ? `Overall ${dossier.live.ncap[0].overall}` : "No stars on file"}
          body="Tested variant. A different cab or airbag pack can change the row."
        >
          <ul className="mt-3 space-y-1 text-sm text-fluorescent">
            {dossier.live.ncap.slice(0, 3).map((row) => (
              <li key={row.vehicleId}>
                {row.description || "variant"} · F {row.front} / S {row.side} / R {row.rollover}
              </li>
            ))}
          </ul>
        </SafetyCard>
      </div>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Merged timeline</p>
            <h3 className="font-display text-2xl uppercase tracking-wide">NHTSA + owner ink</h3>
            <p className="mt-1 text-sm leading-6 text-aluminum">
              Green is a campaign. Yellow is what you stamped on this device. No accident rows — we do not invent them.
            </p>
          </div>
          <Link
            href={HISTORY_LOG_HREF}
            className="rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
          >
            {logCount ? `${logCount} log ${logCount === 1 ? "line" : "lines"}` : "Open the notebook"}
          </Link>
        </div>
        {timeline.length === 0 ? (
          <p className="mt-4 text-sm text-aluminum">No campaigns and no owner lines yet.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {timeline.map((event) => (
              <li
                key={event.id}
                className={`rounded-sm border border-white/10 px-3 py-3 ${
                  event.kind === "owner-log" ? "history-line-owner" : "history-line"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">
                    {event.source} · {event.date}
                    {event.miles ? <span className="history-miles"> · {event.miles} mi</span> : null}
                  </p>
                  {event.campaignNumber ? (
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum">{event.campaignNumber}</p>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-fluorescent">{event.title}</p>
                {event.detail ? <p className="mt-1 text-sm leading-6 text-aluminum">{event.detail}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Title / brand / salvage</p>
        <h3 className="font-display text-2xl uppercase tracking-wide">What a report shows</h3>
        <p className="mt-2 text-sm leading-6 text-aluminum">{dossier.titleBrand.intro}</p>
        <div className="history-check mt-4 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-aluminum md:grid">
          <span>Item</span>
          <span>Paid report</span>
          <span>NHTSA / this bay</span>
        </div>
        <ul className="mt-2 space-y-3">
          {dossier.titleBrand.rows.map((row) => (
            <li key={row.id} className="history-check rounded-sm border border-white/10 px-3 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent">{row.label}</p>
              <p className="text-sm leading-6 text-aluminum">
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cone md:hidden">Paid</span>
                {row.paidReport}
              </p>
              <p className="text-sm leading-6 text-aluminum">
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ticket md:hidden">Here</span>
                {row.nhtsa}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="history-paid rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">NMVTIS · official</p>
          <h3 className="font-display text-2xl uppercase tracking-wide">Federal title snapshot</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-aluminum">
            {dossier.linkOut.nmvtis.explain.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {dossier.linkOut.nmvtis.links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel={EXTERNAL}
                className="rounded-sm border border-white/15 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ticket hover:border-ticket/50 hover:text-fluorescent"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section className="history-paid rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Paid reports · outbound</p>
          <h3 className="font-display text-2xl uppercase tracking-wide">Carfax / AutoCheck / NICB</h3>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            Consumer purchase or NICB form. VIN is in the Carfax / AutoCheck URL when we have 17 characters. We do not
            scrape their file. We do not invent accidents.
          </p>
          <ul className="mt-4 space-y-3">
            {dossier.linkOut.reports.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel={EXTERNAL}
                  className="font-mono text-[12px] uppercase tracking-[0.14em] text-ticket hover:text-fluorescent"
                >
                  {link.label}
                </a>
                <p className="text-sm leading-6 text-aluminum">
                  {link.kind === "vin" ? "VIN deep-link · " : "Portal · "}
                  {link.detail}
                </p>
              </li>
            ))}
            <li>
              <a
                href={dossier.linkOut.saferCarVin.href}
                target="_blank"
                rel={EXTERNAL}
                className="font-mono text-[12px] uppercase tracking-[0.14em] text-ticket hover:text-fluorescent"
              >
                {dossier.linkOut.saferCarVin.label}
              </a>
              <p className="text-sm leading-6 text-aluminum">{dossier.linkOut.saferCarVin.detail}</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function SafetyCard({
  stamp,
  title,
  body,
  children,
}: {
  stamp: string;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="history-live rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{stamp} · live</p>
      <h3 className="mt-1 font-display text-2xl uppercase tracking-wide">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-aluminum">{body}</p>
      {children}
    </section>
  );
}
