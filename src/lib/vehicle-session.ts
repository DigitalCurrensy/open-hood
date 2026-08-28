"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readBayItem, writeBayItem } from "@/lib/bay-storage";
import type { IdentifiedVehicle, QuoteAnalysisResult } from "@/lib/types";

const KEY = "openhood.vehicle";
const listeners = new Set<() => void>();
let cached: string | null | undefined;
let parsedVehicle: IdentifiedVehicle | null = null;
let parsedVehicleRaw: string | null | undefined;

function emit() {
  for (const listener of listeners) listener();
}

function parseVehicle(raw: string | null | undefined): IdentifiedVehicle | null {
  if (raw === parsedVehicleRaw) return parsedVehicle;
  parsedVehicleRaw = raw;
  if (!raw) {
    parsedVehicle = null;
    return null;
  }
  try {
    parsedVehicle = JSON.parse(raw) as IdentifiedVehicle;
  } catch {
    parsedVehicle = null;
  }
  return parsedVehicle;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot() {
  if (cached === undefined) cached = readBayItem(KEY);
  return cached;
}

function getServerSnapshot() {
  return null;
}

export function useIdentifiedVehicle() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const vehicle = parseVehicle(raw);

  const setVehicle = useCallback((next: IdentifiedVehicle | null) => {
    cached = next ? JSON.stringify(next) : null;
    parsedVehicleRaw = cached;
    parsedVehicle = next;
    writeBayItem(KEY, cached);
    emit();
  }, []);

  return [vehicle, setVehicle] as const;
}

const QUOTE_KEY = "openhood.quote";
const QUOTE_HISTORY_KEY = "openhood.quote.history";
const quoteListeners = new Set<() => void>();
let quoteCached: string | null | undefined;
let parsedQuote: QuoteAnalysisResult | null = null;
let parsedQuoteRaw: string | null | undefined;

function parseQuote(raw: string | null | undefined): QuoteAnalysisResult | null {
  if (raw === parsedQuoteRaw) return parsedQuote;
  parsedQuoteRaw = raw;
  if (!raw) {
    parsedQuote = null;
    return null;
  }
  try {
    parsedQuote = JSON.parse(raw) as QuoteAnalysisResult;
  } catch {
    parsedQuote = null;
  }
  return parsedQuote;
}
const historyListeners = new Set<() => void>();
let historyCached: string | null | undefined;

export interface StoredQuoteTicket {
  savedAt: string;
  shopName: string | null;
  totalQuoted: number | null;
  summary: string;
  flaggedCount: number;
  script: string[];
}

function emitQuote() {
  for (const listener of quoteListeners) listener();
}

function emitHistory() {
  for (const listener of historyListeners) listener();
}

function subscribeQuote(onStoreChange: () => void) {
  quoteListeners.add(onStoreChange);
  return () => {
    quoteListeners.delete(onStoreChange);
  };
}

function subscribeHistory(onStoreChange: () => void) {
  historyListeners.add(onStoreChange);
  return () => {
    historyListeners.delete(onStoreChange);
  };
}

function getQuoteSnapshot() {
  if (quoteCached === undefined) quoteCached = readBayItem(QUOTE_KEY);
  return quoteCached;
}

function getHistorySnapshot() {
  if (historyCached === undefined) historyCached = readBayItem(QUOTE_HISTORY_KEY);
  return historyCached;
}

function toTicket(quote: QuoteAnalysisResult): StoredQuoteTicket {
  return {
    savedAt: new Date().toISOString(),
    shopName: quote.shopName,
    totalQuoted: quote.totalQuoted,
    summary: quote.summary,
    flaggedCount: quote.flaggedItems.length,
    script: quote.mechanicScript.slice(0, 4),
  };
}

function sameTicket(a: StoredQuoteTicket, b: StoredQuoteTicket): boolean {
  return a.summary === b.summary && a.totalQuoted === b.totalQuoted && a.shopName === b.shopName;
}

function pushQuoteHistory(quote: QuoteAnalysisResult) {
  const ticket = toTicket(quote);
  let previous: StoredQuoteTicket[] = [];
  try {
    const raw = historyCached === undefined ? readBayItem(QUOTE_HISTORY_KEY) : historyCached;
    previous = raw ? (JSON.parse(raw) as StoredQuoteTicket[]) : [];
  } catch {
    previous = [];
  }
  const next = [ticket, ...previous.filter((row) => !sameTicket(row, ticket))].slice(0, 2);
  historyCached = JSON.stringify(next);
  writeBayItem(QUOTE_HISTORY_KEY, historyCached);
  emitHistory();
}

export function useLastQuote() {
  const raw = useSyncExternalStore(subscribeQuote, getQuoteSnapshot, getServerSnapshot);
  const quote = parseQuote(raw);

  const setQuote = useCallback((next: QuoteAnalysisResult | null) => {
    quoteCached = next ? JSON.stringify(next) : null;
    parsedQuoteRaw = quoteCached;
    parsedQuote = next;
    writeBayItem(QUOTE_KEY, quoteCached);
    if (next) pushQuoteHistory(next);
    emitQuote();
  }, []);

  return [quote, setQuote] as const;
}

export function useQuoteHistory() {
  const raw = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerSnapshot);
  if (!raw) return [] as StoredQuoteTicket[];
  try {
    const parsed = JSON.parse(raw) as StoredQuoteTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
