"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { DummyStep } from "@/lib/expert/types";

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, string>();

function emit(key: string) {
  for (const listener of listeners.get(key) ?? []) listener();
}

function readRaw(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function subscribe(key: string) {
  return (onStoreChange: () => void) => {
    const set = listeners.get(key) ?? new Set();
    set.add(onStoreChange);
    listeners.set(key, set);
    return () => {
      set.delete(onStoreChange);
    };
  };
}

function parseDone(raw: string): Record<string, boolean> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function useLocalFlags(storageKey: string): [Record<string, boolean>, (id: string) => void] {
  const raw = useSyncExternalStore(
    subscribe(storageKey),
    () => {
      const next = readRaw(storageKey);
      const prev = cache.get(storageKey);
      if (prev === next) return prev;
      cache.set(storageKey, next);
      return next;
    },
    () => "",
  );

  function toggle(id: string) {
    const current = parseDone(cache.get(storageKey) ?? readRaw(storageKey));
    const next = { ...current, [id]: !current[id] };
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(storageKey, serialized);
    cache.set(storageKey, serialized);
    emit(storageKey);
  }

  return [parseDone(raw), toggle];
}

export function PlaybookSteps({
  playbookId,
  steps,
}: {
  playbookId: string;
  steps: DummyStep[];
}) {
  const storageKey = `openhood.expert.${playbookId}`;
  const [done, toggle] = useLocalFlags(storageKey);
  const count = useMemo(() => steps.filter((step) => done[step.id]).length, [done, steps]);
  const ready = count === steps.length;

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-aluminum">
        {count} / {steps.length} beginner steps
        {ready ? " · walk in" : ""}
      </p>
      <ol className="space-y-2">
        {steps.map((step, index) => {
          const checked = Boolean(done[step.id]);
          return (
            <li key={step.id}>
              <label className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-bay-2/80 p-4">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(step.id)}
                  className="mt-1 size-4 accent-[var(--ticket)]"
                />
                <span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`block font-display text-xl uppercase tracking-wide ${
                      checked ? "text-aluminum line-through" : "text-fluorescent"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-aluminum">{step.do}</span>
                  {step.say ? (
                    <span className="mt-2 block border-l-2 border-ticket/60 pl-3 text-sm leading-6 text-fluorescent">
                      Say: {step.say}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
