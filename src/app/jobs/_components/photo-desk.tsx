"use client";

import { useEffect, useMemo, useState } from "react";
import type { PhotoShot } from "@/lib/jobs/types";

export function PhotoDesk({
  storageKey,
  shots,
  legal,
}: {
  storageKey: string;
  shots: PhotoShot[];
  legal?: string;
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

  const count = useMemo(() => shots.filter((shot) => done[shot.id]).length, [done, shots]);
  const next = shots.find((shot) => !done[shot.id]);

  return (
    <div className="space-y-4">
      {legal ? (
        <p className="rounded-sm border border-cone/40 bg-bay-2/80 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-cone">
          {legal}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
            {count} / {shots.length} in the folder
          </p>
          <h2 className="mt-2 font-display text-3xl uppercase leading-none">
            {next ? `Next · ${next.title}` : "Folder is complete"}
          </h2>
          {next ? (
            <p className="mt-3 text-sm leading-6">
              {next.frame} {next.why}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6">Name the folder with the date and the miles. Do not crop the VIN.</p>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print mt-4 rounded-sm bg-bay px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-fluorescent"
          >
            Print shot list
          </button>
        </aside>
        <ol className="space-y-2">
          {shots.map((shot) => {
            const checked = Boolean(done[shot.id]);
            return (
              <li key={shot.id}>
                <label className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-bay-2/80 p-4">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(shot.id)}
                    className="mt-1 size-4 accent-[var(--ticket)]"
                  />
                  <span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">
                      Shot {String(shot.order).padStart(2, "0")}
                    </span>
                    <span className={`block font-display text-xl uppercase tracking-wide ${checked ? "text-aluminum line-through" : "text-fluorescent"}`}>
                      {shot.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-aluminum">{shot.why}</span>
                    <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.12em] text-aluminum">{shot.frame}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
