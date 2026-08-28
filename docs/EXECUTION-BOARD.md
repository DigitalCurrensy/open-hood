# Execution board

Sequenced work packages. File ownership. **Needs contract** vs **can code now**. Axis plan: [AXIS-100.md](AXIS-100.md). Team: [TEAM.md](TEAM.md). Licenses: [LICENSES.md](LICENSES.md).

Do not open GitHub issues for this board unless someone wants them. This file is the queue.

Status key: `now` = can code without a license. `done` = shipped in this repo. `paper` = blocked on a signed contract or money. `live` = key on and UI tells the truth.

---

## Phase 0 — can code now (WP-00)

| ID | Package | Files | Contract? | Status | Unlocks |
| --- | --- | --- | --- | --- | --- |
| WP-00A | Persist vehicle, quote, ZIP, report packet across tabs | `src/lib/bay-storage.ts`, `src/lib/vehicle-session.ts`, `src/components/report/assemble-client.ts`, `src/components/quote-desk.tsx` | No | **done** | UX, Identification |
| WP-00B | Last-two marked tickets | `src/lib/vehicle-session.ts`, `src/components/quote-desk.tsx` | No | **done** | Quote 50→~52 |
| WP-00C | Request-access cards + env hooks | `src/lib/integrations/catalog.ts`, `src/lib/integrations/status.ts`, `.env.example`, `src/data/apis.json` | No | **done** | Integrations honesty |
| WP-00D | Promote plate keys to env lane (code already existed) | catalog + status | No | **done** | Identification / Integrations |
| WP-00E | Honest VIN-campaign probe (`recallsByVin` is 403) | `src/lib/nhtsa.ts` `fetchVinCampaignLookup`, `GET /api/integrations/nhtsa?kind=vin-campaign` | No | **done** | Identification honesty |
| WP-00F | PWA already wired — do not re-do | `src/app/layout.tsx`, `src/components/pwa-boot.tsx`, `public/sw.js`, `/offline` | No | **done** | Mobile floor |
| WP-00G | Honesty pass: Chrome stub, safe SW, heuristic caveats | `src/lib/chrome-data.ts`, `public/sw.js`, `src/lib/pwa.ts`, `src/lib/fluids.ts`, `/sticker` | No | **done** | Identification honesty, Mobile safety |

PWA, `/sticker`, `/catalog` were already shipped. Do not rewrite `/estimate` `/scan` `/history` `/finder` `/book` `/trust` unless a bug.

**Safe SW (do not regress).** `public/sw.js` never intercepts `navigate` / `document`. It never serves cached HTML for a desk URL. Precache is icons + manifest only. `/__bay/last.json` is the last-car snapshot. Activate deletes `openhood-shell-*` leftovers. Production / `next start` always registers; `next dev` is leftover-only. `PWA_UNLOCK_INLINE` auto-leaves dead `:3100` for `:3000`. `/?unlock=1` and `scripts/rescue-3100.mjs` are backup. Do not paint `/offline` onto `/quote` `/directory` `/recalls`.

---

## Wave +10 — scored 27 August 2026

Scorekeeper: [RATING.md](RATING.md) **61** overall. [WAVE-PLUS10.md](WAVE-PLUS10.md) marks shipped vs paper. Honda lock: `1HGCM82633A004352` → 2003 Accord 3.0L 5W-20.

| Axis | Score | Status | Leftover file / key |
| --- | ---: | --- | --- |
| Identification | 62 | **done** | Plate adapter live-when-keyed. Default-on is still WP-20 paper. |
| Quote defense | 64 | **done** | 43 jobs + bundle + OCR honesty. Motor is still WP-22 paper. |
| UX | 68 | **done** | Demo VIN + thin loaders + auto `:3100` rescue. `openhood.firstRun` never written. |
| Data depth | 58 | **done** | Big fluids + 24 playbooks + not-CR. DTC 220/270 and SKU ~140 still paper. |
| Integrations | 52 | **done** | Status matrix + live-when-keyed. Keys currently false is OK. |
| Trust | 54 | **done** | Honest zeros + ticket counts. Users / counsel still paper. |
| Mobile | 46 | **done** | Safe SW + Android BLE. Store / iOS BLE still WP-40 paper. |
| Uniqueness | 86 | **done** | Ticket path + no cart + compare-3. |

