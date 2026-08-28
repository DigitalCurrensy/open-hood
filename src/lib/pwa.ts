import { BRAND } from "@/lib/brand";
import { readBayItem } from "@/lib/bay-storage";
import { hasCompletedFirstRun } from "@/lib/first-run";
import {
  PWA_BYPASS_HEADER,
  PWA_CACHE_PREFIX,
  PWA_DEAD_PORT,
  PWA_LIVE_ORIGIN,
  PWA_RELOAD_ONCE_KEY,
  PWA_UNLOCK_PARAM,
} from "@/lib/pwa-unlock-script";
import type { FluidSpecSheet, IdentifiedVehicle } from "@/lib/types";

export const PWA_MANIFEST_PATH = "/manifest.webmanifest";
export const PWA_SW_PATH = "/sw.js";
export const PWA_OFFLINE_PATH = "/offline";
export const PWA_UNLOCK_HREF = `/?${PWA_UNLOCK_PARAM}=1`;

/** Leftover v1–v5 shell keys. public/sw.js deletes this prefix on activate. */
export const PWA_CACHE = "openhood-shell-v5";
/** Mirrors `public/sw.js` asset / bay caches. The SW is vanilla JS and cannot import from here. */
export const PWA_ASSET_CACHE = "openhood-assets-v2";
export const PWA_BAY_CACHE = "openhood-bay-v1";
export { PWA_BYPASS_HEADER, PWA_CACHE_PREFIX, PWA_RELOAD_ONCE_KEY, PWA_UNLOCK_PARAM };
export { FIRST_RUN_KEY } from "@/lib/first-run";
export const PWA_SKIP_WAITING = "SKIP_WAITING";

export const PWA_INSTALL_DISMISS_KEY = "openhood.pwa-install-dismissed";

/** Mirrors `public/sw.js`. The SW is vanilla JS and cannot import from here. */
export const PWA_BAY_SNAPSHOT_PATH = "/__bay/last.json";
export const PWA_BAY_MESSAGE = "openhood-bay";

let autoNavInFlight = false;
let unlockInFlight = false;
let visibilityHooked = false;

const BAY_VEHICLE_KEY = "openhood.vehicle";
const BAY_QUOTE_KEY = "openhood.quote";
const BAY_QUOTE_HISTORY_KEY = "openhood.quote.history";

const SCRIPT_LIMIT = 6;

/** Short waiting-room card. Not HTML. Not a Chrome build sheet. */
export interface BayIdentityPacket {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  headline: string;
  engine: string;
  fuel: string;
  oil: string;
  oilSource: FluidSpecSheet["source"] | "";
  identifiedBy: string;
  campaignCount: number;
}

export interface BaySnapshot {
  vehicle: IdentifiedVehicle | null;
  script: string[];
  year: string;
  make: string;
  model: string;
  packet: BayIdentityPacket | null;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia?.("(display-mode: standalone)").matches;
  const ios = "standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return Boolean(media || ios);
}

/** iPhone / iPad (including iPadOS desktop UA). Safari has no Web Bluetooth. */
export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = window.navigator as Navigator & { MSStream?: unknown };
  if (nav.MSStream) return false;
  if (/iPad|iPhone|iPod/.test(nav.userAgent)) return true;
  return nav.platform === "MacIntel" && nav.maxTouchPoints > 1;
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function canShareBay(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof navigator.share === "function";
}

export async function shareBay(): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  if (typeof window === "undefined") return "failed";
  const url = `${window.location.origin}/`;
  const data = {
    title: `${BRAND.short} — ${BRAND.tagline}`,
    text: `${BRAND.shareText} Pin this website — Share → Add to Home Screen. Not an App Store app.`,
    url,
  };
  if (typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export function isOfflineDocument(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector("[data-offline-desk]"));
}

export function shouldHardNavigate(pathname: string): boolean {
  return pathname === PWA_OFFLINE_PATH || pathname.startsWith(`${PWA_OFFLINE_PATH}/`) || isOfflineDocument();
}

export function isUnlockQuery(search = typeof window === "undefined" ? "" : window.location.search): boolean {
  return new URLSearchParams(search).get(PWA_UNLOCK_PARAM) === "1";
}

function readStorageFlag(key: string): boolean {
  try {
    if (window.sessionStorage.getItem(key) === "1") return true;
  } catch {
    /* private mode */
  }
  try {
    if (window.localStorage.getItem(key) === "1") return true;
  } catch {
    /* private mode */
  }
  return false;
}

