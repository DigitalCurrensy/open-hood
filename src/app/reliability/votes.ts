export const RELIABILITY_VOTE_KEY = "openhood.reliability.votes";

export const RELIABILITY_RATINGS = [
  { id: "solid", label: "Solid", hint: "I'd buy another", score: 5 },
  { id: "mixed", label: "Mixed", hint: "Keeps me honest", score: 3 },
  { id: "lemon", label: "Lemon-ish", hint: "I would walk", score: 1 },
] as const;

export type ReliabilityRatingId = (typeof RELIABILITY_RATINGS)[number]["id"];

export interface ReliabilityVote {
  id: string;
  year: string;
  make: string;
  model: string;
  rating: ReliabilityRatingId;
  note: string;
  at: string;
}

const EMPTY_VOTES: ReliabilityVote[] = [];
const voteListeners = new Set<() => void>();
let voteCache: ReliabilityVote[] | undefined;

function emitVotes() {
  for (const listener of voteListeners) listener();
}

export function subscribeVotes(onStoreChange: () => void) {
  voteListeners.add(onStoreChange);
  return () => {
    voteListeners.delete(onStoreChange);
  };
}

export function getVoteSnapshot(): ReliabilityVote[] {
  if (voteCache === undefined) voteCache = readVotes();
  return voteCache;
}

export function getVoteServerSnapshot(): ReliabilityVote[] {
  return EMPTY_VOTES;
}

export function ymmKey(year: string, make: string, model: string): string {
  return [year.trim(), make.trim().toLowerCase(), model.trim().toLowerCase()].join("|");
}

export function readVotes(): ReliabilityVote[] {
  try {
    const raw = window.localStorage.getItem(RELIABILITY_VOTE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isVote);
  } catch {
    return [];
  }
}

export function writeVotes(votes: ReliabilityVote[]) {
  voteCache = votes;
  try {
    window.localStorage.setItem(RELIABILITY_VOTE_KEY, JSON.stringify(votes));
  } catch {
    /* quota / private */
  }
  emitVotes();
}

export function addVote(input: Omit<ReliabilityVote, "id" | "at">): ReliabilityVote[] {
  const next: ReliabilityVote = {
    ...input,
    id: `vote_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
  };
  const votes = [next, ...getVoteSnapshot()].slice(0, 80);
  writeVotes(votes);
  return votes;
}

export function removeVote(id: string): ReliabilityVote[] {
  const votes = getVoteSnapshot().filter((row) => row.id !== id);
  writeVotes(votes);
  return votes;
}

export function votesForNameplate(votes: ReliabilityVote[], year: string, make: string, model: string): ReliabilityVote[] {
  const key = ymmKey(year, make, model);
  return votes.filter((row) => ymmKey(row.year, row.make, row.model) === key);
}

export function panelAverage(votes: ReliabilityVote[]): number | null {
  if (!votes.length) return null;
  const map = Object.fromEntries(RELIABILITY_RATINGS.map((row) => [row.id, row.score])) as Record<
    ReliabilityRatingId,
    number
  >;
  const sum = votes.reduce((total, row) => total + (map[row.rating] ?? 0), 0);
  return sum / votes.length;
}

function isVote(row: unknown): row is ReliabilityVote {
  if (!row || typeof row !== "object") return false;
  const value = row as Partial<ReliabilityVote>;
  return Boolean(
    value.id &&
      value.year &&
      value.make &&
      value.model &&
      (value.rating === "solid" || value.rating === "mixed" || value.rating === "lemon") &&
      typeof value.at === "string",
  );
}

export interface ComplaintDeskLink {
  href: string;
  stamp: string;
  label: string;
  kind: "playbook" | "quote" | "pattern";
  why?: string;
}

export interface ComplaintComponent {
  name: string;
  count: number;
  bucket?: string;
  why?: string;
  links?: ComplaintDeskLink[];
}

export function componentShare(count: number, total: number): string {
  if (!total) return "—";
  const pct = Math.round((count / total) * 100);
  return `${pct}% of this SaferCar pile`;
}

export function complaintPace(count: number, year: number, asOfYear: number): {
  ageYears: number;
  perYear: number;
  heat: "quiet" | "typical" | "heavy";
  label: string;
} {
  const ageYears = Math.max(1, asOfYear - year);
  const perYear = count / ageYears;
  const heat = perYear < 8 ? "quiet" : perYear < 25 ? "typical" : "heavy";
  const label =
    heat === "quiet"
      ? "Quieter SaferCar file for a nameplate this old"
      : heat === "typical"
        ? "A typical pile — people file when something bites"
        : "A heavy file. Still not a failure rate per 100 cars.";
  return { ageYears, perYear, heat, label };
}