**Still paper (cannot fake):** CarsXE / MarketCheck off-by-default, Chrome Data live catalog, Motor / Mitchell hours, TecDoc SKUs, Carfax XML, VIN-true `recallsByVin` (public 403), Stripe live + escrow, iOS BLE / store apps, fake users / reviews, `openhood.firstRun`, DTC 220 / 270.

---

## Phase 1 — this quarter, still mostly now

| ID | Package | Files | Contract? | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| WP-10 | Consumer IA: Car / Ticket / Shops | `src/components/site-nav.tsx`, `src/config/nav/consumer.ts`, `src/config/nav/ux.ts` | No | **done** | Three primary stamps. Full board behind More bays |
| WP-11 | Kill wrong-city directory as default | `src/lib/directory/search.ts` | No | **done** | Demo cache only when the owner asks for 90210 / 43215 |
| WP-12 | ToS + privacy pages | `/terms`, `/privacy`, footer | Counsel | **done** (pages) / **paper** (sign-off) | Pages live. Counsel still blocks plate + Stripe live |
| WP-13 | Places + Yelp keys in prod | already `src/lib/directory/places.ts` | Google/Yelp billing | **paper** | Jack exists. OSM-only without keys. `/directory/90210` works |
| WP-14 | Paid OCR always-on path | `src/app/api/ocr/route.ts`, quote desk, VIN photo | OpenAI invoice | **done** (path) / **paper** (invoice) | Cloud first when `OPENAI_API_KEY` is on. Honest device fallback |
| WP-15 | DTC book growth | `src/lib/dtc.ts`, `src/lib/jobs/dtc-dictionary.ts` | No | **done** | Core 160 · jobs 206. Real SAE titles, not invented diagnoses |
| WP-16 | Reliability methodology written | `docs/RELIABILITY.md` + `/reliability` | No | **done** | Not a CR survey |
| WP-17 | PWA last car + last script (bay snapshot, not HTML) | `public/sw.js`, `/offline` | No | **done** | Identify / Quote still need the network |
| WP-18 | a11y pass | nav + `reading-level` + tap floor | No | **done** | 44px stamps. Beginner / Expert only |

BD one-pager: [OUTREACH.md](OUTREACH.md) — **done**. Who to email. What we will not scrape. Not a spam template.

---

## Phase 2 — licenses (paper)