function writeStorageFlag(key: string): boolean {
  let persisted = false;
  try {
    window.sessionStorage.setItem(key, "1");
    persisted = true;
  } catch {
    /* private mode */
  }
  try {
    window.localStorage.setItem(key, "1");
    persisted = true;
  } catch {
    /* private mode */
  }
  return persisted;
}

/** Automatic reload / leave may fire once per tab session. Unlock is not this path. */
export function hasReloadOnceGuard(): boolean {
  if (typeof window === "undefined") return false;
  return readStorageFlag(PWA_RELOAD_ONCE_KEY);
}

export function setReloadOnceGuard(): boolean {
  if (typeof window === "undefined") return false;
  return writeStorageFlag(PWA_RELOAD_ONCE_KEY);
}

/** Drop the durable flag after a healthy load so tomorrow's leftover SW can still auto-leave once. */
export function releaseCrossSessionGuard(): void {
  if (typeof window === "undefined") return;
  if (isUnlockQuery() || isOfflineDocument()) return;
  try {
    if (window.sessionStorage.getItem(PWA_RELOAD_ONCE_KEY) === "1") {
      window.localStorage.removeItem(PWA_RELOAD_ONCE_KEY);
    }
  } catch {
    /* sessionStorage is the session lock */
  }
}

function assignSameOrigin(href: string, replace: boolean): void {
  const url = new URL(href, window.location.origin);
  const next = url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : href;
  if (replace) {
    window.location.replace(next);
    return;
  }
  window.location.assign(next);
}

/**
 * Full load — no `?t=` cache-buster. A new timestamp on every leave is the reload loop.
 * Soft nav is the other trap: Next.js `<Link>` stays inside a painted /offline document.
 */
export function hardOpenHref(href: string): void {
  if (typeof window === "undefined") return;
  assignSameOrigin(href, false);
}

function reloadOnce(href?: string): boolean {
  if (autoNavInFlight || hasReloadOnceGuard()) return false;
  setReloadOnceGuard();
  autoNavInFlight = true;
  if (href) {
    assignSameOrigin(href, true);
  } else {
    window.location.reload();
  }
  return true;
}

/**
 * Drop every Open Hood worker and shell cache.
 * Unregister alone is not enough — a controlling SW keeps intercepting until the tab reloads.
 */
export async function purgeServiceWorkers(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;

  const hadController = Boolean(navigator.serviceWorker.controller);
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((reg) => reg.unregister()));

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  return hadController || regs.length > 0;
}

function takeControlOfWaitingWorker(registration: ServiceWorkerRegistration): void {
  const kick = (worker: ServiceWorker | null) => {
    worker?.postMessage({ type: PWA_SKIP_WAITING });
  };
  kick(registration.waiting);
  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    installing?.addEventListener("statechange", () => {
      if (installing.state === "installed") kick(registration.waiting ?? installing);
    });
  });
}

function hookVisibilityUpdates(): void {
  if (visibilityHooked || typeof document === "undefined") return;
  visibilityHooked = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.getRegistration(PWA_SW_PATH).then((reg) => {
      void reg?.update();
    });
  });
}

function deadDevPort(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return window.location.port === PWA_DEAD_PORT && (host === "localhost" || host === "127.0.0.1" || host === "[::1]");
}

function liveOrigin(): string {
  if (typeof window === "undefined") return PWA_LIVE_ORIGIN;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
    return `${window.location.protocol}//${host}:3000`;
  }
  return window.location.origin;
}

/**
 * First visit must land on the live bay. :3100 auto-bounce stays in the head script.
 * This is the React backup: leftover offline HTML never keeps a first-run tab.
 * Does not write openhood.firstRun — that is the garage → quote path.
 */
export function rescueFirstVisitToLiveBay(): boolean {
  if (typeof window === "undefined") return false;
  if (isUnlockQuery() || unlockInFlight || autoNavInFlight) return false;
  if (hasCompletedFirstRun()) return false;

  if (deadDevPort()) {
    const path = window.location.pathname.startsWith(PWA_OFFLINE_PATH) ? "/" : `${window.location.pathname}${window.location.search}${window.location.hash}`;
    assignSameOrigin(`${liveOrigin()}${path}`, true);
    return true;
  }

  if (isOfflineDocument() || window.location.pathname === PWA_OFFLINE_PATH || window.location.pathname.startsWith(`${PWA_OFFLINE_PATH}/`)) {
    assignSameOrigin("/", true);
    return true;
  }

  return false;
}

