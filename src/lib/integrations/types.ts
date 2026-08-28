export type IntegrationLane = "live" | "env" | "catalog";

export type IntegrationFamily =
  | "safety"
  | "fuel"
  | "maps"
  | "parts"
  | "shops"
  | "auctions"
  | "video"
  | "history"
  | "licensed";

export type IntegrationTool = "mpg" | "vin" | "recalls" | "geocode" | "youtube" | "maps";

export interface IntegrationContext {
  year: string;
  make: string;
  model: string;
  vin: string;
  address: string;
  part: string;
  howTo: string;
}

export interface IntegrationDef {
  id: string;
  stamp: string;
  name: string;
  family: IntegrationFamily;
  lane: IntegrationLane;
  dummy: string;
  genius: string;
  homeUrl: string;
  /** Outbound URL that always works — home page if context is empty. */
  href: (ctx: IntegrationContext) => string;
  env?: string;
  connectUrl?: string;
  appPath?: string;
  tool?: IntegrationTool;
}

export interface EnvKeyStatus {
  env: string;
  configured: boolean;
  probed: "skip" | "none";
  label: string;
  usedFor: string;
  connectUrl: string;
  openWhenReady: string;
}

export interface IntegrationAction {
  label: string;
  href: string;
  connected: boolean | null;
}

export interface IntegrationsStatusPayload {
  generatedAt: string;
  keys: EnvKeyStatus[];
  liveIds: string[];
  envIds: string[];
  catalogIds: string[];
}

export const EMPTY_CONTEXT: IntegrationContext = {
  year: "",
  make: "",
  model: "",
  vin: "",
  address: "",
  part: "",
  howTo: "",
};
