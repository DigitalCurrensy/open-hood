"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { IdentifiedVehicle, QuoteAnalysisResult } from "@/lib/types";

const KEY = "autoshield.vehicle";
const listeners = new Set<() => void>();
let cached: string | null | undefined;

function emit() {
  for (const listener of listeners) listener();
}

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot() {
  if (cached === undefined) cached = readRaw();
  return cached;
}

function getServerSnapshot() {
  return null;
}

export function useIdentifiedVehicle() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const vehicle: IdentifiedVehicle | null = raw ? (JSON.parse(raw) as IdentifiedVehicle) : null;

  const setVehicle = useCallback((next: IdentifiedVehicle | null) => {
    cached = next ? JSON.stringify(next) : null;
    try {
      if (cached) sessionStorage.setItem(KEY, cached);
      else sessionStorage.removeItem(KEY);
    } catch {
      // quota / private mode
    }
    emit();
  }, []);

  return [vehicle, setVehicle] as const;
}

const QUOTE_KEY = "autoshield.quote";
const quoteListeners = new Set<() => void>();
let quoteCached: string | null | undefined;

function emitQuote() {
  for (const listener of quoteListeners) listener();
}

function readQuoteRaw(): string | null {
  try {
    return sessionStorage.getItem(QUOTE_KEY);
  } catch {
    return null;
  }
}

function subscribeQuote(onStoreChange: () => void) {
  quoteListeners.add(onStoreChange);
  return () => {
    quoteListeners.delete(onStoreChange);
  };
}

function getQuoteSnapshot() {
  if (quoteCached === undefined) quoteCached = readQuoteRaw();
  return quoteCached;
}

export function useLastQuote() {
  const raw = useSyncExternalStore(subscribeQuote, getQuoteSnapshot, getServerSnapshot);
  const quote: QuoteAnalysisResult | null = raw ? (JSON.parse(raw) as QuoteAnalysisResult) : null;

  const setQuote = useCallback((next: QuoteAnalysisResult | null) => {
    quoteCached = next ? JSON.stringify(next) : null;
    try {
      if (quoteCached) sessionStorage.setItem(QUOTE_KEY, quoteCached);
      else sessionStorage.removeItem(QUOTE_KEY);
    } catch {
      // quota / private mode
    }
    emitQuote();
  }, []);

  return [quote, setQuote] as const;
}
