/**
 * Safe bay worker — not a document cache.
 *
 * A leftover shell once painted cached /offline HTML onto /, /quote, /directory,
 * /recalls. The URL changed; the document stayed "WI-FI DROPPED."
 *
 * This worker:
 *   - NEVER intercepts navigate / document requests.
 *   - NEVER caches or serves HTML.
 *   - NEVER paints /offline onto another URL.
 *   - NEVER unregisters itself.
 * Precaches icons + manifest only. Keeps the last-car snapshot at /__bay/last.json.
 * localhost:3100 → :3000 lives in the unlock script and scripts/rescue-3100.mjs.
 */
const ASSET_CACHE = "openhood-assets-v2";
const BAY_CACHE = "openhood-bay-v1";
const SHELL_PREFIX = "openhood-shell-";
const BAY_PATH = "/__bay/last.json";
const BAY_MESSAGE = "openhood-bay";
const SKIP_WAITING = "SKIP_WAITING";

const PRECACHE = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      await Promise.all(
        PRECACHE.map(async (path) => {
          try {
            await cache.add(path);
          } catch {
            /* a missing icon must not block the safe worker */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(SHELL_PREFIX) || (key !== ASSET_CACHE && key !== BAY_CACHE))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === SKIP_WAITING) {
    void self.skipWaiting();
    return;
  }

  if (data.type !== BAY_MESSAGE) return;

  const snapshot = {
    vehicle: data.vehicle ?? null,
    script: Array.isArray(data.script) ? data.script : [],
    year: typeof data.year === "string" ? data.year : "",
    make: typeof data.make === "string" ? data.make : "",
    model: typeof data.model === "string" ? data.model : "",
    packet: data.packet && typeof data.packet === "object" ? data.packet : null,
  };

  event.waitUntil(storeBay(snapshot));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Never intercept page loads. Never serve cached HTML for a desk URL.
  // Leaving without respondWith lets the browser hit the network (or fail honestly).
  if (request.mode === "navigate" || request.destination === "document") return;
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/html")) return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (url.pathname === BAY_PATH) {
    event.respondWith(respondBay());
    return;
  }

  if (PRECACHE.includes(url.pathname)) {
    event.respondWith(respondAsset(request));
  }
});

async function storeBay(snapshot) {
  const cache = await caches.open(BAY_CACHE);
  await cache.put(
    BAY_PATH,
    new Response(JSON.stringify(snapshot), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    }),
  );
}

async function respondBay() {
  const cache = await caches.open(BAY_CACHE);
  const hit = await cache.match(BAY_PATH);
  return hit || new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
}

async function respondAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}
