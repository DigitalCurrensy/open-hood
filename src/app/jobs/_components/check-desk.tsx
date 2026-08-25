"use client";

import { useEffect, useMemo, useState } from "react";
import type { CheckItem } from "@/lib/jobs/types";

export function CheckDesk({
  storageKey,
  items,
  readyLabel,
  blockedLabel,
}: {
  storageKey: string;
  items: CheckItem[];
  readyLabel: string;
  blockedLabel: string;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setDone({});
    }
  }, [storageKey]);

  function toggle(id: string) {
    setDone((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  const count = useMemo(() => items.filter((item) => done[item.id]).length, [done, items]);
  const ready = count === items.length;

  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
      <ol className="space-y-2">
        {items.map((item, index) => {
          const checked = Boolean(done[item.id]);
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-bay-2/80 p-4">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.id)}
                  className="mt-1 size-4 accent-[var(--ticket)]"
                />
                <span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={`block font-display text-xl uppercase tracking-wide ${checked ? "text-aluminum line-through" : "text-fluorescent"}`}>
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-aluminum">{item.detail}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ol>
      <aside className="ticket-paper flex min-h-[16rem] flex-col justify-between rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
          {count} / {items.length} · bay card
        </p>
        <p className="font-display text-3xl uppercase leading-none">{ready ? readyLabel : blockedLabel}</p>
        <p className="text-sm leading-6">
          This card lives in this browser. Print it if you want paper at the window.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print w-fit rounded-sm bg-bay px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-fluorescent"
        >
          Print card
        </button>
      </aside>
    </div>
  );
}
