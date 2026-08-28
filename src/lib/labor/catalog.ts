import raw from "@/data/job-catalog.json";
import type { CatalogJob, JobCatalogFile, JobFamily, JobKind, JobSummary, LaborMode } from "@/lib/labor/types";

const FILE = raw as JobCatalogFile;

const FAMILIES = new Set<JobFamily>(["service", "brakes", "electrical", "engine", "steering", "diag"]);
const KINDS = new Set<JobKind>(["priced", "note"]);
const MODES = new Set<LaborMode>(["hours", "menu"]);

function needle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isJob(row: CatalogJob): row is CatalogJob {
  return (
    Boolean(row.id && row.slug && row.label) &&
    FAMILIES.has(row.family) &&
    KINDS.has(row.kind) &&
    MODES.has(row.laborMode) &&
    Number.isFinite(row.partsLow) &&
    Number.isFinite(row.partsHigh) &&
    Number.isFinite(row.hoursLow) &&
    Number.isFinite(row.hoursHigh)
  );
}

const JOBS: CatalogJob[] = FILE.jobs.filter(isJob);

export const CATALOG_DISCLAIMER = FILE.disclaimer;
export const JOB_COUNT = JOBS.length;

export function allJobs(): CatalogJob[] {
  return JOBS;
}

export function jobSummaries(): JobSummary[] {
  return JOBS.map((job) => ({
    id: job.id,
    slug: job.slug,
    stamp: job.stamp,
    label: job.label,
    family: job.family,
    scope: job.scope,
    kind: job.kind,
    iceOnly: job.iceOnly,
    partsLow: job.partsLow,
    partsHigh: job.partsHigh,
    hoursLow: job.hoursLow,
    hoursHigh: job.hoursHigh,
    laborMode: job.laborMode,
  }));
}

export function getJob(query: string): CatalogJob | undefined {
  const key = needle(query);
  if (!key) return undefined;
  const compact = key.replace(/\s+/g, "");
  return JOBS.find((job) => {
    if (needle(job.id) === key || needle(job.slug) === key) return true;
    if (needle(job.label) === key || needle(job.stamp) === key) return true;
    if (job.slug.replace(/-/g, "") === compact || job.id.replace(/-/g, "") === compact) return true;
    return job.aliases.some((alias) => needle(alias) === key || alias.toLowerCase().replace(/[^a-z0-9]+/g, "") === compact);
  });
}
