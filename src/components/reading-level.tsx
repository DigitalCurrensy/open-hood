"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  READING_LEVEL_EVENT,
  READING_LEVEL_STORAGE_KEY,
  READING_TOGGLE,
  parseReadingLevel,
  type ReadingLevelId,
} from "@/config/nav/ux";
import "./reading-level.css";

function readStored(): ReadingLevelId {
  try {
    const stored = window.localStorage.getItem(READING_LEVEL_STORAGE_KEY);
    const next = parseReadingLevel(stored) ?? "beginner";
    if (stored === "dummy" || stored === "shop-talk") {
      window.localStorage.setItem(READING_LEVEL_STORAGE_KEY, next);
    }
    return next;
  } catch {
    /* private mode */
  }
  return "beginner";
}

function writeLevel(next: ReadingLevelId) {
  try {
    window.localStorage.setItem(READING_LEVEL_STORAGE_KEY, next);
  } catch {
    /* private mode */
  }
  document.documentElement.dataset.reading = next;
  window.dispatchEvent(new CustomEvent<ReadingLevelId>(READING_LEVEL_EVENT, { detail: next }));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(READING_LEVEL_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(READING_LEVEL_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useReadingLevel(): [ReadingLevelId, (next: ReadingLevelId) => void] {
  const level = useSyncExternalStore(subscribe, readStored, () => "beginner" as const);

  useEffect(() => {
    document.documentElement.dataset.reading = level;
  }, [level]);

  const setLevel = useCallback((next: ReadingLevelId) => {
    writeLevel(next);
  }, []);

  return [level, setLevel];
}

export function ReadingLevel() {
  const [level, setLevel] = useReadingLevel();

  return (
    <div
      role="group"
      aria-label="Reading level"
      className="inline-flex shrink-0 rounded-sm border border-white/15"
    >
      {(Object.values(READING_TOGGLE) as (typeof READING_TOGGLE)[ReadingLevelId][]).map((option) => {
        const active = level === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            title={option.hint}
            onClick={() => setLevel(option.id)}
            className={`reading-stamp inline-flex min-h-11 items-center px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] whitespace-nowrap ${
              active
                ? "bg-ticket text-ticket-ink"
                : "text-aluminum hover:text-fluorescent"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
