import raw from "@/data/tsb-patterns.json";
import type { ExpertFilters, TsbPattern } from "@/lib/expert/types";

const BOOK = raw as TsbPattern[];

export const TSB_COUNT = BOOK.length;

export const SAFERCAR_RECALLS = "https://www.nhtsa.gov/recalls";
export const SAFERCAR_TAKATA = "https://www.nhtsa.gov/campaign/takata-air-bags";

export function allTsbPatterns(): TsbPattern[] {
  return BOOK;
}

export function getTsbPattern(id: string): TsbPattern | undefined {
  return BOOK.find((row) => row.id === id);
}

function needle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function parseTsbFilters(input: Record<string, string | undefined>): ExpertFilters {
  return {
    q: input.q?.trim() || undefined,
    make: input.make?.trim() || undefined,
    symptom: input.symptom?.trim() || undefined,
  };
}

export function tsbMakes(): string[] {
  return [...new Set(BOOK.flatMap((row) => row.makes))]
    .filter((make) => make !== "Many")
    .sort((a, b) => a.localeCompare(b));
}

export function filterTsbPatterns(filters: ExpertFilters): TsbPattern[] {
  const q = needle(filters.q ?? "");
  const make = needle(filters.make ?? "");
  const symptom = needle(filters.symptom ?? "");
  return BOOK.filter((row) => {
    if (make && !row.makes.some((name) => needle(name).includes(make) || make.includes(needle(name)))) {
      return false;
    }
    if (symptom && !needle(row.symptom).includes(symptom) && !needle(row.stamp).includes(symptom)) {
      return false;
    }
    if (!q) return true;
    const hay = needle(
      [
        row.id,
        row.stamp,
        row.symptom,
        row.years,
        row.pattern,
        row.dummyMove,
        row.geniusNote,
        ...row.makes,
        ...row.models,
      ].join(" "),
    );
    return q.split(/\s+/).filter(Boolean).every((word) => hay.includes(word));
  });
}

export function patternsForPlaybook(playbookId: string): TsbPattern[] {
  return BOOK.filter((row) => row.relatedPlaybooks.includes(playbookId));
}
