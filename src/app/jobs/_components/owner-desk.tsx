"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OWNER_CHECKS } from "@/lib/jobs/checklists";
import { CheckDesk } from "@/app/jobs/_components/check-desk";

const NOTES_KEY = "autoshield.jobs.owner.notes";

export function OwnerDesk() {
  const [symptom, setSymptom] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NOTES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { symptom?: string; code?: string };
      setSymptom(parsed.symptom ?? "");
      setCode(parsed.code ?? "");
    } catch {
      /* empty bay */
    }
  }, []);

  function persist(next: { symptom: string; code: string }) {
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }

  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 rounded-sm border border-white/10 bg-bay-2/80 p-5 md:grid-cols-2"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
            One sentence for the writer
          </span>
          <textarea
            value={symptom}
            onChange={(event) => {
              const next = event.target.value;
              setSymptom(next);
              persist({ symptom: next, code });
            }}
            rows={3}
            placeholder="Squeal last 2 seconds of a stop, city speeds, dry pavement, two weeks."
            className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>
        <label>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
            Scanner code (if the light is on)
          </span>
          <input
            value={code}
            onChange={(event) => {
              const next = event.target.value.toUpperCase();
              setCode(next);
              persist({ symptom, code: next });
            }}
            placeholder="P0420"
            maxLength={8}
            className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-lg uppercase tracking-[0.2em] text-fluorescent placeholder:text-aluminum/40"
          />
          {code ? (
            <Link href={`/jobs/obd?code=${encodeURIComponent(code)}`} className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
              Translate {code} →
            </Link>
          ) : (
            <p className="mt-2 text-sm text-aluminum">No light? Leave it blank. Don&apos;t invent a code.</p>
          )}
        </label>
      </form>
      <CheckDesk
        storageKey="autoshield.jobs.owner"
        items={OWNER_CHECKS}
        readyLabel="Walk in. Read the sentence. Ask for millimeters."
        blockedLabel="Don't walk in yet — tick the card"
      />
    </div>
  );
}
