"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GUIDE_JOB_FAMILIES } from "@/config/nav/guides";
import {
  allGuides,
  difficultyLabel,
  familyStamp,
  filterGuides,
  guidesHref,
  parseFilters,
} from "@/lib/guides/glossary";
import type { Guide, GuideFilters } from "@/lib/guides/types";

const BOOK = allGuides();

const DIFFICULTY = [
  { value: "", label: "Any grit" },
  { value: "1", label: "1 · almost no tools" },
  { value: "2", label: "2 · basic tools" },
  { value: "3", label: "3 · time and stands" },
  { value: "4", label: "4 · experienced DIY" },
  { value: "5", label: "5 · watch, then pay" },
] as const;

export function GuidesIndex() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parseFilters({
        q: searchParams.get("q") ?? undefined,
        part: searchParams.get("part") ?? undefined,
        job: searchParams.get("job") ?? undefined,
        difficulty: searchParams.get("difficulty") ?? undefined,
        diy: searchParams.get("diy") ?? undefined,
      }),
    [searchParams],
  );

  const [draftQ, setDraftQ] = useState(filters.q ?? "");

  useEffect(() => {
    setDraftQ(filters.q ?? "");
  }, [filters.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = draftQ.trim();
      const current = (filters.q ?? "").trim();
      if (next === current) return;
      replace({ ...filters, q: next || undefined });
    }, 220);
    return () => window.clearTimeout(handle);
    // filters object is new each render; compare fields instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftQ, filters.q, filters.part, filters.job, filters.difficulty, filters.diy]);

  function replace(next: GuideFilters) {
    router.replace(guidesHref(next), { scroll: false });
  }

  const live = useMemo(
    () => filterGuides({ ...filters, q: draftQ }),
    [filters, draftQ],
  );

  const diyOn = filters.diy === "1" || filters.diy === "true";
  const filtered = Boolean(
    draftQ.trim() || filters.part || filters.job || filters.difficulty || diyOn,
  );

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
          Search · {BOOK.length} jobs in the book
        </p>
        <label className="mt-3 block">
          <span className="sr-only">Search how-to jobs</span>
          <input
            value={draftQ}
            onChange={(event) => setDraftQ(event.target.value)}
            placeholder="oil, cabin-filter, TPMS, jump, RO…"
            autoComplete="off"
            className="w-full rounded-sm border border-white/15 bg-bay px-3 py-2.5 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>

        <fieldset className="mt-4">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Job family</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip
              active={!filters.job}
              onClick={() => replace({ ...filters, q: draftQ.trim() || undefined, job: undefined })}
            >
              All bays
            </Chip>
            {GUIDE_JOB_FAMILIES.map((family) => (
              <Chip
                key={family.id}
                active={filters.job === family.id}
                onClick={() =>
                  replace({
                    ...filters,
                    q: draftQ.trim() || undefined,
                    job: filters.job === family.id ? undefined : family.id,
                  })
                }
              >
                {family.stamp}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block sm:min-w-[16rem]">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Difficulty</span>
            <select
              value={filters.difficulty ?? ""}
              onChange={(event) =>
                replace({
                  ...filters,
                  q: draftQ.trim() || undefined,
                  difficulty: event.target.value || undefined,
                })
              }
              className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-xs uppercase tracking-wide text-fluorescent"
            >
              {DIFFICULTY.map((row) => (
                <option key={row.value || "all"} value={row.value}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-wide text-aluminum">
            <input
              type="checkbox"
              checked={diyOn}
              onChange={(event) =>
                replace({
                  ...filters,
                  q: draftQ.trim() || undefined,
                  diy: event.target.checked ? "1" : undefined,
                })
              }
              className="size-4 accent-[var(--ticket)]"
            />
            DIY-safe only
          </label>
        </div>

        {filters.part ? (
          <p className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
            Deep-link part · {filters.part}
            <button
              type="button"
              onClick={() => replace({ ...filters, q: draftQ.trim() || undefined, part: undefined })}
              className="border-b border-ticket/40 text-fluorescent"
            >
              Clear part
            </button>
          </p>
        ) : null}
      </form>

      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-aluminum">
        {live.length} {live.length === 1 ? "job" : "jobs"}
        {filtered ? " match" : " on the board"}
      </p>

      {live.length === 0 ? (
        <EmptySearch q={draftQ} part={filters.part} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {live.map((guide) => (
            <li key={guide.id}>
              <GuideTicket guide={guide} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GuideTicket({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="block rounded-sm border border-white/10 bg-bay-2/80 p-4 transition-colors hover:border-ticket/50"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">
          {familyStamp(guide.jobFamily)}
        </p>
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
            guide.diySafe ? "text-fluorescent" : "text-cone"
          }`}
        >
          {guide.diySafe ? "DIY-safe" : "Shop / watch"}
        </p>
      </div>
      <h2 className="mt-1 font-display text-2xl uppercase leading-none tracking-wide text-fluorescent">
        {guide.title}
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-aluminum">{guide.plainEnglish}</p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">
        {guide.difficulty}/5 · {difficultyLabel(guide.difficulty)} · {guide.timeEstimate}
      </p>
    </Link>
  );
}

function EmptySearch({ q, part }: { q: string; part?: string }) {
  return (
    <div className="rounded-sm border border-dashed border-white/15 bg-bay-2/50 px-5 py-10 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Empty bay</p>
      <h2 className="mt-2 font-display text-3xl uppercase text-fluorescent">No job matches</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-aluminum">
        Nothing in this stall for{q.trim() ? ` “${q.trim()}”` : " that filter"}
        {part ? ` and part ${part}` : ""}. Try a part slug, drop a filter, or start from a family.
      </p>
      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        <EmptyLink href="/guides?q=oil">oil</EmptyLink>
        <EmptyLink href="/guides?part=cabin-filter">?part=cabin-filter</EmptyLink>
        <EmptyLink href="/guides?q=tpms">tpms</EmptyLink>
        <EmptyLink href="/guides">clear the board</EmptyLink>
      </ul>
    </div>
  );
}

function EmptyLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ticket hover:border-ticket"
    >
      {children}
    </Link>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${
        active ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum hover:text-fluorescent"
      }`}
    >
      {children}
    </button>
  );
}
