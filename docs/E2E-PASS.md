# E2E pass — 26 August 2026 (flushed 27 Aug)

## Trap: WI-FI DROPPED on every tab (user tab `localhost:3100`)

**Root cause:** The live Next server is `http://localhost:3000`. Screenshots were `http://localhost:3100/recalls`. Port 3100 was a leftover `next start` from an agent; that process is **dead** (`curl` connection refused). A service worker for origin `:3100` still intercepted every click and painted cached `/offline` HTML (URL changed, document stayed WI-FI DROPPED). The 404 overlay was the dead port.

**Fix (verified):**
- `public/sw.js` is a **kill switch** (no shell cache, unregister + wipe caches). The app does **not** register a PWA worker unless a leftover is already there.
- Head script: `localhost:3100` unregisters workers and `replace`s to `:3000` with the same path.
- `scripts/rescue-3100.mjs` listens on 3100, serves the kill-switch `sw.js`, and a page that moves the tab to 3000.
- Header `BayLink` does a **full document load** so App Router cannot sit on “Opening bay…” forever.

**Evidence:**
- `curl` 169 sitemap URLs on :3000 — all HTTP 200; **zero** live desks returned `data-offline-desk`.
- `/` identify desk: 2003 Honda Accord **3.0L**, Choose photo / Use camera.
- `/quote` Quote defense. `/directory` OSM directory. `/recalls` NHTSA campaigns (not WI-FI DROPPED).
- Visiting `http://localhost:3100/recalls` landed on `http://localhost:3000/recalls` with the real recalls desk.
- Ticket click from recalls → `/quote`.
- `og.png` / icons / `sw.js` 200.

**Use this URL:** http://localhost:3000/ — not 3100. If a tab is still frozen: http://localhost:3000/?unlock=1 or reload the 3100 tab once so the rescue can bounce you.

---

# E2E pass — 26 August 2026

Night-bay crawl against `http://localhost:3000`. Demo VIN `1HGCM82633A004352` → 2003 Honda Accord, **3.0L**, oil 5W-20.

## Verdict

**Pass, after unhide.** The live UI looked empty because most desks were CSS-`hidden` behind a JS-only “More bays” toggle, the home tool grid waited for a VIN, and a localhost service worker was cache-first on `/_next/static` (Turbopack reuses those URLs). Photo controls were already real buttons; camera denial now falls back to Choose photo.

## What was hidden

| Fail | Cause | Fix |
| --- | --- | --- |
| Header board missing | `className={open ? "block" : "hidden"}` + `useState(false)` | Always render `#bay-board`. “More bays” jumps to `#bay-board`. |
| Home looked empty | `BAY_TOOLS` only after VIN decode | Always show the bay card grid. |
| Script / Maps only in footer | Not on `BAY_NAV` | Added `/mechanic-mode` and `/shops` stamps. |
| Stale / dead header after edits | SW `cacheFirst` on `/_next/static` in dev | Do not register SW unless `NODE_ENV === "production"`; purge workers + caches in development; cache `openhood-shell-v4`. |
| Stuck on WI-FI DROPPED | SW returned cached `/offline` HTML for every failed document fetch, so `/`, `/quote`, and `/directory` painted the fallback. Next.js `<Link>` then soft-navigated inside that shell. Previous unregister left `openhood-shell-v3` in Cache Storage and did not reload a controlling worker. | Network-first documents; fallback only on `TypeError`; 303 to `/offline` instead of impersonating desk URLs; never cache HTML onto another path; `BayLink` + “Back on the network — open the bay”; auto-escape when a worker is controlling and `fetch('/')` is 200. |
| Camera denial felt dead | `getUserMedia` fail left Use camera looping | Copy: “Choose a photo instead.” Next click opens the file picker. |
| Recovery strip thin | Error/loading only four links | Added Ticket, Jobs, Expert, Contact. |

## Header / footer / chips

