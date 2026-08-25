"use client";

import Link from "next/link";
import { useState } from "react";
import { NOISE_OPTIONS, WHEN_OPTIONS } from "@/lib/symptoms";
import type { IdentifiedVehicle, SymptomFinding, SymptomNoise, SymptomWhen } from "@/lib/types";

export function SymptomWizard({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const [noise, setNoise] = useState<SymptomNoise>("squeal");
  const [when, setWhen] = useState<SymptomWhen>("braking");
  const [warningLight, setWarningLight] = useState(false);
  const [leak, setLeak] = useState(false);
  const [pull, setPull] = useState(false);
  const [findings, setFindings] = useState<SymptomFinding[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noise,
          when,
          warningLight,
          leak,
          pull,
          specs: vehicle.specs,
        }),
      });
      const payload = (await response.json()) as { findings?: SymptomFinding[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not map that symptom");
      setFindings(payload.findings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not map that symptom");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <h3 className="font-display text-2xl uppercase tracking-wide">
          What does it feel like?
        </h3>
        <p className="mt-1 text-sm text-aluminum">
          No part names required. We map the sound and the moment to what a service writer should actually inspect.
        </p>

        <fieldset className="mt-5">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">The sound</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {NOISE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`cursor-pointer rounded-sm border px-3 py-2 text-sm ${
                  noise === option.id ? "border-ticket bg-ticket/10" : "border-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="noise"
                  className="sr-only"
                  checked={noise === option.id}
                  onChange={() => setNoise(option.id)}
                />
                <span className="block font-semibold">{option.label}</span>
                <span className="block text-xs text-aluminum">{option.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">When it happens</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {WHEN_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`cursor-pointer rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
                  when === option.id ? "border-ticket bg-ticket text-ticket-ink" : "border-white/10 text-aluminum"
                }`}
              >
                <input
                  type="radio"
                  name="when"
                  className="sr-only"
                  checked={when === option.id}
                  onChange={() => setWhen(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5 space-y-2">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Also true</legend>
          <Toggle checked={warningLight} onChange={setWarningLight} label="A warning light is on" />
          <Toggle checked={leak} onChange={setLeak} label="There is a leak or puddle" />
          <Toggle checked={pull} onChange={setPull} label="It pulls left or right" />
        </fieldset>

        <button
          type="submit"
          disabled={busy}
          className="mt-5 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
        >
          {busy ? "Mapping…" : "Translate to causes"}
        </button>
        {error ? <p className="mt-3 text-sm text-cone">{error}</p> : null}
      </form>

      <div className="space-y-3">
        {findings?.map((finding) => (
          <article key={finding.title} className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">{finding.likelihood}</p>
            <h4 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
              {finding.title}
            </h4>
            <p className="mt-2 text-sm leading-6 text-aluminum">{finding.plainEnglish}</p>
            <p className="mt-3 border-l-2 border-ticket pl-3 text-sm leading-6 text-fluorescent">
              {finding.askTheShop}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-aluminum">
              {finding.diySafe ? "Safe to look at in the driveway" : "Not a driveway guess — pay for a measurement"}
            </p>
            {finding.title.toLowerCase().includes("obd") ? (
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
                <Link href="/obd">Translate the scanner code</Link>
              </p>
            ) : null}
          </article>
        ))}
        {!findings ? (
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-aluminum">
            Answer the two questions. We will hand you the sentences to use at the shop.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-[#f3d36b]"
      />
      {label}
    </label>
  );
}
