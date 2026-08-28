import raw from "@/data/scenario-playbooks.json";
import type { ExpertFilters, Playbook, PlaybookAudience } from "@/lib/expert/types";

const BOOK = raw as Playbook[];

const AUDIENCES = new Set<PlaybookAudience>(["owner", "buyer", "ev", "claim", "shop"]);

const ALLOWED_PREFIXES = [
  "/agent",
  "/guides",
  "/quote",
  "/jobs",
  "/directory",
  "/obd",
  "/recalls",
  "/symptoms",
  "/mechanic-mode",
  "/shops",
  "/auctions",
  "/garage",
  "/parts",
  "/expert",
];

export const PLAYBOOK_COUNT = BOOK.length;

export function allPlaybooks(): Playbook[] {
  return BOOK;
}

export function getPlaybook(slug: string): Playbook | undefined {
  const key = slug.trim().toLowerCase();
  return BOOK.find((row) => row.slug === key || row.id === key);
}

export function playbookSlugs(): string[] {
  return BOOK.map((row) => row.slug);
}

export function isPlaybookAudience(value: string | undefined): value is PlaybookAudience {
  return Boolean(value && AUDIENCES.has(value as PlaybookAudience));
}

export function audienceLabel(audience: PlaybookAudience): string {
  switch (audience) {
    case "buyer":
      return "Buyer / PPI";
    case "ev":
      return "EV owner";
    case "claim":
      return "Claim / file";
    case "shop":
      return "Which roof";
    default:
      return "Daily owner";
  }
}

function needle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function parsePlaybookFilters(input: Record<string, string | undefined>): ExpertFilters {
  const q = input.q?.trim();
  const audience = input.audience?.trim();
  return {
    q: q || undefined,
    audience: isPlaybookAudience(audience) ? audience : undefined,
  };
}

export function filterPlaybooks(filters: ExpertFilters): Playbook[] {
  const q = needle(filters.q ?? "");
  return BOOK.filter((row) => {
    if (filters.audience && row.audience !== filters.audience) return false;
    if (!q) return true;
    const hay = needle(
      [
        row.id,
        row.slug,
        row.stamp,
        row.title,
        row.kicker,
        row.plainEnglish,
        row.scenario,
        ...row.script,
        ...row.dummySteps.map((step) => `${step.title} ${step.do}`),
        ...row.geniusNotes.map((note) => `${note.label} ${note.meaning}`),
      ].join(" "),
    );
    return q.split(/\s+/).filter(Boolean).every((word) => hay.includes(word));
  });
}

export function playbooksHref(filters: ExpertFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.audience) params.set("audience", filters.audience);
  const query = params.toString();
  return query ? `/expert?${query}` : "/expert";
}

export function isInternalExpertHref(href: string): boolean {
  if (!href.startsWith("/")) return false;
  return ALLOWED_PREFIXES.some((prefix) => href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}?`));
}

export function relatedPlaybooks(playbook: Playbook): Playbook[] {
  const linked = new Set(playbook.relatedTsb);
  return BOOK.filter((row) => {
    if (row.id === playbook.id) return false;
    return row.relatedTsb.some((id) => linked.has(id)) || row.audience === playbook.audience;
  }).slice(0, 3);
}