export function applyUnlockIfRequested(): boolean {
  if (typeof window === "undefined") return false;
  if (!isUnlockQuery()) return false;
  if (unlockInFlight) return true;
  unlockInFlight = true;
  setReloadOnceGuard();
  void purgeServiceWorkers().finally(() => {
    assignSameOrigin("/", true);
  });
  return true;
}

/**
 * Production / `next start`: always register the safe worker (icons + bay
 * snapshot only — it never intercepts navigations).
 * `next dev`: leftover-only, so a kill-switch can be replaced without
 * installing a worker on every hot reload. Never registers when the waiting-room
 * desk is about to leave. Never installs a document cache — public/sw.js does
 * not intercept navigate / document, and we never add HTML to PRECACHE here.
 */
export function registerPwa(onReady?: () => void): void {
  if (typeof window === "undefined") return;
  if (applyUnlockIfRequested()) return;
  if (!("serviceWorker" in navigator)) return;

  const productionLike = process.env.NODE_ENV === "production";

  void navigator.serviceWorker
    .getRegistrations()
    .then((regs) => {
      const leftover = regs.length > 0 || Boolean(navigator.serviceWorker.controller);
      if (!productionLike && !leftover) return;
      return navigator.serviceWorker
        .register(PWA_SW_PATH, { scope: "/", updateViaCache: "none" })
        .then((registration) => {
          takeControlOfWaitingWorker(registration);
          hookVisibilityUpdates();
          void registration.update();
          return navigator.serviceWorker.ready;
        })
        .then(() => {
          syncBaySnapshot();
          onReady?.();
        });
    })
    .catch(() => {
      void purgeServiceWorkers();
    });
}

/**
 * If a leftover worker painted WI-FI DROPPED onto this tab, and `/` is actually up,
 * leave the fallback once. Fires from the head script first; this is the React backup.
 * A leftover worker can answer `fetch("/")` with cached /offline — purge before the probe.
 */
export async function escapeOfflineShellIfOnline(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isUnlockQuery() || unlockInFlight) return false;
  if (autoNavInFlight || hasReloadOnceGuard()) return false;

  const onOfflineRoute =
    window.location.pathname === PWA_OFFLINE_PATH || window.location.pathname.startsWith(`${PWA_OFFLINE_PATH}/`);
  const paintedOffline = isOfflineDocument();

  if (!paintedOffline && !onOfflineRoute) return false;

  if (paintedOffline && !onOfflineRoute) {
    await purgeServiceWorkers();
    return reloadOnce("/");
  }

  await purgeServiceWorkers();

  try {
    const response = await fetch("/", {
      cache: "no-store",
      headers: { [PWA_BYPASS_HEADER]: "1", Accept: "text/html" },
    });
    if (!response.ok) return false;
    const finalUrl = new URL(response.url, window.location.origin);
    if (finalUrl.pathname === PWA_OFFLINE_PATH) return false;
    const text = await response.text();
    if (/wi-?fi dropped/i.test(text) || text.includes("data-offline-desk")) return false;
    return reloadOnce("/");
  } catch {
    return false;
  }
}

function parseBayJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function cleanScript(lines: unknown): string[] {
  if (!Array.isArray(lines)) return [];
  return lines.filter((line): line is string => typeof line === "string" && line.trim().length > 0).slice(0, SCRIPT_LIMIT);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function toBayIdentityPacket(vehicle: IdentifiedVehicle | null): BayIdentityPacket | null {
  if (!vehicle) return null;
  const { specs, fluids } = vehicle;
  const trim = [specs.trim, specs.trim2].filter((part) => part.trim().length > 0).join(" ");
  const engine = [specs.engineDisplacement, specs.engineConfig, specs.engineHP ? `${specs.engineHP} hp` : ""]
    .filter((part) => part.trim().length > 0)
    .join(" · ");
  const campaignCount = new Set(vehicle.recalls.map((row) => row.campaignNumber).filter(Boolean)).size;
  const packet: BayIdentityPacket = {
    vin: specs.vin,
    year: specs.year,
    make: specs.make,
    model: specs.model,
    trim,
    headline: [specs.year, specs.make, specs.model, trim].filter((part) => part.trim().length > 0).join(" "),
    engine,
    fuel: specs.fuelType,
    oil: fluids.oilViscosity,
    oilSource: fluids.source,
    identifiedBy: specs.identifiedBy,
    campaignCount,
  };
  if (!packet.vin && !packet.year && !packet.make && !packet.model) return null;
  return packet;
}

function parsePacket(raw: unknown): BayIdentityPacket | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const oilSourceRaw = asString(row.oilSource);
  const oilSource: BayIdentityPacket["oilSource"] =
    oilSourceRaw === "catalog" || oilSourceRaw === "heuristic" || oilSourceRaw === "model" ? oilSourceRaw : "";
  const campaignCount = typeof row.campaignCount === "number" && Number.isFinite(row.campaignCount) ? row.campaignCount : 0;
  const packet: BayIdentityPacket = {
    vin: asString(row.vin),
    year: asString(row.year),
    make: asString(row.make),
    model: asString(row.model),
    trim: asString(row.trim),
    headline: asString(row.headline),
    engine: asString(row.engine),
    fuel: asString(row.fuel),
    oil: asString(row.oil),
    oilSource,
    identifiedBy: asString(row.identifiedBy),
    campaignCount,
  };
  if (!packet.vin && !packet.year && !packet.make && !packet.model) return null;
  return packet;
}

/** Last car, last mechanic script, and a short identity packet. Returns null when the bay is empty. */
export function readBaySnapshot(): BaySnapshot | null {
  const vehicle = parseBayJson<IdentifiedVehicle>(readBayItem(BAY_VEHICLE_KEY));
  const quote = parseBayJson<{ mechanicScript?: unknown }>(readBayItem(BAY_QUOTE_KEY));

  let script = cleanScript(quote?.mechanicScript);
  if (script.length === 0) {
    const history = parseBayJson<{ script?: unknown }[]>(readBayItem(BAY_QUOTE_HISTORY_KEY));
    const ticket = Array.isArray(history) ? history.find((row) => cleanScript(row?.script).length > 0) : undefined;
    script = cleanScript(ticket?.script);
  }

  if (!vehicle && script.length === 0) return null;

  return {
    vehicle,
    script,
    year: vehicle?.specs.year ?? "",
    make: vehicle?.specs.make ?? "",
    model: vehicle?.specs.model ?? "",
    packet: toBayIdentityPacket(vehicle),
  };
}

/** Hand the snapshot to the SW so /offline can read last.json without the Next runtime. */
export function postBaySnapshot(snapshot: BaySnapshot): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const payload = { type: PWA_BAY_MESSAGE, ...snapshot };
  const send = (worker: ServiceWorker | null | undefined) => {
    if (!worker) return false;
    worker.postMessage(payload);
    return true;
  };
  if (send(navigator.serviceWorker.controller)) return;
  void navigator.serviceWorker.ready
    .then((registration) => {
      send(registration.active);
    })
    .catch(() => {
      /* no worker yet — first production visit claims on the next paint */
    });
}

export function syncBaySnapshot(): void {
  const snapshot = readBaySnapshot();
  if (snapshot) postBaySnapshot(snapshot);
}

/** 404s when no worker has stored a snapshot yet. That is a normal online result, not an error. */
export async function readCachedBaySnapshot(): Promise<BaySnapshot | null> {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch(PWA_BAY_SNAPSHOT_PATH, { cache: "no-store" });
    if (!response.ok) return null;
    if (!response.headers.get("content-type")?.includes("application/json")) return null;

    const data = (await response.json()) as Partial<BaySnapshot> | null;
    if (!data) return null;

    const vehicle = data.vehicle ?? null;
    const script = cleanScript(data.script);
    const packet = parsePacket(data.packet) ?? toBayIdentityPacket(vehicle);
    if (!vehicle && script.length === 0 && !packet) return null;

    return {
      vehicle,
      script,
      year: vehicle?.specs.year ?? (typeof data.year === "string" ? data.year : packet?.year ?? ""),
      make: vehicle?.specs.make ?? (typeof data.make === "string" ? data.make : packet?.make ?? ""),
      model: vehicle?.specs.model ?? (typeof data.model === "string" ? data.model : packet?.model ?? ""),
      packet,
    };
  } catch {
    return null;
  }
}
