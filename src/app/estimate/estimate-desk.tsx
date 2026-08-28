"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ESTIMATE_NEXT_DESKS } from "@/config/nav/estimate";
import { useReadingLevel } from "@/components/reading-level";
import {
  ESTIMATE_API_PATH,
  JOB_COUNT,
  allJobs,
  formatHours,
  formatMoney,
  formatRange,
  formatRate,
  parseQuotedTotal,
  type EstimatePayload,
} from "@/lib/labor";
import { POPULAR_MAKES } from "@/lib/us-states";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import "./estimate.css";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

const YEARS = Array.from({ length: 38 }, (_, index) => String(new Date().getFullYear() + 1 - index));

const JOBS = allJobs();

export function EstimateDesk({
  initialZip = "",
  initialJob = "pads",
  initialYear = "",
  initialMake = "",
  initialModel = "",
  initialQuoted = "",
}: {
  initialZip?: string;
  initialJob?: string;
  initialYear?: string;
  initialMake?: string;
  initialModel?: string;
  initialQuoted?: string;
}) {
  const [level] = useReadingLevel();
  const expert = level === "expert";
  const [vehicle] = useIdentifiedVehicle();
  const [zip, setZip] = useState(initialZip);
  const [job, setJob] = useState(initialJob || "pads");
  const [yearDraft, setYear] = useState(initialYear);
  const [makeDraft, setMake] = useState(initialMake);
  const [modelDraft, setModel] = useState(initialModel);
  const [quoteText, setQuoteText] = useState(initialQuoted);
  const [payload, setPayload] = useState<EstimatePayload | null>(null);
  const [fault, setFault] = useState("");
  const [busy, setBusy] = useState(false);
  const year = yearDraft || vehicle?.specs.year || "";
  const make = makeDraft || vehicle?.specs.make || "";
  const model = modelDraft || vehicle?.specs.model || "";

  const quoted = useMemo(() => parseQuotedTotal(quoteText), [quoteText]);
  const zipReady = zip.replace(/\D/g, "").length >= 5;

  async function runBand(next = { zip, job, year, make, model, quoted }) {
    const digits = next.zip.replace(/\D/g, "");
    if (digits.length < 5) {
      setFault("Need a 5-digit US ZIP.");
      setPayload(null);
      return;
    }
    if (!next.job) {
      setFault("Pick a job from the catalog.");
      return;
    }

    setBusy(true);
    setFault("");
    const params = new URLSearchParams({ zip: digits, job: next.job });
    if (next.year.trim()) params.set("year", next.year.trim());
    if (next.make.trim()) params.set("make", next.make.trim());
    if (next.model.trim()) params.set("model", next.model.trim());
    if (next.quoted != null) params.set("quoted", String(next.quoted));

    try {
      const response = await fetch(`${ESTIMATE_API_PATH}?${params}`, { cache: "no-store" });
      const body = (await response.json()) as EstimatePayload & { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not price that job.");
      setPayload(body);
      const url = `/estimate?${params}`;
      window.history.replaceState(null, "", url);
    } catch (error) {
      setPayload(null);
      setFault(error instanceof Error ? error.message : "Could not price that job.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!zipReady || !job) return;
    const handle = window.setTimeout(() => {
      void runBand({ zip, job, year, make, model, quoted });
    }, 280);
    return () => window.clearTimeout(handle);
    // Intentionally key off the fields the API prices from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip, job, year, make, model, quoted, zipReady]);

  const sessionTitle = vehicle
    ? [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ")
    : "";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form
        className="estimate-carbon rounded-sm border border-white/10 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void runBand({ zip, job, year, make, model, quoted });
        }}
      >
        <div className="estimate-perforation -mx-5 -mt-5 mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
          {expert ? "Hours × door rate" : "One range for the window"}
        </p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">Write the job</h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          {expert
            ? "ZIP3 picks rural, midwest, sunbelt, mountain, or coast. Dealer is the indie band times that region’s multiplier. Not a Motor book."
            : "Pick the job. Type the ZIP. The yellow copy is the independent number you walk in with."}
        </p>

        {sessionTitle ? (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
            On the bay · {sessionTitle}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-aluminum">
            No car in session. Year and make are optional — without them this is a civic-class book.
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Year</span>
            <select value={year} onChange={(event) => setYear(event.target.value)} className={FIELD}>
              <option value="">Year</option>
              {YEARS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Make</span>
            <input
              list="estimate-makes"
              value={make}
              onChange={(event) => setMake(event.target.value)}
              placeholder="Honda"
              className={FIELD}
            />
            <datalist id="estimate-makes">
              {POPULAR_MAKES.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Model</span>
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Accord"
              className={FIELD}
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">ZIP</span>
          <input
            required
            name="zip"
            inputMode="numeric"
            autoComplete="postal-code"
            value={zip}
            onChange={(event) => setZip(event.target.value)}
            placeholder="90210"
            className={`${FIELD} estimate-dollars`}
          />
        </label>

        <fieldset className="mt-4">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">
            Job · {JOB_COUNT} in the book
          </legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {JOBS.map((row) => (
              <button
                key={row.id}
                type="button"
                data-active={job === row.slug}
                className="estimate-chip rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-fluorescent"
                onClick={() => setJob(row.slug)}
              >
                {row.stamp}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">
            Shop quote · optional
          </span>
          <textarea
            name="quote"
            rows={3}
            value={quoteText}
            onChange={(event) => setQuoteText(event.target.value)}
            placeholder={"Brake pads $890"}
            className={FIELD}
          />
        </label>

        {fault ? (
          <p role="alert" className="mt-3 text-sm leading-6 text-cone">
            {fault}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
        >
          {busy ? "Pulling the band…" : "Run the band"}
        </button>
      </form>

      {payload?.estimate && payload.job && payload.band ? (
        <EstimateTicket payload={payload} expert={expert} />
      ) : (
        <EmptyTicket busy={busy} />
      )}
    </div>
  );
}

function EmptyTicket({ busy }: { busy: boolean }) {
  return (
    <div className="estimate-stack">
      <div className="ticket-paper flex min-h-[22rem] flex-col justify-between rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Customer estimate · not a Motor book</p>
        <p className="max-w-xs text-sm leading-6">
          {busy
            ? "Pulling the band for this ZIP…"
            : "Type a ZIP and pick a job. The yellow copy is the independent range you take to the window."}
        </p>
      </div>
    </div>
  );
}

function EstimateTicket({ payload, expert }: { payload: EstimatePayload; expert: boolean }) {
  const { job, band, zip, estimate, compare, vehicle } = payload;
  if (!job || !band || !estimate || !zip) return null;

  const highHit = compare?.verdict === "above-indie" || compare?.verdict === "above-dealer";
  const ymm = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  const directoryHref = `/directory?zip=${encodeURIComponent(zip.zip)}`;

  return (
    <div className="estimate-stack">
      <article className={`ticket-paper rounded-sm p-5 text-ticket-ink ${highHit ? "estimate-high" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
              {job.stamp} · ZIP {zip.zip} · {band.label}
            </p>
            <h3 className="font-display text-3xl uppercase leading-none">{job.label}</h3>
            {ymm ? <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em]">{ymm}</p> : null}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
            {estimate.applicable ? "Indie band" : "Skip"}
          </p>
        </div>

        <p className={`estimate-dollars mt-5 font-display uppercase leading-none ${expert ? "text-4xl" : "text-5xl"}`}>
          {estimate.beginnerRange}
        </p>
        <p className="mt-2 text-sm leading-6">
          {estimate.applicable
            ? expert
              ? "Independent total. Hours × this ZIP’s door rate, plus parts."
              : "Independent shop, this ZIP. One number. Not a dealer menu."
            : estimate.skipReason}
        </p>

        {estimate.applicable ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <RateCard
              stamp="Indie"
              total={formatRange(estimate.total.indie.low, estimate.total.indie.high)}
              rate={formatRange(estimate.labor.indie.rateLow, estimate.labor.indie.rateHigh) + "/hr"}
            />
            <RateCard
              stamp="Dealer"
              total={formatRange(estimate.total.dealer.low, estimate.total.dealer.high)}
              rate={formatRange(estimate.labor.dealer.rateLow, estimate.labor.dealer.rateHigh) + "/hr"}
            />
          </div>
        ) : null}

        {expert && estimate.applicable ? (
          <dl className="mt-4 space-y-1.5 font-mono text-[12px] leading-6">
            <Row
              label="Hours"
              value={`${formatHours(estimate.hours.low)} – ${formatHours(estimate.hours.high)}`}
            />
            <Row
              label="Indie labor"
              value={`${formatHours(estimate.hours.low)} × ${formatRate(estimate.labor.indie.rateLow)} → ${formatHours(estimate.hours.high)} × ${formatRate(estimate.labor.indie.rateHigh)} = ${formatRange(estimate.labor.indie.low, estimate.labor.indie.high)}`}
            />
            <Row label="Parts" value={formatRange(estimate.parts.low, estimate.parts.high)} />
            <Row
              label="ZIP map"
              value={`${zip.prefix} (${zip.match}) → ${band.id} · indie ×${band.indieMult} · dealer ×${band.dealerMult}`}
            />
            {vehicle.partsMult !== 1 || vehicle.hoursMult !== 1 ? (
              <Row label="Vehicle" value={`parts ×${vehicle.partsMult} · hours ×${vehicle.hoursMult}`} />
            ) : null}
            {vehicle.notes.map((note) => (
              <Row key={note} label="Note" value={note} />
            ))}
          </dl>
        ) : null}

        <p className="mt-4 border-l-2 border-[#b42318] pl-3 text-sm leading-6">{estimate.notes}</p>

        <div className="mt-4 rounded-sm bg-ticket-ink px-3 py-3 text-ticket">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#f3d36b]/70">
            If they quote above the high
          </p>
          <p className="mt-1 text-sm leading-6 text-[#f4efe2]">{compare?.say ?? estimate.sayIfHigh}</p>
        </div>

        {compare ? (
          <p className="mt-3 text-sm leading-6">
            Their number {formatMoney(compare.quoted)} is{" "}
            {compare.verdict === "below"
              ? "under the indie low."
              : compare.verdict === "within-indie"
                ? "inside the indie band."
                : compare.verdict === "above-indie"
                  ? "above indie, still under dealer high."
                  : "above even the dealer high."}
          </p>
        ) : null}

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] opacity-70">{payload.disclaimer}</p>

        <nav aria-label="Next desks" className="mt-4 flex flex-wrap gap-2">
          {ESTIMATE_NEXT_DESKS.map((desk) => (
            <Link
              key={desk.href}
              href={desk.href === "/directory" ? directoryHref : desk.href}
              className="rounded-sm bg-ticket-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
            >
              {desk.stamp}
            </Link>
          ))}
        </nav>
      </article>
    </div>
  );
}

function RateCard({ stamp, total, rate }: { stamp: string; total: string; rate: string }) {
  return (
    <div className="rounded-sm border border-ticket-ink/20 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em]">{stamp}</p>
      <p className="estimate-dollars mt-1 font-display text-2xl uppercase leading-none">{total}</p>
      <p className="mt-1 font-mono text-[11px]">{rate}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-2">
      <dt className="uppercase tracking-[0.12em] opacity-70">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
