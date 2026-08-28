"use client";

import { useReadingLevel } from "@/components/reading-level";
import { VALUE_NEXT_DESKS } from "@/config/nav/trust";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import {
  VALUE_CONDITIONS,
  bookSearchLinks,
  illustrateValue,
  isConditionId,
  parseKnownPrice,
  parseMileage,
  parseYear,
  valueFeedLabel,
  type ValueConditionId,
  type ValueIllustration,
} from "@/lib/value";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import "../trust/trust.css";
import "./value.css";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

const EXTERNAL_REL = "noopener noreferrer";

export function ValueDesk({ kbbConfigured }: { kbbConfigured: boolean }) {
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
  const [mileageDraft, setMileage] = useState("");
  const year = yearDraft || (client ? vehicle?.specs.year : "") || "";
  const make = makeDraft || (client ? vehicle?.specs.make : "") || "";
  const model = modelDraft || (client ? vehicle?.specs.model : "") || "";
  const mileage = mileageDraft || (client ? vehicle?.specs.mileage : "") || "";
  const [condition, setCondition] = useState<ValueConditionId>("good");
  const [knownPrice, setKnownPrice] = useState("");
  const [fault, setFault] = useState("");
  const [result, setResult] = useState<ValueIllustration | null>(null);

  const links = useMemo(() => bookSearchLinks(year, make, model), [year, make, model]);
  const feed = valueFeedLabel(kbbConfigured);

  function onRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const y = parseYear(year, asOfYear);
    const miles = parseMileage(mileage);
    if (!y) {
      setFault("Need a model year between 1970 and next year.");
      setResult(null);
      return;
    }
    if (!make.trim() || !model.trim()) {
      setFault("Need make and model.");
      setResult(null);
      return;
    }
    if (miles == null) {
      setFault("Need miles on the odometer — digits only.");
      setResult(null);
      return;
    }
    setFault("");
    setResult(
      illustrateValue({
        year: y,
        make: make.trim(),
        model: model.trim(),
        mileage: miles,
        condition,
        knownPrice: parseKnownPrice(knownPrice),
        asOfYear,
      }),
    );
  }

  return (
    <div className="space-y-4">
      <p className="rounded-sm border border-cone/40 bg-bay-2/80 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-cone">
        {feed}
      </p>

      <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
        <form className="trust-carbon rounded-sm border border-white/10 p-5" onSubmit={onRun}>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
            {expert ? "YMM · miles · condition · known dollar" : "Year, miles, condition"}
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">Illustration card</h2>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {expert
              ? "First year keeps 80%. Each year after keeps 90% of what is left. Miles vs 12,000/year. Condition factor. Band is mid ± 8 points."
              : "This is a remaining-value band, not their book. Open KBB, Edmunds, or NADA for their number."}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field label="Year">
              <input
                name="year"
                inputMode="numeric"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                placeholder="2018"
                className={FIELD}
              />
            </Field>
            <Field label="Make">
              <input
                name="make"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                placeholder="Honda"
                className={FIELD}
              />
            </Field>
            <Field label="Model">
              <input
                name="model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Civic"
                className={FIELD}
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Odometer miles">
              <input
                name="mileage"
                inputMode="numeric"
                value={mileage}
                onChange={(event) => setMileage(event.target.value)}
                placeholder="86400"
                className={`${FIELD} value-miles`}
              />
            </Field>
            <Field label="Known price · optional">
              <input
                name="knownPrice"
                inputMode="decimal"
                value={knownPrice}
                onChange={(event) => setKnownPrice(event.target.value)}
                placeholder="What you paid, or a sticker"
                className={FIELD}
              />
            </Field>
          </div>

          <fieldset className="mt-4">
            <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Condition</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {VALUE_CONDITIONS.map((row) => (
                <label
                  key={row.id}
                  className="trust-chip inline-flex cursor-pointer items-center rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum"
                >
                  <input
                    type="radio"
                    name="condition"
                    value={row.id}
                    className="sr-only"
                    checked={condition === row.id}
                    onChange={() => {
                      if (isConditionId(row.id)) setCondition(row.id);
                    }}
                  />
                  {row.label}
                  <span className="ml-1 opacity-70">{row.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {fault ? (
            <p role="alert" className="mt-3 text-sm leading-6 text-cone">
              {fault}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-5 rounded-sm bg-ticket px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
          >
            Stamp the band
          </button>
        </form>

        <aside className="space-y-4">
          {result ? <ValueTicket result={result} /> : <EmptyTicket asOfYear={asOfYear} />}

          <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Their books</p>
            <h3 className="mt-1 font-display text-2xl uppercase tracking-wide">KBB · Edmunds · NADA</h3>
            <p className="mt-2 text-sm leading-6 text-aluminum">
              Consumer search URLs. We do not scrape lots and we do not invent a residual.
            </p>
            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    rel={EXTERNAL_REL}
                    target="_blank"
                    className="block rounded-sm border border-white/10 px-3 py-2.5 hover:border-ticket/50"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">{link.stamp}</span>
                    <span className="ml-2 font-display text-lg uppercase text-fluorescent">{link.name}</span>
                    <span className="mt-1 block text-sm leading-6 text-aluminum">{link.blurb}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <nav aria-label="Next desks" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Still in the bay</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {VALUE_NEXT_DESKS.map((desk) => (
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

function ValueTicket({ result }: { result: ValueIllustration }) {
  const left = Math.round(result.low * 100);
  const mid = Math.round(result.mid * 100);
  const width = Math.max(6, Math.round((result.high - result.low) * 100));
  return (
    <article className="ticket-paper rounded-sm p-5 text-ticket-ink">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
        {result.year} {result.make} {result.model}
      </p>
      <h3 className="mt-1 font-display text-3xl uppercase leading-none">
        {result.lowPct} – {result.highPct}
      </h3>
      <p className="mt-2 text-sm leading-6">
        Remaining-value band vs a new-car dollar. Mid {result.midPct}.
        {result.dollarLow != null && result.dollarHigh != null
          ? ` Against your ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.knownPrice ?? 0)}: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.dollarLow)} – ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.dollarHigh)}.`
          : " Add a known price if you want dollars."}
      </p>
      <div className="relative mt-4 h-4 overflow-hidden rounded-sm bg-bay">
        <div className="trust-band absolute inset-0 opacity-70" />
        <div
          className="absolute top-0 h-full bg-ticket/80"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <div className="trust-band-mark absolute top-0 h-full" style={{ left: `${mid}%` }} />
      </div>
      <div className="trust-perforation my-3 opacity-40" />
      <ol className="space-y-2 font-mono text-[11px] leading-5">
        {result.steps.map((step) => (
          <li key={step.label}>
            <span className="uppercase tracking-[0.16em]">{step.label}</span>
            <span className="mt-0.5 block font-sans text-sm leading-6">{step.value}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

function EmptyTicket({ asOfYear }: { asOfYear: number }) {
  return (
    <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Waiting on the card</p>
      <h3 className="mt-1 font-display text-2xl uppercase tracking-wide">No band yet</h3>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        Stamp the band for {asOfYear} math. The formula is on the ticket after you fill year, miles, and condition.
      </p>
    </article>
  );
}
