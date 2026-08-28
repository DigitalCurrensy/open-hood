"use client";

import { useCallback, useSyncExternalStore } from "react";
import { BOOK_STORAGE_EVENT, BOOK_STORAGE_KEY } from "@/config/nav/book";
import type { BookBoardRow, BookDraft, BookSubmitResult } from "@/lib/book/types";

const listeners = new Set<() => void>();
let cached: string | null | undefined;

function emit() {
  for (const listener of listeners) listener();
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(BOOK_STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== BOOK_STORAGE_KEY) return;
    cached = undefined;
    onStoreChange();
  };
  const onCustom = () => {
    cached = undefined;
    onStoreChange();
  };
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOK_STORAGE_EVENT, onCustom);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOK_STORAGE_EVENT, onCustom);
  };
}

function getSnapshot() {
  if (cached === undefined) cached = readRaw();
  return cached;
}

function getServerSnapshot() {
  return null;
}

function parseBoard(raw: string | null): BookBoardRow[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isBoardRow)
      .map((row) => ({ ...row, dispatched: false as const, status: "sent" as const }))
      .slice(0, 24);
  } catch {
    return [];
  }
}

function isBoardRow(value: unknown): value is BookBoardRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.zip === "string" && typeof row.job === "string";
}

function persist(next: BookBoardRow[]) {
  cached = JSON.stringify(next);
  try {
    window.localStorage.setItem(BOOK_STORAGE_KEY, cached);
  } catch {
    cached = readRaw();
    throw new Error("This browser blocked local storage. The status board cannot stamp a line.");
  }
  window.dispatchEvent(new CustomEvent(BOOK_STORAGE_EVENT));
  emit();
}

export function rowFromSubmit(result: BookSubmitResult, draft: BookDraft): BookBoardRow {
  const vehicle = [draft.year, draft.make, draft.model].filter(Boolean).join(" ");
  return {
    id: result.id,
    receivedAt: result.receivedAt,
    job: draft.job,
    zip: draft.zip.trim(),
    venue: draft.venue,
    window: draft.window,
    vehicle,
    delivery: result.delivery,
    dispatched: false,
    status: "sent",
  };
}

export function useBookBoard() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const rows = parseBoard(raw);

  const remember = useCallback((result: BookSubmitResult, draft: BookDraft) => {
    const next = rowFromSubmit(result, draft);
    persist([next, ...parseBoard(getSnapshot()).filter((row) => row.id !== next.id)]);
    return next;
  }, []);

  const forget = useCallback((id: string) => {
    persist(parseBoard(getSnapshot()).filter((row) => row.id !== id));
  }, []);

  const clear = useCallback(() => {
    persist([]);
  }, []);

  return { rows, remember, forget, clear };
}
