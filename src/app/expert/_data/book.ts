import {
  COMPLAINT_MAP_DISCLAIMER,
  complaintCardFor,
  componentsForPlaybook,
  filterPatternsForMake,
  linksForComplaint,
} from "@/app/expert/_data/complaint-map";
import { EXTRA_PLAYBOOKS } from "@/app/expert/_data/extra-playbooks";
import { EXTRA_TSB } from "@/app/expert/_data/extra-tsb";
import {
  allPlaybooks,
  audienceLabel,
  getPlaybook,
  isPlaybookAudience,
  playbooksHref,
} from "@/lib/expert/playbooks";
import { allTsbPatterns, getTsbPattern, tsbMakes as coreTsbMakes } from "@/lib/expert/tsb";
import type { ExpertFilters, Playbook, TsbPattern } from "@/lib/expert/types";

export { audienceLabel, isPlaybookAudience, playbooksHref };
export { COMPLAINT_MAP_DISCLAIMER, complaintCardFor, componentsForPlaybook, linksForComplaint };

export const EXTRA_PLAYBOOK_COUNT = EXTRA_PLAYBOOKS.length;
export const EXTRA_TSB_COUNT = EXTRA_TSB.length;
export const EXPERT_PLAYBOOK_COUNT = allPlaybooks().length + EXTRA_PLAYBOOK_COUNT;
export const EXPERT_TSB_COUNT = allTsbPatterns().length + EXTRA_TSB_COUNT;

export function allExpertPlaybooks(): Playbook[] {
  const seen = new Set(allPlaybooks().map((row) => row.id));
  return [...allPlaybooks(), ...EXTRA_PLAYBOOKS.filter((row) => !seen.has(row.id))];
}

export function getExpertPlaybook(slug: string): Playbook | undefined {
  const key = slug.trim().toLowerCase();
  return getPlaybook(key) ?? EXTRA_PLAYBOOKS.find((row) => row.slug === key || row.id === key);
}

export function expertPlaybookSlugs(): string[] {
  return allExpertPlaybooks().map((row) => row.slug);
}

function needle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function filterExpertPlaybooks(filters: ExpertFilters): Playbook[] {
  const q = needle(filters.q ?? "");
  return allExpertPlaybooks().filter((row) => {
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

export function relatedExpertPlaybooks(playbook: Playbook): Playbook[] {
  const linked = new Set(playbook.relatedTsb);
  return allExpertPlaybooks()
    .filter((row) => {
      if (row.id === playbook.id) return false;
      return row.relatedTsb.some((id) => linked.has(id)) || row.audience === playbook.audience;
    })
    .slice(0, 3);
}

export function allExpertTsb(): TsbPattern[] {
  const seen = new Set(allTsbPatterns().map((row) => row.id));
  return [...allTsbPatterns(), ...EXTRA_TSB.filter((row) => !seen.has(row.id))];
}

export function getExpertTsb(id: string): TsbPattern | undefined {
  return getTsbPattern(id) ?? EXTRA_TSB.find((row) => row.id === id);
}

export function expertTsbMakes(): string[] {
  return [...new Set([...coreTsbMakes(), ...EXTRA_TSB.flatMap((row) => row.makes)])]
    .filter((make) => make !== "Many")
    .sort((a, b) => a.localeCompare(b));
}

export function filterExpertTsb(filters: ExpertFilters): TsbPattern[] {
  const q = needle(filters.q ?? "");
  const make = needle(filters.make ?? "");
  const symptom = needle(filters.symptom ?? "");
  return allExpertTsb().filter((row) => {
    if (make && !row.makes.some((name) => needle(name).includes(make) || make.includes(needle(name)))) {
      return false;
    }
    if (symptom && !needle(row.symptom).includes(symptom) && !needle(row.stamp).includes(symptom)) {
      return false;
    }
    if (!q) return true;
    const hay = needle(
      [row.id, row.stamp, row.symptom, row.years, row.pattern, row.dummyMove, row.geniusNote, ...row.makes, ...row.models].join(" "),
    );
    return q.split(/\s+/).filter(Boolean).every((word) => hay.includes(word));
  });
}

export function patternsForExpertPlaybook(playbookId: string): TsbPattern[] {
  return allExpertTsb().filter((row) => row.relatedPlaybooks.includes(playbookId));
}

export function playbooksForComplaint(component: string): Playbook[] {
  const card = complaintCardFor(component);
  return card.playbookSlugs
    .map((slug) => getExpertPlaybook(slug))
    .filter((row): row is Playbook => Boolean(row));
}

export function patternsForComplaint(component: string, make?: string): TsbPattern[] {
  const ids = new Set(filterPatternsForMake(complaintCardFor(component).patternIds, make));
  return allExpertTsb().filter((row) => ids.has(row.id));
}

export function complaintMapPayload(component: string, make?: string) {
  const card = complaintCardFor(component);
  return {
    ...card,
    patternIds: filterPatternsForMake(card.patternIds, make),
    links: linksForComplaint(component, make),
    playbooks: playbooksForComplaint(component).map((row) => ({
      slug: row.slug,
      stamp: row.stamp,
      title: row.title,
    })),
    patterns: patternsForComplaint(component, make).map((row) => ({
      id: row.id,
      stamp: row.stamp,
      symptom: row.symptom,
    })),
    disclaimer: COMPLAINT_MAP_DISCLAIMER,
  };
}
