import type { FinderCatalogHook } from "@/lib/finder/types";

const TECDOC_ENVS = ["TECALLIANCE_KEY", "TECDOC_API_KEY", "TECDOC_KEY"] as const;
const ROCKAUTO_ENVS = ["ROCKAUTO_API", "ROCKAUTO_API_KEY"] as const;

function firstConfigured(names: readonly string[]): string | undefined {
  return names.find((name) => Boolean(process.env[name]?.trim()));
}

function hook(
  id: string,
  name: string,
  envNames: readonly string[],
  fallbackEnv: string,
  missing: string,
  present: string,
): FinderCatalogHook {
  const env = firstConfigured(envNames);
  const configured = Boolean(env);
  return {
    id,
    name,
    env: env ?? fallbackEnv,
    configured,
    wired: false,
    note: configured ? present : missing,
  };
}

export function catalogHooks(): FinderCatalogHook[] {
  return [
    hook(
      "tecdoc",
      "TecDoc / TecAlliance",
      TECDOC_ENVS,
      "TECALLIANCE_KEY",
      "No TecDoc key. Storefront search URLs only — we do not invent interchange SKUs.",
      "Key is present. Licensed catalog is not wired to SKU rows. Storefront search URLs stay the buyer path.",
    ),
    hook(
      "rockauto",
      "RockAuto API",
      ROCKAUTO_ENVS,
      "ROCKAUTO_API",
      "No ROCKAUTO_API. Catalog and partsearch URLs only.",
      "Key is present. There is no public RockAuto SKU feed in this bay. Catalog search still opens.",
    ),
  ];
}

export function catalogMode(hooks = catalogHooks()): "keyed-urls" | "url-templates" {
  return hooks.some((item) => item.configured) ? "keyed-urls" : "url-templates";
}

export function catalogStatus() {
  const hooks = catalogHooks();
  return {
    mode: catalogMode(hooks),
    hooks,
    disclaimer:
      "We do not invent TecDoc hours, live shelf counts, or interchange. A key in env is a hook, not a fake catalog.",
  };
}