| Check | Result |
| --- | --- |
| Car / Ticket / Shops | Pass — click leaves `/` → `/quote` → `/directory`; headings Identify / Quote defense / Directory |
| `/offline` tabs + “open the bay” | Pass — Ticket → `/quote?t=`; Shops → `/directory?t=`; yellow control → `/?t=`. Not WI-FI DROPPED. |
| More bays | Pass — `#bay-board` always visible (26+ stamps) |
| Beginner / Expert | Pass — swaps altitude copy only; does not hide the desk |
| Footer (how-it-works, mechanic-mode, directory, guides, agent, expert, jobs, log, contact, shops, terms, privacy) | Pass — pages exist |
| Chips: VIN, 90210, oil-change, cabin-filter, P0420, 2018 Civic lane | Pass — real hrefs |
| `/directory/90210`, `/43215`, `/columbus` | Pass |
| `/obd/P0420` → `/obd?code=P0420` | Pass (redirect) |
| `/vin/1HGCM82633A004352` → `/?vin=` | Pass (redirect) |
| `/playbooks` → `/expert`, `/pricing` → `/how-it-works` | Pass (aliases) |
| `/shops`, `/mechanic-mode`, `/agent`, `/agent/api` | Pass |

## Camera / upload

| Desk | Choose photo | Use camera | Notes |
| --- | --- | --- | --- |
| `/` Identify | Visible 44×134 | Visible 44×118 | File inputs stay `sr-only`; buttons click them. |
| `/quote` | Visible row | Visible row | Preview `<img>` after compress. |
| `/agent` attach | Visible 44×134 | Visible 44×118 | Compact MediaCapture. |
| `/contact` estimate photo | Visible | Visible | Optional JPEG. Same MediaCapture. |
| `/trust` finished-work shots | Visible 44×134 | Visible 44×118 | VIN + RO header shot; tabs switch the control. |
| Permission denied | — | Falls back | “Camera permission was denied. Choose a photo instead.” then file picker. |

## Algorithms (live decode on home)

| Check | Result |
| --- | --- |
| Displacement | **3.0L** (not 3LL, not 3.00) on the Accord label |
| Quote cabin filter $85 | Price book flags cabin as markup/upsell (`src/lib/quote.ts`) |
| P0420 | Dictionary: do not throw a converter (`src/lib/dtc.ts`, `src/lib/jobs/dtc-dictionary.ts`) |

## Images

| Asset | Result |
| --- | --- |
| `/og.png` | Present |
| `/icons/icon.svg`, `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png` | Present |
| `img { display:none }` | Not in app CSS |

## Remaining / known limits

- Photo cloud OCR stays optional behind `OPENAI_API_KEY`. Without it, copy says reading is off; Choose photo / Use camera still work and compress to JPEG.
- Integration Open URLs are outbound search templates (RockAuto, NHTSA, EPA…). No fake inventory, escrow, or TecDoc.
- `/offline` is a PWA fallback, not a product bay. Header tabs and the yellow “open the bay” control must leave it when the server is up.
- Playwright could not keep a Cursor-owned browser tab; verification used the Playwright MCP page on `:3000`.
- `npm run lint` — 0 errors (2 unused-var warnings in `scripts/gen-fluids-catalog.mjs`, pre-existing).
- `npm run build` — compiled; TypeScript finished; 167 static/dynamic routes generated.

## Punch list

1. **Fixed:** Unhid the full bay board; home cards no longer wait for a VIN.
2. **Fixed:** Dev service worker was pinning a dead header — unregistered in development.
2b. **Fixed:** WI-FI DROPPED trap — document navigations are network-first (`openhood-shell-v4`). `/offline` no longer replaces `/`, `/quote`, or `/directory`. Stuck tabs: DevTools → Application → Service Workers → Unregister, or reload once after this change (dev purge reloads when a leftover worker is still controlling).
3. **Fixed:** Camera denial is no longer a dead button.
4. **Verified:** Choose photo + Use camera on home (measured boxes). Quote / agent / contact / trust render the same MediaCapture.
5. **Verified:** Demo VIN prints 3.0L on the live home desk.
6. **Open:** Re-run `npm run lint && npx tsc --noEmit && npm run build` on a clean tree if the last CI run predates these files.
