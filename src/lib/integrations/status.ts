import { ENV_KEYS, INTEGRATIONS } from "@/lib/integrations/catalog";
import type { EnvKeyStatus, IntegrationsStatusPayload } from "@/lib/integrations/types";
import { configuredForActions } from "@/app/api/integrations/_lib/keys";

const KEY_COPY: Record<(typeof ENV_KEYS)[number], Omit<EnvKeyStatus, "configured" | "probed">> = {
  OPENAI_API_KEY: {
    env: "OPENAI_API_KEY",
    label: "Photo reading",
    usedFor: "When this key is on, VIN and quote photos use the bay reader first. Without it, the page still reads on the device.",
    connectUrl: "https://platform.openai.com/api-keys",
    openWhenReady: "/agent",
  },
  GOOGLE_PLACES_API_KEY: {
    env: "GOOGLE_PLACES_API_KEY",
    label: "Google Places",
    usedFor: "Denser rooftops on /directory. OSM + Nominatim stay live without it.",
    connectUrl: "https://console.cloud.google.com/google/maps-apis/api-list",
    openWhenReady: "/directory",
  },
  YELP_API_KEY: {
    env: "YELP_API_KEY",
    label: "Yelp Fusion",
    usedFor: "Optional phone / address merge in the directory. The Yelp search link works either way.",
    connectUrl: "https://www.yelp.com/developers/v3/manage_app",
    openWhenReady: "/directory",
  },
  YOUTUBE_API_KEY: {
    env: "YOUTUBE_API_KEY",
    label: "YouTube Data API",
    usedFor: "Related how-to clips. Search URLs and the glossary work with no key.",
    connectUrl: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
    openWhenReady: "/guides",
  },
  CARSXE_API_KEY: {
    env: "CARSXE_API_KEY",
    label: "CarsXE plate-to-VIN",
    usedFor: "Plate decode on /history. Missing key → the plate stays a note. State restrictions apply.",
    connectUrl: "https://api.carsxe.com/",
    openWhenReady: "/history",
  },
  MARKETCHECK_API_KEY: {
    env: "MARKETCHECK_API_KEY",
    label: "MarketCheck plate-to-VIN",
    usedFor: "Alternate plate decoder on /history. Listings API is not called until we mean to.",
    connectUrl: "https://www.marketcheck.com/",
    openWhenReady: "/history",
  },
  VINAUDIT_API_KEY: {
    env: "VINAUDIT_API_KEY",
    label: "VinAudit title snapshot",
    usedFor: "Paid title / salvage on /history. Missing key → outbound consumer cards. We do not invent a Carfax.",
    connectUrl: "https://www.vinaudit.com/api",
    openWhenReady: "/history",
  },
};

export function envConfigured(name: string): boolean {
  return Boolean(configuredForActions()[name]);
}

export function configuredEnvMap(): Record<string, boolean> {
  const actions = configuredForActions();
  const map: Record<string, boolean> = {};
  for (const item of INTEGRATIONS) {
    if (!item.env) continue;
    if (item.lane === "catalog") {
      map[item.env] = false;
      continue;
    }
    map[item.env] = Boolean(actions[item.env]);
  }
  for (const key of ENV_KEYS) {
    map[key] = Boolean(actions[key]);
  }
  return map;
}

export function readEnvKeyStatus(): EnvKeyStatus[] {
  const actions = configuredForActions();
  return ENV_KEYS.map((env) => {
    const configured = Boolean(actions[env]);
    return {
      ...KEY_COPY[env],
      configured,
      probed: configured ? "skip" : "none",
    };
  });
}

export function integrationsStatus(): IntegrationsStatusPayload {
  return {
    generatedAt: new Date().toISOString(),
    keys: readEnvKeyStatus(),
    liveIds: INTEGRATIONS.filter((item) => item.lane === "live").map((item) => item.id),
    envIds: INTEGRATIONS.filter((item) => item.lane === "env").map((item) => item.id),
    catalogIds: INTEGRATIONS.filter((item) => item.lane === "catalog").map((item) => item.id),
  };
}
