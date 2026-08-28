"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { allExpertPlaybooks, audienceLabel, filterExpertPlaybooks, playbooksHref } from "@/app/expert/_data/book";
import { parsePlaybookFilters } from "@/lib/expert/playbooks";
import type { ExpertFilters, Playbook, PlaybookAudience } from "@/lib/expert/types";

const BOOK = allExpertPlaybooks();

const AUDIENCES: { value: PlaybookAudience | ""; label: string }[] = [
  { value: "", label: "All stalls" },
  { value: "owner", label: "Daily owner" },
  { value: "buyer", label: "Buyer / PPI" },
  { value: "ev", label: "EV" },
  { value: "claim", label: "Claim / file" },
  { value: "shop", label: "Which roof" },
];

export function PlaybookIndex() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parsePlaybookFilters({
        q: searchParams.get("q") ?? undefined,
        audience: searchParams.get("audience") ?? undefined,
      }),
    [searchParams],
  );
  const urlQ = filters.q ?? "";
  const [draftQ, setDraftQ] = useState(urlQ);
  const [seenQ, setSeenQ] = useState(urlQ);
  if (urlQ !== seenQ) {
    setSeenQ(urlQ);
    setDraftQ(urlQ);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = draftQ.trim();
      const current = (filters.q ?? "").trim();
      if (next === current) return;
      replace({ ...filters, q: next || undefined });
    }, 220);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftQ, filters.q, filters.audience]);

  function replace(next: ExpertFilters) {
    router.replace(playbooksHref(next), { scroll: false });
  }

  const live = useMemo(() => filterExpertPlaybooks({ ...filters, q: draftQ }), [filters, draftQ]);

  return (
    <div className="space-y-5">
      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          replace({ ...filters, q: draftQ.trim() || undefined });
        }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">
          Search · {BOOK.length} owner scenarios
        </p>
        <label className="mt-3 block">
          <span className="sr-only">Search playbooks</span>
          <input
            value={draftQ}
            onChange={(event) => setDraftQ(event.target.value)}
            placeholder="PPI, CEL, flush, oil, Carfax, Takata, lemon…"
            autoComplete="off"
            className="w-full rounded-sm border border-white/15 bg-bay px-3 py-2.5 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>
        <fieldset className="mt-4">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Who is holding the ticket</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {AUDIENCES.map((row) => {
              const active = (filters.audience ?? "") === row.value;
              return (
                <button
                  key={row.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    replace({
                      ...filters,
                      q: draftQ.trim() || undefined,
                      audience: row.value || undefined,
                    })
                  }
                  className={`rounded-sm px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${
                    active
                      ? "bg-ticket text-ticket-ink"
                      : "border border-white/10 text-aluminum hover:text-fluorescent"
                  }`}
                >
                  {row.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </form>

      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-aluminum">
        {live.length} {live.length === 1 ? "playbook" : "playbooks"}
        {draftQ.trim() || filters.audience ? " match" : " on the board"}
      </p>

      {live.length === 0 ? (
        <div className="rounded-sm border border-dashed border-white/15 bg-bay-2/50 px-5 py-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Empty bay</p>
          <h2 className="mt-2 font-display text-3xl uppercase text-fluorescent">No scenario matches</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-aluminum">
            Nothing in this stall for that filter. Try CEL, PPI, or clear the board.
          </p>
          <Link
            href="/expert"
            className="mt-5 inline-block rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ticket hover:border-ticket"
          >
            Clear the board
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {live.map((playbook) => (
            <li key={playbook.id}>
              <PlaybookTicket playbook={playbook} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PlaybookTicket({ playbook }: { playbook: Playbook }) {
  return (
    <Link
      href={`/expert/${playbook.slug}`}
      className="block rounded-sm border border-white/10 bg-bay-2/80 p-4 transition-colors hover:border-ticket/50"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{playbook.stamp}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-aluminum">
          {playbook.minutes} min · {audienceLabel(playbook.audience)}
        </p>
      </div>
      <h2 className="mt-1 font-display text-2xl uppercase leading-none tracking-wide text-fluorescent">
        {playbook.title}
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-aluminum">{playbook.plainEnglish}</p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">{playbook.kicker}</p>
    </Link>
  );
}
