"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { allExpertTsb, expertTsbMakes, filterExpertTsb, linksForComplaint } from "@/app/expert/_data/book";
import { SAFERCAR_RECALLS, SAFERCAR_TAKATA } from "@/lib/expert/tsb";
import type { SaferCarLookup, TsbPattern } from "@/lib/expert/types";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

const PATTERNS = allExpertTsb();
const MAKES = expertTsbMakes();

export function TsbDesk() {
  const [vehicle] = useIdentifiedVehicle();
  const [q, setQ] = useState("");
  const [make, setMake] = useState("");
  const [year, setYear] = useState("");
  const [lookupMake, setLookupMake] = useState("");
  const [model, setModel] = useState("");
  const [seededVin, setSeededVin] = useState(false);
  const [result, setResult] = useState<SaferCarLookup | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (vehicle && !seededVin) {
    setSeededVin(true);
    setYear((current) => current || vehicle.specs.year);
    setLookupMake((current) => current || vehicle.specs.make);
    setModel((current) => current || vehicle.specs.model);
  }

  const live = useMemo(() => filterExpertTsb({ q, make }), [q, make]);

  async function runSaferCar(event: FormEvent) {
    event.preventDefault();
    if (!year.trim() || !lookupMake.trim() || !model.trim()) {
      setError("Need year, make, and model.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams({
        year: year.trim(),
        make: lookupMake.trim(),
        model: model.trim(),
      });
      const response = await fetch(`/api/expert/safercar?${params}`);
      const body = (await response.json()) as SaferCarLookup & { error?: string };
      if (!response.ok) {
        setError(body.error || "SaferCar lookup did not finish.");
        setResult(null);
        return;
      }
      setResult(body);
    } catch {
      setError("SaferCar lookup did not finish. Try again from this desk.");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-sm border-l-4 border-cone bg-bay-2/80 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Not a stolen TSB</p>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          These are common failure patterns by symptom — owner reports, public NHTSA campaigns, and the measurements a
          master tech asks for. Pattern cards, not OEM TSB PDFs. We do not host ALLDATA, Identifix, or dealer bulletins.
          If a shop cites a TSB, they show the OEM number and the reading that matches.
        </p>
        <p className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
          <a href={SAFERCAR_RECALLS} className="text-ticket hover:text-fluorescent" rel="noreferrer">
            SaferCar VIN / recalls
          </a>
          <a href={SAFERCAR_TAKATA} className="text-ticket hover:text-fluorescent" rel="noreferrer">
            Takata campaign
          </a>
          <Link href="/recalls" className="text-ticket hover:text-fluorescent">
            Bay recalls desk
          </Link>
        </p>
      </div>

      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">
          Pattern library · {PATTERNS.length} cards
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Symptom or make</span>
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="airbag, P0420, CVT, 12V…"
              className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
            />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Make filter</span>
            <select
              value={make}
              onChange={(event) => setMake(event.target.value)}
              className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-xs uppercase tracking-wide text-fluorescent"
            >
              <option value="">All nameplates</option>
              {MAKES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      <ul className="space-y-3">
        {live.map((pattern) => (
          <li key={pattern.id}>
            <PatternCard pattern={pattern} />
          </li>
        ))}
        {live.length === 0 ? (
          <li className="rounded-sm border border-dashed border-white/15 px-5 py-8 text-center text-sm text-aluminum">
            No pattern in this stall. Try Honda, Takata, or P0420.
          </li>
        ) : null}
      </ul>

      <form className="rounded-sm border border-white/10 bg-bay-2/80 p-5" onSubmit={runSaferCar}>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Live SaferCar · no key</p>
        <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Look up this car</h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          Official campaigns and complaint counts from api.nhtsa.gov. Demo example: 2003 Honda Accord (Takata). A VIN
          on{" "}
          <a href={SAFERCAR_RECALLS} className="text-ticket" rel="noreferrer">
            nhtsa.gov/recalls
          </a>{" "}
          is the close-out.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="Year" value={year} onChange={setYear} placeholder="2003" />
          <Field label="Make" value={lookupMake} onChange={setLookupMake} placeholder="Honda" />
          <Field label="Model" value={model} onChange={setModel} placeholder="Accord" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-60"
          >
            {busy ? "Calling SaferCar…" : "Pull campaigns"}
          </button>
          <button
            type="button"
            onClick={() => {
              setYear("2003");
              setLookupMake("Honda");
              setModel("Accord");
            }}
            className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum hover:text-fluorescent"
          >
            Load 2003 Accord
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-cone">{error}</p> : null}
        {result ? <SaferCarResult result={result} /> : null}
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
      />
    </label>
  );
}

function PatternCard({ pattern }: { pattern: TsbPattern }) {
  return (
    <article id={pattern.id} className="scroll-mt-24 rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">
          {pattern.stamp} · {pattern.nhtsaKind}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum">{pattern.years}</p>
      </div>
      <h3 className="mt-2 font-display text-2xl uppercase leading-none text-fluorescent">{pattern.symptom}</h3>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-aluminum">
        {pattern.makes.join(" · ")} · {pattern.models.join(", ")}
      </p>
      <p className="mt-3 text-sm leading-6 text-aluminum">{pattern.pattern}</p>
      <p className="mt-3 text-sm leading-6 text-fluorescent">Beginner move: {pattern.dummyMove}</p>
      <p className="mt-2 text-sm leading-6 text-aluminum">Expert: {pattern.geniusNote}</p>
      <p className="mt-3 text-sm leading-6 text-aluminum/80">{pattern.notATsb}</p>
      <p className="mt-4 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
        <a href={pattern.saferCarUrl} className="text-ticket hover:text-fluorescent" rel="noreferrer">
          SaferCar
        </a>
        <a href={pattern.vinLookupUrl} className="text-ticket hover:text-fluorescent" rel="noreferrer">
          VIN lookup
        </a>
        {pattern.relatedPlaybooks.map((id) => (
          <Link key={id} href={`/expert/${id}`} className="text-ticket hover:text-fluorescent">
            {id}
          </Link>
        ))}
      </p>
    </article>
  );
}

function SaferCarResult({ result }: { result: SaferCarLookup }) {
  return (
    <div className="mt-5 space-y-4">
      <p className="text-sm leading-6 text-fluorescent">
        {result.year} {result.make} {result.model} · {result.recallCount} campaigns in this pull ·{" "}
        {result.complaints.count} complaints · crash {result.complaints.crash} · fire {result.complaints.fire}
      </p>
      <p className="text-sm leading-6 text-aluminum">{result.disclaimer}</p>
      {result.complaints.topComponents.length ? (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cone">
            SaferCar components → playbooks · not CR
          </p>
          <ul className="space-y-2">
            {result.complaints.topComponents.slice(0, 6).map((name) => {
              const links = linksForComplaint(name, result.make);
              return (
                <li key={name} className="rounded-sm border border-white/10 bg-bay px-3 py-2">
                  <p className="text-sm text-fluorescent">{name}</p>
                  {links.length ? (
                    <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em]">
                      {links.slice(0, 5).map((link) => (
                        <Link key={link.href} href={link.href} className="text-ticket hover:text-fluorescent">
                          {link.stamp}
                        </Link>
                      ))}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <ul className="space-y-3">
        {result.recalls.map((row) => (
          <li key={`${row.campaignNumber}-${row.component}`} className="rounded-sm border border-white/10 bg-bay p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">
              {row.campaignNumber || "No campaign #"} · {row.component}
            </p>
            <p className="mt-2 text-sm leading-6 text-aluminum">{row.summary || "No summary from NHTSA on this row."}</p>
            {row.consequence ? (
              <p className="mt-2 text-sm leading-6 text-fluorescent">If ignored: {row.consequence}</p>
            ) : null}
          </li>
        ))}
        {result.recalls.length === 0 ? (
          <li className="text-sm text-aluminum">
            No campaign rows for that exact year/make/model string. Try the VIN on SaferCar — NHTSA names do not always
            match vPIC.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
