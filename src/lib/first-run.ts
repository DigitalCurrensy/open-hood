import { readBayItem, writeBayItem } from "@/lib/bay-storage";

/** WAVE first-run. Written only after identify → garage → quote. Not an account. */
export const FIRST_RUN_KEY = "openhood.firstRun";

export type FirstRunStamp = "identified" | "ticket" | "sentence";

export interface FirstRunState {
  identified: boolean;
  ticket: boolean;
  sentence: boolean;
  completedAt?: string;
}

const EMPTY: FirstRunState = { identified: false, ticket: false, sentence: false };
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedState: FirstRunState | null = null;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeFirstRun(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

export function readFirstRun(): FirstRunState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = readBayItem(FIRST_RUN_KEY);
    if (raw === cachedRaw) return cachedState;
    cachedRaw = raw;
    if (!raw) {
      cachedState = null;
      return null;
    }
    if (raw === "1") {
      cachedState = { identified: true, ticket: true, sentence: true, completedAt: raw };
      return cachedState;
    }
    const parsed = JSON.parse(raw) as Partial<FirstRunState>;
    if (!parsed || typeof parsed !== "object") {
      cachedState = null;
      return null;
    }
    cachedState = {
      identified: parsed.identified === true,
      ticket: parsed.ticket === true,
      sentence: parsed.sentence === true,
      completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : undefined,
    };
    return cachedState;
  } catch {
    cachedRaw = undefined;
    cachedState = null;
    return null;
  }
}

export function hasCompletedFirstRun(): boolean {
  const state = readFirstRun();
  return Boolean(state?.completedAt);
}

export function shouldShowFirstRun(): boolean {
  return !hasCompletedFirstRun();
}

function persist(next: FirstRunState): FirstRunState {
  const complete = next.identified && next.ticket && next.sentence;
  const written: FirstRunState = {
    ...next,
    completedAt: complete ? next.completedAt || new Date().toISOString() : next.completedAt,
  };
  const raw = JSON.stringify(written);
  try {
    writeBayItem(FIRST_RUN_KEY, raw);
  } catch {
    /* private mode */
  }
  cachedRaw = raw;
  cachedState = written;
  emit();
  return written;
}

export function writeFirstRunStamp(stamp: FirstRunStamp): FirstRunState | null {
  if (typeof window === "undefined") return null;
  const current = readFirstRun() ?? { ...EMPTY };
  if (current[stamp]) return current;
  return persist({ ...current, [stamp]: true });
}

export function completeFirstRun(): FirstRunState | null {
  if (typeof window === "undefined") return null;
  const current = readFirstRun() ?? { ...EMPTY };
  if (current.completedAt && current.identified && current.ticket && current.sentence) return current;
  return persist({
    identified: true,
    ticket: true,
    sentence: true,
    completedAt: current.completedAt || new Date().toISOString(),
  });
}
