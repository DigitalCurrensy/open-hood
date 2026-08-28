import { GUIDE_JOB_FAMILIES, GUIDE_PART_ALIASES } from "@/config/nav/guides";
import raw from "@/data/youtube-glossary.json";
import type { Guide, GuideFilters, JobFamily } from "@/lib/guides/types";
import { youtubeSearchUrl } from "@/lib/guides/youtube";

const BOOK = raw as Guide[];

const FAMILY_IDS = new Set<string>(GUIDE_JOB_FAMILIES.map((family) => family.id));

export function allGuides(): Guide[] {
  return BOOK;
}

export function getGuide(id: string): Guide | undefined {
  return BOOK.find((guide) => guide.id === id);
}

export function familyLabel(jobFamily: JobFamily): string {
  return GUIDE_JOB_FAMILIES.find((family) => family.id === jobFamily)?.label ?? jobFamily;
}

export function familyStamp(jobFamily: JobFamily): string {
  return GUIDE_JOB_FAMILIES.find((family) => family.id === jobFamily)?.stamp ?? jobFamily;
}

export function difficultyLabel(level: number): string {
  if (level <= 1) return "Driveway — almost no tools";
  if (level === 2) return "Driveway — basic tools";
  if (level === 3) return "DIY if you have time and stands";
  if (level === 4) return "Experienced DIY or pay the shop";
  return "Shop job — watch so you can ask questions";
}

export function guideSearchQuery(guide: Guide): string {
  const { title, channel } = guide.youtube;
  if (!channel || channel === "YouTube search") return title.trim();
  return `${title} ${channel}`.trim();
}

export function guideVideoHref(guide: Guide): string {
  if (guide.youtube.videoId && guide.verified) {
    return `https://www.youtube.com/watch?v=${guide.youtube.videoId}`;
  }
  return youtubeSearchUrl(guideSearchQuery(guide) || guide.title);
}

function needle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesQuery(guide: Guide, q: string): boolean {
  const hay = needle(
    [
      guide.id,
      guide.title,
      guide.plainEnglish,
      guide.jobFamily,
      guide.youtube.title,
      guide.youtube.channel,
      ...guide.relatedPartTypes,
      ...guide.relatedSymptomIds,
      ...guide.toolsNeeded,
      ...guide.partsNeeded,
      ...guide.steps,
    ].join(" "),
  );
  return q.split(/\s+/).filter(Boolean).every((word) => hay.includes(word));
}

export function filterGuides(filters: GuideFilters): Guide[] {
  const q = needle(filters.q ?? "");
  const partRaw = (filters.part ?? "").trim().toLowerCase();
  const partAliases = partRaw ? (GUIDE_PART_ALIASES[partRaw] ?? [partRaw]) : [];
  const job = (filters.job ?? "").trim().toLowerCase();
  const difficulty = Number.parseInt(filters.difficulty ?? "", 10);
  const diyOnly = filters.diy === "1" || filters.diy === "true";

  return BOOK.filter((guide) => {
    if (q && !matchesQuery(guide, q)) return false;
    if (partAliases.length && !guide.relatedPartTypes.some((part) => partAliases.includes(part))) {
      return false;
    }
    if (job && FAMILY_IDS.has(job) && guide.jobFamily !== job) return false;
    if (Number.isFinite(difficulty) && difficulty >= 1 && difficulty <= 5 && guide.difficulty !== difficulty) {
      return false;
    }
    if (diyOnly && !guide.diySafe) return false;
    return true;
  });
}

export function relatedGuides(guide: Guide, limit = 4): Guide[] {
  const scored = BOOK.filter((other) => other.id !== guide.id).map((other) => {
    let score = 0;
    if (other.jobFamily === guide.jobFamily) score += 3;
    score += other.relatedPartTypes.filter((part) => guide.relatedPartTypes.includes(part)).length;
    score += other.relatedSymptomIds.filter((id) => guide.relatedSymptomIds.includes(id)).length;
    return { other, score };
  });
  return scored
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.other.title.localeCompare(b.other.title))
    .slice(0, limit)
    .map((row) => row.other);
}

export function parseFilters(input: Record<string, string | string[] | undefined>): GuideFilters {
  const pick = (key: string): string | undefined => {
    const value = input[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };
  return {
    q: pick("q"),
    part: pick("part"),
    job: pick("job"),
    difficulty: pick("difficulty"),
    diy: pick("diy"),
  };
}

export function guidesHref(filters: GuideFilters): string {
  const params = new URLSearchParams();
  const q = filters.q?.trim();
  const part = filters.part?.trim();
  const job = filters.job?.trim();
  const difficulty = filters.difficulty?.trim();
  const diy = filters.diy === "1" || filters.diy === "true";
  if (q) params.set("q", q);
  if (part) params.set("part", part);
  if (job) params.set("job", job);
  if (difficulty) params.set("difficulty", difficulty);
  if (diy) params.set("diy", "1");
  const query = params.toString();
  return query ? `/guides?${query}` : "/guides";
}
