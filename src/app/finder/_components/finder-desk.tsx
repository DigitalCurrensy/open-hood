"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { JobAisle } from "@/app/finder/_components/job-aisle";
import { decorateJob, featuredJobs, finderHref, FINDER_JOB_COUNT, normalizeFinderCode, searchJobs } from "@/lib/finder/jobs";
import type { FinderJob } from "@/lib/finder/types";
import { ymmFromRecord, ymmLabel } from "@/lib/finder/ymm";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40";

function firstJob(hits: ReturnType<typeof searchJobs>, preferred?: string): FinderJob | undefined {
  if (preferred) {
    const match = hits.find((hit) => hit.job.slug === preferred || hit.job.id === preferred);
    if (match) return match.job;
  }
  return hits[0]?.job;
}

export function FinderDesk() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vehicle] = useIdentifiedVehicle();

  const urlCode = searchParams.get("code") ?? "";
  const urlQ = searchParams.get("q") ?? searchParams.get("symptom") ?? "";
  const urlJob = searchParams.get("job") ?? "";
  const urlYear = searchParams.get("year") ?? "";
  const urlMake = searchParams.get("make") ?? "";
  const urlModel = searchParams.get("model") ?? "";

  const sessionYmm = useMemo(
    () =>
      ymmFromRecord({
        year: vehicle?.specs.year,
        make: vehicle?.specs.make,
        model: vehicle?.specs.model,
        engineDisplacement: vehicle?.specs.engineDisplacement,
        engineModel: vehicle?.specs.engineModel,
        cylinders: vehicle?.specs.cylinders,
        driveType: vehicle?.specs.driveType,
      }),
    [vehicle],
  );

  const urlKey = `${urlCode}|${urlQ}|${urlJob}`;
  const [code, setCode] = useState(urlCode);
  const [q, setQ] = useState(urlQ);
  const [selected, setSelected] = useState(urlJob);
  const [seenUrl, setSeenUrl] = useState(urlKey);
  if (urlKey !== seenUrl) {
    setSeenUrl(urlKey);
    setCode(urlCode);
    setQ(urlQ);
    setSelected(urlJob);
  }

  const [yearDraft, setYearDraft] = useState("");
  const [makeDraft, setMakeDraft] = useState("");
  const [modelDraft, setModelDraft] = useState("");
  const year = urlYear || yearDraft || sessionYmm.year;
  const make = urlMake || makeDraft || sessionYmm.make;
  const model = urlModel || modelDraft || sessionYmm.model;

  const ymm = ymmFromRecord({
    year,
    make,
    model,
    engine: sessionYmm.engine,
    drive: sessionYmm.drive,
  });

  const hits = useMemo(
    () => searchJobs({ code, q, job: selected && !code && !q ? selected : urlJob }),
    [code, q, selected, urlJob],
  );

  const looking = Boolean(normalizeFinderCode(code) || q.trim() || urlJob || selected);
  const active = looking ? firstJob(hits, selected || urlJob) : undefined;
  const decorated = active ? decorateJob(active, ymm) : null;
  const empty = !looking;
  const board = empty ? featuredJobs() : hits.map((hit) => hit.job);

  function commit(next: { code?: string; q?: string; job?: string }) {
    const nextCode = next.code ?? code;
    const nextQ = next.q ?? q;
    router.replace(
      finderHref({
        code: nextCode.trim() || undefined,
        q: nextQ.trim() || undefined,
        job: next.job,
        year: year || undefined,
        make: make || undefined,
        model: model || undefined,
      }),
      { scroll: false },
    );
  }

  return (
    <div className="space-y-6">
      <form
        className="finder-stripe rounded-sm p-5"
        onSubmit={(event) => {
          event.preventDefault();
          commit({ code, q, job: undefined });
        }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">
          Counter ticket · {FINDER_JOB_COUNT} jobs in the aisle
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[8rem_1fr]">
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Code</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="P0420"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className={`${FIELD} uppercase`}
            />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Symptom or job</span>
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="cabin filter, brake squeal, musty AC…"
              autoComplete="off"
              className={FIELD}
            />
          </label>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Year</span>
            <input
              value={year}
              onChange={(event) => setYearDraft(event.target.value)}
              inputMode="numeric"
              className={FIELD}
            />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Make</span>
            <input value={make} onChange={(event) => setMakeDraft(event.target.value)} className={FIELD} />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Model</span>
            <input value={model} onChange={(event) => setModelDraft(event.target.value)} className={FIELD} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
          >
            Pull the jobs
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
            {ymmLabel(ymm) || "Identify a car on the home bay for YMM"}
            {sessionYmm.engine ? ` · ${sessionYmm.engine}` : ""}
            {sessionYmm.drive ? ` · ${sessionYmm.drive}` : ""}
          </p>
        </div>
      </form>

      <section className="grid gap-3 md:grid-cols-2">
        {(empty ? board : hits).map((item) => {
          const job = "job" in item ? item.job : item;
          const reason = "reason" in item ? item.reason : job.kicker;
          const current = active?.slug === job.slug;
          return (
            <div
              key={job.id}
              className={`rounded-sm border p-4 ${
                current ? "border-ticket bg-ticket/10" : "border-white/10 bg-bay-2/80"
              }`}
            >
              <button
                type="button"
                aria-pressed={current}
                className="w-full text-left"
                onClick={() => {
                  setSelected(job.slug);
                  commit({
                    code: code.trim() || undefined,
                    q: q.trim() || undefined,
                    job: job.slug,
                  });
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">
                  {job.stamp} · {job.split === "diy" ? "DIY" : job.split === "shop" ? "Shop" : "Either"}
                </p>
                <p className="mt-1 font-display text-2xl uppercase leading-none text-fluorescent">{job.title}</p>
                <p className="mt-2 text-sm leading-6 text-aluminum">{reason}</p>
              </button>
              <p className="mt-2">
                <Link href={`/finder/${job.slug}`} className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
                  Open aisle
                </Link>
              </p>
            </div>
          );
        })}
      </section>

      {empty && !active ? (
        <p className="text-sm leading-6 text-aluminum">
          Type <Link href="/finder?code=P0420" className="text-ticket">P0420</Link> or{" "}
          <Link href="/finder?q=cabin+filter" className="text-ticket">cabin filter</Link>. We do not throw parts from a
          letter.
        </p>
      ) : null}

      {!empty && !hits.length ? (
        <p className="rounded-sm border border-white/10 bg-bay-2/80 px-4 py-3 text-sm leading-6 text-aluminum">
          Nothing on that hook. Try a five-character code or a part name — cabin filter, pads, battery.
        </p>
      ) : null}

      {decorated ? (
        <JobAisle
          job={decorated.job}
          ymm={ymm}
          aisle={decorated.aisle}
          parts={decorated.parts}
          related={decorated.related}
        />
      ) : null}
    </div>
  );
}