| ID | Package | Files after signature | Vendor | Status | Unlocks |
| --- | --- | --- | --- | --- | --- |
| WP-20 | Plate-to-VIN on by default | already `src/lib/history/plate.ts` (live fetch when keyed) | CarsXE or MarketCheck | **paper** (coded, off without a key) | Identification 62→75 |
| WP-21 | Chrome Data build sheet | `src/lib/chrome-data.ts` stub `{connected:false}`, `/sticker` | J.D. Power Chrome | **paper** (honesty stub shipped; no live catalog) | Identification 75→90 |
| WP-22 | MOTOR or Mitchell hours | **new** `src/lib/motor.ts` — do not add. `GET /api/integrations/motor` stays `{configured:false, hours:[]}` | Hearst / Mitchell | **paper** | Quote 64→85 |
| WP-23 | TecDoc VIN SKUs | **new** `src/lib/tecdoc.ts`, `/finder`, `/parts` | TecAlliance | **paper** | Quote + Data |
| WP-24 | PartsTech ZIP parts $ | **new** `src/lib/partstech.ts` | PartsTech | **paper** | Quote 80→90 |
| WP-25 | Factory fluids feed | `src/lib/fluids.ts` adapter | Motor / ALLDATA / OEM | **paper** | Data 55→75 |
| WP-26 | Identifix TSB legally | `src/lib/expert/tsb.ts` | Hearst | **paper** | Data |
| WP-27 | VinAudit / AutoCheck fetch | `src/lib/history/` | Approved NMVTIS provider | **paper** | Data / Identification |
| WP-28 | Carfax business (if they sell) | history client | Carfax for Dealers | **paper** | Data 75→95 |
| WP-29 | VIN-true open/closed | nhtsa client or fleet vendor | NHTSA partnership or commercial bulk | **paper** | Identification 90→100 |
| WP-30 | eBay Browse OAuth | **new** `src/lib/ebay.ts` | eBay | **paper** | Integrations |
| WP-31 | Cox/KBB fetch | `src/lib/value/` | Cox | **paper** | Integrations / Data |
| WP-32 | Stripe live + ToS hold | `src/lib/trust/hold.ts` | Stripe + counsel | **paper** | Trust 54→75 |
| WP-33 | Escrow / MTL partner | **new** `src/lib/trust/escrow.ts` | Licensed partner | **paper** | Trust 75→95 |
| WP-34 | Surety bond ops | `/trust` copy only after bond | Surety | **paper** | Trust |
| WP-35 | FNOL API | **new** `src/lib/trust/fnol.ts` | CCC / Mitchell / Verisk | **paper** | Trust 95→100 |

**Never:** scrape Carfax, SaferCar VIN HTML, RockAuto stock, or dealer DMS.

**Still paper (cannot fake):** CarsXE / MarketCheck off-by-default (plate is a note), Chrome Data live catalog, Motor / Mitchell hours, TecDoc SKUs, Carfax XML, VIN-true `recallsByVin` (public 403 — SaferCar link only), Stripe live + escrow, iOS BLE / store apps.

---

## Phase 3 — native (month 6+)

| ID | Package | Files | Contract? | Status |
| --- | --- | --- | --- | --- |
| WP-40 | Expo/RN app, camera → existing OCR | `apps/native` (README only — not a store listing) | Apple $99 / Play $25 | **paper** |
| WP-41 | iOS BLE ELM327 | native BLE module | No vendor license | **now** (after native) |
| WP-42 | Mode 02 freeze-frame | `/scan` + native | No | **now** (after native) |
| WP-43 | Offline SQLite bay | native + SW | No | **now** (after native) |

---

## Dependency graph (short)

```
WP-12 counsel ──┬── WP-20 plate prod
                ├── WP-32 Stripe live
                └── WP-27/28 history file

WP-22 Motor ────── WP-25 fluids (often same vendor)
WP-22 + WP-23 ──── Quote 100%
WP-21 + WP-29 ──── Identification 100%
WP-32 + WP-33 + WP-34 + WP-35 ── Trust 100%
WP-10 IA ──────── WP-40 native
Founder uniqueness rule ── every WP (no booking cut)
```

---

## File ownership (avoid collisions)

| Owner | Paths |
| --- | --- |
| Full-stack | `src/app/**` desks except `/trust` money, `src/components/**`, `src/lib/vehicle-session.ts`, `src/lib/quote.ts`, `src/lib/nhtsa.ts` |
| Integrations | `src/lib/integrations/**`, `src/lib/directory/places.ts`, `src/lib/history/plate.ts`, `src/lib/chrome-data.ts` (stub), future `src/lib/motor.ts` `tecdoc.ts` |
| Mobile | `public/sw.js` (safe worker — no HTML intercept), `src/components/pwa-boot.tsx`, future `apps/native` |
| Founder + counsel | `src/lib/trust/**`, legal copy, `.env` production keys |
| BD | [LICENSES.md](LICENSES.md) status column only |

Do not edit `/estimate` `/scan` `/history` `/finder` `/book` `/trust` in the same week as a sibling agent unless you are fixing a bug or wiring a **live** key behind an existing empty state.
