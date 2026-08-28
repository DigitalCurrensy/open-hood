"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TicketPath } from "@/app/_components/ticket-path";
import { OWNER_CHECKS } from "@/lib/jobs/checklists";
import { CheckDesk } from "@/app/jobs/_components/check-desk";
import { SayTicket } from "@/app/jobs/_components/say-ticket";
import { BayLink } from "@/components/bay-link";

const NOTES_KEY = "openhood.jobs.owner.notes";

function ownerScript(symptom: string, code: string): string[] {
  const concern = symptom.trim() || "I will write one sentence — when, speed, weather, how long — before you start.";
  const scan = code.trim()
    ? `${code.trim()} is on the scanner. Translate it before you price a part. I want millimeters, not "due."`
    : 'No light. Do not invent a code. I still want millimeters, not "due."';
  return [
    `The concern is: ${concern}`,
    scan,
    "Out-the-door number before work. Call me before extras. Old part in the box or a photo.",
  ];
}

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

  const script = useMemo(() => ownerScript(symptom, code), [symptom, code]);

  return (
    <div className="space-y-4">
      <TicketPath current="script" />
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
            <Link href={`/jobs/obd/${encodeURIComponent(code)}`} className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
              Translate {code} →
            </Link>
          ) : (
            <p className="mt-2 text-sm text-aluminum">No light? Leave it blank. Don&apos;t invent a code.</p>
          )}
        </label>
      </form>
      <SayTicket
        title="Walk in with this"
        lines={script}
        footnote="This desk outputs a counter script. We do not book a shop or sell a SKU."
      />
      <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Authorization hold</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none">Do not approve until</h2>
        <p className="mt-3 text-sm leading-6">
          Hours, OEM numbers, and an out-the-door ceiling are on the paper. A packed menu is named or declined. You
          can read the three lines above without looking at your phone.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em]">
          <BayLink href="/trust#hold" className="underline">
            Open /trust · hold
          </BayLink>
          {" · "}
          <BayLink href="/quote#compare-3" className="underline">
            Compare three ROs
          </BayLink>
        </p>
      </aside>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
        Next on the path:{" "}
        <BayLink href="/directory" className="text-ticket hover:text-fluorescent">
          OSM rooftops — no book
        </BayLink>
        {" · "}
        <BayLink href="/report" className="text-ticket hover:text-fluorescent">
          Print packet
        </BayLink>
      </p>
      <CheckDesk
        storageKey="openhood.jobs.owner"
        items={OWNER_CHECKS}
        readyLabel="Walk in. Read the sentence. Ask for millimeters."
        blockedLabel="Don't walk in yet — tick the card"
      />
    </div>
  );
}
