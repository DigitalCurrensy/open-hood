export type AgentRole = "user" | "assistant";

export type AgentImageKind = "quote" | "leak" | "light";

export type AgentEngine = "rules" | "gpt-4o";

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

export interface AgentTool {
  href: "/quote" | "/symptoms" | "/guides" | "/directory" | "/obd";
  stamp: string;
  title: string;
  reason: string;
}

export interface AgentReply {
  text: string;
  scripts: string[];
  tools: AgentTool[];
  engine: AgentEngine;
  vision: "used" | "unavailable" | "none";
  verify: string;
}

export interface AgentRequestBody {
  messages?: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  stream?: boolean;
}

export interface AgentStatus {
  engine: AgentEngine;
  vision: boolean;
}

export const AGENT_VERIFY =
  "Verify oil spec, tire PSI, and any service interval on the door-jamb sticker and the owner's manual for this VIN. I will not invent a torque spec, a factory hour, or a legal requirement.";

export const AGENT_DISCLAIMER =
  "This briefing is not a substitute for a licensed inspection. Measurements beat adjectives — do not authorize from a hunch or a menu.";
