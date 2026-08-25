import type { AgentImageKind, AgentReply, AgentRole } from "@/lib/agent/types";

export const AGENT_THREAD_KEY = "autoshield.agent.thread";
export const AGENT_MILEAGE_KEY = "autoshield.agent.mileage";

export interface AgentUiMessage {
  id: string;
  role: AgentRole;
  content: string;
  imageKind?: AgentImageKind;
  previewUrl?: string;
  reply?: AgentReply;
}

interface PersistedMessage {
  id: string;
  role: AgentRole;
  content: string;
  imageKind?: AgentImageKind;
  reply?: AgentReply;
}

function readRaw(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // quota / private mode
  }
}

export function loadThread(): AgentUiMessage[] {
  const raw = readRaw(AGENT_THREAD_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PersistedMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && (row.role === "user" || row.role === "assistant") && typeof row.content === "string");
  } catch {
    return [];
  }
}

export function saveThread(messages: AgentUiMessage[]) {
  const slim: PersistedMessage[] = messages.map(({ id, role, content, imageKind, reply }) => ({
    id,
    role,
    content,
    imageKind,
    reply,
  }));
  writeRaw(AGENT_THREAD_KEY, JSON.stringify(slim.slice(-24)));
}

export function clearThread() {
  writeRaw(AGENT_THREAD_KEY, null);
}

export function loadMileage(): string {
  return readRaw(AGENT_MILEAGE_KEY) ?? "";
}

export function saveMileage(mileage: string) {
  writeRaw(AGENT_MILEAGE_KEY, mileage.trim() ? mileage.trim() : null);
}

export function newMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
