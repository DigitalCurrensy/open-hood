import raw from "@/data/fix-finder-jobs.json";
import { aisleTickets } from "@/lib/finder/links";
import type {
  FinderAisleAnswer,
  FinderFilters,
  FinderHit,
  FinderJob,
  FinderQuery,
  FinderYmm,
} from "@/lib/finder/types";
import { drivePlain, emptyYmm, ymmFromRecord } from "@/lib/finder/ymm";

const BOOK = raw as FinderJob[];

export const FINDER_JOB_COUNT = BOOK.length;

export const FEATURED_SLUGS = ["p0420", "cabin-filter", "brake-pads", "battery", "p0300", "oil-change"] as const;

export function allJobs(): FinderJob[] {
  return BOOK;
}

export function jobSlugs(): string[] {
  return BOOK.map((row) => row.slug);
}

export function getJob(slug: string): FinderJob | undefined {
  const key = slug.trim().toLowerCase();
  return BOOK.find((row) => row.slug === key || row.id === key);
}

export function relatedJobs(job: FinderJob): FinderJob[] {
  return job.related.map((id) => getJob(id)).filter((row): row is FinderJob => Boolean(row));
}

export function featuredJobs(): FinderJob[] {
  return FEATURED_SLUGS.map((slug) => getJob(slug)).filter((row): row is FinderJob => Boolean(row));
}

export function normalizeFinderCode(rawCode: string): string {
  return rawCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function isPlausibleFinderCode(code: string): boolean {
  return /^[PCBU][0-3][0-9A-F]{3}$/.test(code);
}

function needle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function parseFinderFilters(input: Record<string, string | undefined | null>): FinderFilters {
  const code = normalizeFinderCode(input.code ?? "");
  const q = (input.q ?? "").trim();
  const symptom = (input.symptom ?? "").trim();
  const job = (input.job ?? "").trim().toLowerCase();
  return {
    code: code || undefined,
    q: q || undefined,
    symptom: symptom || undefined,
    job: job || undefined,
    ymm: ymmFromRecord({
      year: input.year ?? undefined,
      make: input.make ?? undefined,
      model: input.model ?? undefined,
      engine: input.engine ?? undefined,
      engineDisplacement: input.engineDisplacement ?? undefined,
      engineModel: input.engineModel ?? undefined,
      drive: input.drive ?? undefined,
      driveType: input.driveType ?? undefined,
    }),
  };
}

function queryText(query: FinderQuery): string {
  return needle(query.q ?? query.symptom ?? query.job ?? "");
}

function scoreJob(job: FinderJob, query: FinderQuery): { score: number; reason: string } {
  const code = normalizeFinderCode(query.code ?? "");
  const q = queryText(query);
  const qCompact = compact(q);
  let score = 0;
  let reason = "";

  if (code && job.codes.includes(code)) {
    score += 120;
    reason = `${code} is on this ticket`;
  }

  const jobKey = (query.job ?? "").trim().toLowerCase();
  if (jobKey && (job.slug === jobKey || job.id === jobKey)) {
    score += 110;
    reason = reason || "Exact aisle hook";
  }

  if (qCompact) {
    if (job.codes.some((item) => compact(item) === qCompact)) {
      score += 120;
      reason = reason || `${qCompact.toUpperCase()} is on this ticket`;
    }
    if (compact(job.slug) === qCompact || compact(job.id) === qCompact) {
      score += 90;
      reason = reason || "Exact aisle hook";
    }
    if (job.aliases.some((alias) => compact(alias) === qCompact)) {
      score += 80;
      reason = reason || "Name match";
    } else if (job.aliases.some((alias) => compact(alias).includes(qCompact) || qCompact.includes(compact(alias)))) {
      score += 45;
      reason = reason || "Alias match";
    }
    if (job.symptoms.some((symptom) => compact(symptom).includes(qCompact) || qCompact.includes(compact(symptom)))) {
      score += 40;
      reason = reason || "Symptom match";
    }
    if (needle(job.title).includes(q) || needle(job.kicker).includes(q)) {
      score += 28;
      reason = reason || "Title match";
    }
    if (job.parts.some((part) => compact(part.label).includes(qCompact) || compact(part.query).includes(qCompact))) {
      score += 22;
      reason = reason || "Part on the hook";
    }
    if (needle(job.plainEnglish).includes(q) || needle(job.doNotThrow).includes(q)) {
      score += 8;
      reason = reason || "Copy match";
    }
  }

  if (job.lane === "diagnose") score += 2;
  return { score, reason: reason || "On the board" };
}

export function searchJobs(query: FinderQuery): FinderHit[] {
  const code = normalizeFinderCode(query.code ?? "");
  const q = queryText(query);
  const jobKey = (query.job ?? "").trim();
  if (!code && !q && !jobKey) {
    return featuredJobs().map((job) => ({
      job,
      score: 1,
      reason: "Common aisle — type a code or a symptom",
    }));
  }

  return BOOK.map((job) => {
    const { score, reason } = scoreJob(job, query);
    return { job, score, reason };
  })
    .filter((hit) => hit.score >= 20)
    .sort((a, b) => b.score - a.score || a.job.title.localeCompare(b.job.title));
}

export function answerAisle(job: FinderJob, ymm: FinderYmm): FinderAisleAnswer[] {
  return job.aisleQuestions.map((question) => {
    if (question.session === "engine" && ymm.engine) {
      return { question, answer: ymm.engine, source: "session" as const };
    }
    if (question.session === "drive" && ymm.drive) {
      return { question, answer: drivePlain(ymm.drive) || ymm.drive, source: "session" as const };
    }
    return { question, answer: "", source: "ask" as const };
  });
}

export function decorateJob(job: FinderJob, ymm: FinderYmm = emptyYmm()) {
  return {
    job,
    aisle: answerAisle(job, ymm),
    parts: aisleTickets(job.parts, ymm),
    related: relatedJobs(job).map((row) => ({ slug: row.slug, stamp: row.stamp, title: row.title })),
  };
}

export function finderHref(next: {
  code?: string;
  q?: string;
  job?: string;
  year?: string;
  make?: string;
  model?: string;
}): string {
  const params = new URLSearchParams();
  if (next.code) params.set("code", normalizeFinderCode(next.code));
  if (next.q) params.set("q", next.q);
  if (next.job) params.set("job", next.job);
  if (next.year) params.set("year", next.year);
  if (next.make) params.set("make", next.make);
  if (next.model) params.set("model", next.model);
  const qs = params.toString();
  return qs ? `/finder?${qs}` : "/finder";
}
