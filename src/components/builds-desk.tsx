"use client";

import { useState } from "react";
import { BUILD_ROLES, emptyComponent, useBuilds } from "@/lib/build-session";
import type { BuildComponent, BuildProject } from "@/lib/types";

export function BuildsDesk() {
  const { builds, create, save, remove, addLog } = useBuilds();
  const [name, setName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(builds[0]?.id ?? null);
  const [logText, setLogText] = useState("");
  const active = builds.find((item) => item.id === activeId) ?? builds[0] ?? null;

  return (
    <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4">
        <form
          className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const id = create(name);
            setName("");
            setActiveId(id);
          }}
        >
          <h2 className="font-display text-2xl uppercase tracking-wide">New project</h2>
          <p className="mt-1 text-sm leading-6 text-aluminum">
            Kit car, LS swap, or a chassis that no longer matches one VIN. We store this on your device — not a fake
            physics engine.
          </p>
          <label className="mt-3 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Build name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Miata + K24 · street"
              className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40"
            />
          </label>
          <button
            type="submit"
            className="mt-3 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
          >
            Open a build binder
          </button>
        </form>

        <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">On this device</h3>
          {builds.length === 0 ? (
            <p className="mt-3 text-sm text-aluminum">No builds yet. Name one to start the chassis / engine / trans card.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {builds.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(project.id)}
                    className={`w-full rounded-sm px-3 py-2 text-left font-mono text-xs uppercase tracking-[0.14em] ${
                      active?.id === project.id
                        ? "bg-ticket text-ticket-ink"
                        : "border border-white/10 text-aluminum hover:text-fluorescent"
                    }`}
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {active ? (
        <BuildEditor
          key={active.id}
          project={active}
          logText={logText}
          onLogText={setLogText}
          onSave={save}
          onRemove={() => {
            remove(active.id);
            setActiveId(null);
          }}
          onAddLog={() => {
            addLog(active.id, logText);
            setLogText("");
          }}
        />
      ) : (
        <div className="ticket-paper flex min-h-[18rem] flex-col justify-between rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Build binder</p>
          <p className="max-w-sm text-sm leading-6">
            One VIN cannot describe a swapped car. Log the chassis, the engine you actually installed, and the
            transmission — then write what you did.
          </p>
        </div>
      )}
    </div>
  );
}

function BuildEditor({
  project,
  logText,
  onLogText,
  onSave,
  onRemove,
  onAddLog,
}: {
  project: BuildProject;
  logText: string;
  onLogText: (value: string) => void;
  onSave: (project: BuildProject) => void;
  onRemove: () => void;
  onAddLog: () => void;
}) {
  const [draft, setDraft] = useState(project);

  function patchComponent(id: string, patch: Partial<BuildComponent>) {
    setDraft((current) => ({
      ...current,
      components: current.components.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  return (
    <div className="space-y-4 rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Binder title</span>
        <input
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent"
        />
      </label>

      <ul className="space-y-3">
        {draft.components.map((row) => (
          <li key={row.id} className="rounded-sm border border-white/10 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">Role</span>
                <select
                  value={row.role}
                  onChange={(event) =>
                    patchComponent(row.id, { role: event.target.value as BuildComponent["role"] })
                  }
                  className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-2 py-1.5 text-sm"
                >
                  {BUILD_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">Label</span>
                <input
                  value={row.label}
                  onChange={(event) => patchComponent(row.id, { label: event.target.value })}
                  placeholder="K24A2 · 2.4L"
                  className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">Year / make / model</span>
                <input
                  value={[row.year, row.make, row.model].filter(Boolean).join(" ")}
                  onChange={(event) => {
                    const [year = "", make = "", ...rest] = event.target.value.split(/\s+/);
                    patchComponent(row.id, { year, make, model: rest.join(" ") });
                  }}
                  placeholder="2004 Honda Accord"
                  className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">Source VIN</span>
                <input
                  value={row.sourceVin}
                  onChange={(event) => patchComponent(row.id, { sourceVin: event.target.value.toUpperCase() })}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-2 py-1.5 font-mono text-sm"
                />
              </label>
            </div>
            <label className="mt-2 block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">Notes</span>
              <textarea
                value={row.notes}
                onChange={(event) => patchComponent(row.id, { notes: event.target.value })}
                rows={2}
                className="mt-1 w-full rounded-sm border border-white/15 bg-bay px-2 py-1.5 text-sm"
              />
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setDraft({ ...draft, components: [...draft.components, emptyComponent("other")] })}
        className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:text-ticket"
      >
        Add a component
      </button>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Save binder
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum"
        >
          Delete build
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
          onAddLog();
        }}
      >
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Work log</span>
          <input
            value={logText}
            onChange={(event) => onLogText(event.target.value)}
            placeholder="Swapped clutch · 2026-08-25"
            className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
        >
          Stamp a log line
        </button>
      </form>

      {project.log.length ? (
        <ul className="space-y-2 border-t border-white/10 pt-3">
          {project.log.map((item) => (
            <li key={item.id} className="text-sm text-aluminum">
              <span className="font-mono text-[10px] text-cone">{item.at.slice(0, 10)} · </span>
              {item.text}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
