"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { BuildComponent, BuildLogItem, BuildProject } from "@/lib/types";

const KEY = "autoshield.builds";
const listeners = new Set<() => void>();
let cached: string | null | undefined;

function emit() {
  for (const listener of listeners) listener();
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
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

function parse(raw: string | null): BuildProject[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BuildProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(next: BuildProject[]) {
  cached = JSON.stringify(next);
  try {
    localStorage.setItem(KEY, cached);
  } catch {
    // quota / private mode
  }
  emit();
}

function id(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const BUILD_ROLES: Array<BuildComponent["role"]> = [
  "chassis",
  "engine",
  "transmission",
  "axle",
  "ecu",
  "other",
];

export function emptyComponent(role: BuildComponent["role"] = "other"): BuildComponent {
  return {
    id: id(),
    role,
    label: "",
    year: "",
    make: "",
    model: "",
    sourceVin: "",
    notes: "",
  };
}

export function useBuilds() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const builds = parse(raw);

  const save = useCallback((project: BuildProject) => {
    const list = parse(getSnapshot());
    const next: BuildProject = { ...project, updatedAt: new Date().toISOString() };
    const index = list.findIndex((item) => item.id === project.id);
    if (index >= 0) list[index] = next;
    else list.unshift(next);
    persist(list);
  }, []);

  const remove = useCallback((projectId: string) => {
    persist(parse(getSnapshot()).filter((item) => item.id !== projectId));
  }, []);

  const create = useCallback((name: string) => {
    const project: BuildProject = {
      id: id(),
      name: name.trim() || "Untitled build",
      updatedAt: new Date().toISOString(),
      components: [
        emptyComponent("chassis"),
        emptyComponent("engine"),
        emptyComponent("transmission"),
      ],
      log: [],
    };
    persist([project, ...parse(getSnapshot())]);
    return project.id;
  }, []);

  const addLog = useCallback((projectId: string, text: string) => {
    const list = parse(getSnapshot());
    const project = list.find((item) => item.id === projectId);
    if (!project) return;
    const item: BuildLogItem = {
      id: id(),
      at: new Date().toISOString(),
      text: text.trim(),
    };
    if (!item.text) return;
    project.log.unshift(item);
    project.updatedAt = item.at;
    persist(list);
  }, []);

  return { builds, save, remove, create, addLog };
}
