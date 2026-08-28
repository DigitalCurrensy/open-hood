"use client";

import { useReadingLevel } from "@/components/reading-level";
import { RELIABILITY_NEXT_DESKS } from "@/config/nav/trust";
import { EXAMPLE_VEHICLE } from "@/lib/directory/vehicle-links";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import {
  RELIABILITY_RATINGS,
  addVote,
  complaintPace,
  componentShare,
  getVoteServerSnapshot,
  getVoteSnapshot,
  panelAverage,
  removeVote,
  subscribeVotes,
  votesForNameplate,
  type ComplaintComponent,
  type ReliabilityRatingId,
} from "@/app/reliability/votes";

interface OdiFile {
  count: number;
  crash: number;
  fire: number;
  injured: number;
  deaths: number;
  topComponents: string[];
  components: ComplaintComponent[];
  disclaimer?: string;
  error?: string;
}
import "../trust/trust.css";
import "./reliability.css";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

const EXTERNAL_REL = "noopener noreferrer";

export function ReliabilityDesk() {
  const [level] = useReadingLevel();
  const expert = level === "expert";
  const [vehicle] = useIdentifiedVehicle();
  const client = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const asOfYear = new Date().getFullYear();
  const [yearDraft, setYear] = useState("");
  const [makeDraft, setMake] = useState("");
  const [modelDraft, setModel] = useState("");
  const year = yearDraft || (client ? vehicle?.specs.year : "") || EXAMPLE_VEHICLE.year;
  const make = makeDraft || (client ? vehicle?.specs.make : "") || EXAMPLE_VEHICLE.make;
  const model = modelDraft || (client ? vehicle?.specs.model : "") || EXAMPLE_VEHICLE.model;
  const [rating, setRating] = useState<ReliabilityRatingId>("mixed");
  const [note, setNote] = useState("");
  const votes = useSyncExternalStore(subscribeVotes, getVoteSnapshot, getVoteServerSnapshot);
  const [file, setFile] = useState<OdiFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [fault, setFault] = useState("");

  const identifiedYear = client ? vehicle?.specs.year ?? "" : "";
  const identifiedMake = client ? vehicle?.specs.make ?? "" : "";
  const identifiedModel = client ? vehicle?.specs.model ?? "" : "";

  useEffect(() => {
    if (!client) return;
    void pullFile(year, make, model);
    // Re-pull when the identified car hydrates. Draft keystrokes still go through the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, identifiedYear, identifiedMake, identifiedModel]);

  const nameplateVotes = useMemo(() => votesForNameplate(votes, year, make, model), [votes, year, make, model]);
  const panelMean = panelAverage(votes);
  const nameplateMean = panelAverage(nameplateVotes);
  const yearNumber = Number(year);
  const pace = file && Number.isFinite(yearNumber) ? complaintPace(file.count, yearNumber, asOfYear) : null;

  async function pullFile(nextYear: string, nextMake: string, nextModel: string) {
    const y = nextYear.trim();
    const mk = nextMake.trim();
    const md = nextModel.trim();
    if (!y || !mk || !md) {
      setFault("Need year, make, and model.");
      return;
    }
    setBusy(true);
    setFault("");
    try {
      const params = new URLSearchParams({ year: y, make: mk, model: md });
      const response = await fetch(`/reliability/odi?${params}`, { cache: "no-store" });
      const body = (await response.json()) as OdiFile;
      if (!response.ok) {
        setFault(body.error || "SaferCar did not answer. Try again from this desk.");
        setFile(null);
        return;
      }
      setFile(body);
    } catch {
      setFault("SaferCar did not answer. Try again from this desk.");
      setFile(null);
    } finally {
      setBusy(false);
    }
  }

  async function onPull(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await pullFile(year, make, model);
  }

  function onVote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!year.trim() || !make.trim() || !model.trim()) {
      setFault("Need year, make, and model before you stamp a vote.");
      return;
    }
    setFault("");
    addVote({
      year: year.trim(),
      make: make.trim(),
      model: model.trim(),
      rating,
      note: note.trim(),
    });
    setNote("");
  }

  const saferCarHref = `https://www.nhtsa.gov/search?q=${encodeURIComponent(`${year} ${make} ${model} complaints`)}`;

  return (
    <div className="reliability-desk space-y-4">
      <p className="reliability-no-bubble rounded-sm border border-cone/40 bg-bay-2/80 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-cone">
        Complaint counts, not Consumer Reports. CR is a magazine we do not license. SaferCar is who filed, counted by
        component, plus n of a local panel on this phone. Wrecks and titles are a consumer{" "}
        <a
          href="https://www.carfax.com/vehicle-history-reports/"
          rel={EXTERNAL_REL}
          target="_blank"
          className="underline decoration-cone/50 underline-offset-2"
        >
          Carfax
        </a>{" "}
        / NICB / NMVTIS purchase — we do not own that file.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <form className="trust-carbon rounded-sm border border-white/10 p-5" onSubmit={onPull}>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
            {expert ? "ODI complaintsByVehicle" : "SaferCar file"}
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">Nameplate lookup</h2>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {expert
              ? "api.nhtsa.gov complaints by year/make/model. Rate is filings ÷ years of the nameplate. Not a statistically controlled failure rate."
              : "What other owners already filed on this year, make, and model. A pile is a question, not a diagnosis."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field label="Year">
              <input name="year" inputMode="numeric" value={year} onChange={(event) => setYear(event.target.value)} className={FIELD} />
            </Field>
            <Field label="Make">
              <input name="make" value={make} onChange={(event) => setMake(event.target.value)} className={FIELD} />
            </Field>
            <Field label="Model">
              <input name="model" value={model} onChange={(event) => setModel(event.target.value)} className={FIELD} />
            </Field>
          </div>
          {fault ? (
            <p role="alert" className="mt-3 text-sm leading-6 text-cone">
              {fault}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 rounded-sm bg-ticket px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
          >
            {busy ? "Pulling SaferCar…" : "Pull the file"}
          </button>
          <p className="mt-3">
            <a href={saferCarHref} rel={EXTERNAL_REL} target="_blank" className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:text-ticket">
              Open SaferCar search
            </a>
          </p>
        </form>

        <article className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
            {year} {make} {model}
          </p>
          {file && pace ? (
            <>
              <h3 className="reliability-count mt-1 font-display text-4xl uppercase leading-none">{file.count}</h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em]">
                Complaint counts, not Consumer Reports
              </p>
              <p className="mt-3 font-display text-3xl uppercase leading-none">{pace.perYear.toFixed(1)} / yr</p>
              <p className="mt-1 text-sm leading-6">
                {pace.ageYears} years on the road in this math · {pace.label}
              </p>
              <div className="trust-perforation my-3 opacity-40" />
              <p className="text-sm leading-6">
                Crash {file.crash} · fire {file.fire} · injured {file.injured} · deaths {file.deaths}
              </p>
              {file.components.length ? (
                <div className="mt-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em]">SaferCar filings by component</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">
                    Complaint counts, not Consumer Reports. Playbook links, not CR bubbles.
                  </p>
                  <ul className="mt-2 space-y-2">
                    {file.components.slice(0, 8).map((row) => (
                      <li key={row.name} className="reliability-component pt-2">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span>{row.name}</span>
                          <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em]">
                            {row.count} · {componentShare(row.count, file.count)}
                          </span>
                        </div>
                        {row.why ? <p className="mt-1 text-xs leading-5 opacity-80">{row.why}</p> : null}
                        {row.links?.length ? (
                          <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em]">
                            {row.links.slice(0, 5).map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="underline decoration-black/25 underline-offset-2"
                              >
                                {link.stamp}
                              </Link>
                            ))}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <h3 className="mt-1 font-display text-3xl uppercase leading-none">No file yet</h3>
              <p className="mt-3 text-sm leading-6">
                Pull SaferCar for this year-make-model. The 2018 Honda Civic sample is on the card if you have not
                identified a car.
              </p>
            </>
          )}
        </article>
      </div>

      <section className="trust-carbon rounded-sm border border-white/10 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Methodology · published</p>
        <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">The math</h2>
        {expert ? (
          <div className="mt-2 space-y-2 text-sm leading-6 text-aluminum">
            <p>
              Source is NHTSA ODI <span className="font-mono text-[12px] text-fluorescent">complaintsByVehicle</span> on
              the year, make, and model you typed. Pace is filings ÷ years of the nameplate — model year to{" "}
              {asOfYear}, floored at one year.
            </p>
            <p>
              It is <strong className="text-fluorescent">not exposure-adjusted</strong>. We have no vehicles-in-operation
              count, so a nameplate that sold 900,000 units and one that sold 40,000 are divided by time only, never by
              fleet. Nothing here is statistically controlled — no weighting, no sampling frame, no confidence interval.
            </p>
            <p>
              Crash, fire, injured, and deaths are SaferCar&apos;s own tallies carried through as filed. We do not audit,
              verify, or re-code them. Local votes are written to{" "}
              <span className="font-mono text-[12px] text-fluorescent">localStorage</span> on this browser and never
              leave it — no server, no account, no pooling with anyone else&apos;s panel.
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-2 text-sm leading-6 text-aluminum">
            <p>
              SaferCar is who already filed. It is not everyone who owns the car — it is the owners who were annoyed
              enough to fill out a federal form.
            </p>
            <p>
              So a pile is a question, not a verdict. Big number, ask what part. Small number, it can still mean nobody
              bothered to write it down.
            </p>
            <p>
              Your vote on this phone is n of 1. It stays in this browser. It is not a panel of America, and it does not
              move anyone else&apos;s number.
            </p>
          </div>
        )}
        <div className="trust-perforation my-4 opacity-30" />
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">What we will not do</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-aluminum">
          <li>Invent a Consumer Reports bubble. Complaint counts, not Consumer Reports.</li>
          <li>License CR. CR is a magazine we do not license. Their subscribers paid for that file.</li>
          <li>Score a VIN we did not decode as &ldquo;reliable.&rdquo; No decode, no claim about your car.</li>
          <li>
            Host a Carfax. Accident / title / odometer tape is their consumer portal — a link-out, not a file we
            generated.
          </li>
        </ul>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          Long form: docs/RELIABILITY.md in the repo
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
        <form className="rounded-sm border border-white/10 bg-bay-2/80 p-5" onSubmit={onVote}>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Local panel · this device</p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">Add a vote</h2>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {votes.length} of this phone&apos;s panel
            {nameplateVotes.length ? ` · ${nameplateVotes.length} on this nameplate` : ""}. Complaint counts, not
            Consumer Reports. Not a national sample.
          </p>
          <fieldset className="mt-4">
            <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">How has it treated you</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RELIABILITY_RATINGS.map((row) => (
                <label
                  key={row.id}
                  className="trust-chip inline-flex cursor-pointer items-center rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={row.id}
                    className="sr-only"
                    checked={rating === row.id}
                    onChange={() => setRating(row.id)}
                  />
                  {row.label}
                  <span className="ml-1 opacity-70">{row.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="mt-4 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Note · optional</span>
            <input
              name="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="CVT at 98k · 12V every other winter"
              className={FIELD}
            />
          </label>
          <button
            type="submit"
            className="mt-5 rounded-sm bg-ticket px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
          >
            Stamp my vote
          </button>
        </form>

        <aside className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">n of panel</p>
          <h3 className="mt-1 font-display text-2xl uppercase tracking-wide">
            {votes.length ? `${votes.length} vote${votes.length === 1 ? "" : "s"} on this phone` : "Empty panel"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {panelMean != null ? `Panel mean ${panelMean.toFixed(1)} / 5 (solid 5 · mixed 3 · lemon 1).` : "Stamp a vote to start the panel."}
            {nameplateMean != null ? ` This nameplate ${nameplateMean.toFixed(1)} / 5 from ${nameplateVotes.length}.` : ""}
          </p>
          <ul className="mt-3 space-y-2">
            {votes.slice(0, 8).map((vote) => (
              <li key={vote.id} className="flex items-start justify-between gap-3 rounded-sm border border-white/10 px-3 py-2">
                <span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ticket">{vote.rating}</span>
                  <span className="mt-1 block text-sm text-fluorescent">
                    {vote.year} {vote.make} {vote.model}
                  </span>
                  {vote.note ? <span className="mt-1 block text-sm text-aluminum">{vote.note}</span> : null}
                </span>
                <button
                  type="button"
                  onClick={() => removeVote(vote.id)}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-cone hover:text-ticket"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <nav aria-label="Next desks" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Still in the bay</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {RELIABILITY_NEXT_DESKS.map((desk) => (
            <li key={desk.href}>
              <Link
                href={desk.href}
                className="inline-block rounded-sm border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
              >
                {desk.stamp}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">{label}</span>
      {children}
    </label>
  );
}
