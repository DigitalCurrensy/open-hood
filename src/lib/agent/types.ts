export type AgentRole = "user" | "assistant";

export type AgentImageKind = "quote" | "leak" | "light";

export type AgentEngine = "rules" | "gpt-4o";

export type AgentReadingLevel = "beginner" | "expert";

export const AGENT_FN_NAMES = [
  "decode_vin",
  "lookup_dtc",
  "analyze_quote_text",
  "diagnose_symptoms",
  "get_fluids_for_vehicle",
  "search_guides",
  "search_directory",
  "get_recalls",
  "get_epa_mpg",
  "search_playbooks",
  "lookup_ro_term",
  "search_parts",
] as const;

export type AgentFnName = (typeof AGENT_FN_NAMES)[number];

export interface AgentFnCall {
  name: AgentFnName;
  args: Record<string, unknown>;
}

export interface AgentInvocation {
  name: AgentFnName;
  ok: boolean;
  summary: string;
}

export interface AgentVehicleContext {
  vin?: string;
  year?: string;
  make?: string;
  model?: string;
  mileage?: string;
  concern?: string;
}

export interface AgentImagePayload {
  base64: string;
  mimeType: string;
  kind?: AgentImageKind;
}

export interface AgentWireMessage {
  role: AgentRole;
  content: string;
  image?: AgentImagePayload;
}

export type AgentDeskHref =
  | "/quote"
  | "/symptoms"
  | "/guides"
  | "/directory"
  | "/obd"
  | "/expert"
  | "/garage"
  | "/catalog"
  | "/recalls";

export interface AgentTool {
  href: AgentDeskHref;
  stamp: string;
  title: string;
  reason: string;
}

export interface AgentReply {
  text: string;
  scripts: string[];
  tools: AgentTool[];
  facts: string[];
  invocations: AgentInvocation[];
  readingLevel: AgentReadingLevel;
  engine: AgentEngine;
  vision: "used" | "unavailable" | "none";
  verify: string;
}

export interface AgentRequestBody {
  messages?: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  readingLevel?: string;
  stream?: boolean;
}

export interface AgentStatus {
  engine: AgentEngine;
  vision: boolean;
  tools: AgentFnName[];
  readingLevels: AgentReadingLevel[];
}

export const AGENT_VERIFY =
  "Verify oil spec, tire PSI, and any service interval on the door-jamb sticker and the owner's manual for this VIN. I will not invent a torque spec, a factory hour, or a legal requirement.";

export const AGENT_DISCLAIMER =
  "This briefing is not a substitute for a licensed inspection. Measurements beat adjectives — do not authorize from a hunch or a menu.";

export function normalizeReadingLevel(value?: string | null): AgentReadingLevel {
  const raw = (value ?? "").trim().toLowerCase();
  if (raw === "expert" || raw === "shop-talk" || raw === "genius") return "expert";
  return "beginner";
}
