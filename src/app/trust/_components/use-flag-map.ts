"use client";

import { useCallback, useSyncExternalStore } from "react";

const EMPTY: Record<string, boolean> = {};
const cache = new Map<string, Record<string, boolean>>();
const listeners = new Map<string, Set<() => void>>();

function emit(storageKey: string) {
  const set = listeners.get(storageKey);
  if (!set) return;
  for (const listener of set) listener();
}

function readFlags(storageKey: string): Record<string, boolean> {
  const hit = cache.get(storageKey);
  if (hit) return hit;
  try {
    const raw = window.localStorage.getItem(storageKey);
    const next = raw ? (JSON.parse(raw) as Record<string, boolean>) : EMPTY;
    cache.set(storageKey, next);
    return next;
  } catch {
    cache.set(storageKey, EMPTY);
    return EMPTY;
  }
}

function writeFlags(storageKey: string, next: Record<string, boolean>) {
  cache.set(storageKey, next);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    /* quota / private */
  }
  emit(storageKey);
}

export function useFlagMap(storageKey: string) {
  const flags = useSyncExternalStore(
    (onStoreChange) => {
      let set = listeners.get(storageKey);
      if (!set) {
        set = new Set();
        listeners.set(storageKey, set);
      }
      set.add(onStoreChange);
      return () => {
        set.delete(onStoreChange);
      };
    },
    () => readFlags(storageKey),
    () => EMPTY,
  );

  const toggle = useCallback(
    (id: string) => {
      writeFlags(storageKey, { ...readFlags(storageKey), [id]: !readFlags(storageKey)[id] });
    },
    [storageKey],
  );

  const mark = useCallback(
    (id: string, value: boolean) => {
      writeFlags(storageKey, { ...readFlags(storageKey), [id]: value });
    },
    [storageKey],
  );

  return { flags, toggle, mark, count: Object.values(flags).filter(Boolean).length } as const;
}
