"use client";

import { useCallback, useSyncExternalStore } from "react";
import { entryFromDraft, parseStoredLog } from "@/lib/service-log/parse";
import {
  SERVICE_LOG_EVENT,
  SERVICE_LOG_STORAGE_KEY,
  type ServiceLogDraft,
  type ServiceLogEntry,
} from "@/lib/service-log/types";

const listeners = new Set<() => void>();
let cached: string | null | undefined;

function emit() {
  for (const listener of listeners) listener();
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(SERVICE_LOG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== SERVICE_LOG_STORAGE_KEY) return;
    cached = undefined;
    onStoreChange();
  };
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  if (cached === undefined) cached = readRaw();
  return cached;
}

function getServerSnapshot() {
  return null;
}

function persist(next: ServiceLogEntry[]) {
  cached = JSON.stringify(next);
  try {
    window.localStorage.setItem(SERVICE_LOG_STORAGE_KEY, cached);
  } catch {
    cached = readRaw();
    throw new Error("This browser blocked local storage. The notebook cannot stamp a line until that is allowed.");
  }
  window.dispatchEvent(new CustomEvent(SERVICE_LOG_EVENT));
  emit();
}

export function useServiceLog() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const entries = parseStoredLog(raw);

  const add = useCallback((draft: ServiceLogDraft) => {
    const entry = entryFromDraft(draft);
    persist([entry, ...parseStoredLog(getSnapshot())]);
    return entry;
  }, []);

  const remove = useCallback((id: string) => {
    persist(parseStoredLog(getSnapshot()).filter((row) => row.id !== id));
  }, []);

  return { entries, add, remove };
}
