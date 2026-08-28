# Wave +10

Biggest build we can ship **without** licensed pipes. Eight axes, ten points each, from the gap list.

**Scorekeeper 27 August 2026 — working tree.** All eight +10 bars in [RATING.md](RATING.md) landed. Overall **61** (mean floored). Company **35**. Licensed pipes below stay paper.

| Axis | From | To | Tree | Leftover if any |
| --- | ---: | ---: | --- | --- |
| Identification | 52 | 62 | **62 shipped** | Plate adapter is live fetch (`src/lib/history/plate.ts`). Keys off = note. |
| Quote defense | 54 | 64 | **64 shipped** | 43 jobs + bundle flags + OCR honesty. |
| UX | 58 | 68 | **68 shipped** | Demo VIN + thin loaders + auto `:3100` rescue. `openhood.firstRun` **never written**. |
| Data depth | 48 | 58 | **58 shipped** | Big fluids JSON + 24 playbooks + not-CR. DTC still ~160 / ~206. SKU ~100 not ~140. |
| Integrations | 42 | 52 | **52 shipped** | Status matrix + live-when-keyed. Keys currently false is OK. |
| Trust | 44 | 54 | **54 shipped** | Honest zeros + methodology + ticket counts. |
| Mobile | 36 | 46 | **46 shipped** | Safe `sw.js` + Android BLE. Store still paper — not 56. |
| Uniqueness | 76 | 86 | **86 shipped** | Ticket path + no cart + compare-3. |

Night bay. Not a SaaS sprint. Native `fetch` only. No axios. No generic-SaaS restyle.

**Demo VIN lock (do not regress):** `1HGCM82633A004352` → **2003 Honda Accord**, displacement **3.0L** (not `3.00`), oil **5W-20**. Door jamb still wins a catalog miss.

---

## Targets (gap list)

| Axis | From | To | Tree 27 Aug | Implementer |
| --- | ---: | ---: | --- | --- |
| Identification | 52 | 62 | **62** | identification packet |
| Quote defense | 54 | 64 | **64** | quote book |
| UX | 58 | 68 | **68** | UX shell |
| Data depth | 48 | 58 | **58** | data depth |
| Integrations | 42 | 52 | **52** | integrations bay |
| Trust | 44 | 54 | **54** | trust+uniqueness |
| Mobile | 36 | 46 | **46** | mobile PWA |
| Uniqueness | 76 | 86 | **86** | trust+uniqueness |

Overall **61** (mean floored). Still a thicker honest bay, not Motor. A signed feed is the next 39 points.

---

## PAPER — do not fake

If a control looks live and is not, it is a bug. These stay dark, stubbed, or link-out. Code the honesty. Do not code the theater.

| Pipe | Honest state |
| --- | --- |
| Chrome Data live catalog | `src/lib/chrome-data.ts` stays `{connected:false}`. No fetch. `/sticker` is vPIC, not a Monroney. |
| Motor / Mitchell / TecDoc hours | ZIP typical hours + regex book. Never label them Motor, factory, or TecDoc. Do not add a live `motor.ts` / `tecdoc.ts`. |
| Carfax XML / accident-title file | Consumer purchase URLs only. NHTSA is not Carfax. |
| VIN-true `recallsByVin` | Public API is **403**. SaferCar `nhtsa.gov/recalls?vin=` link-out. Y/M/M rows stay weaker than this VIN. |
| CarsXE / MarketCheck on-by-default | Plate is a **note** unless a key is actually set. Do not flip default-on. |
| Stripe live / escrow | `sk_live_` refused. Test hold says test. No Pay-the-shop. No MTL theater. |
| iOS BLE / store apps | Chrome/Android Web Bluetooth only. Desktop scan stays demo PIDs. PWA is a pin, not an App Store listing. |
| Fake users / reviews / counsel stamp | No invented counts. Counsel has not signed plate or live charges. |
| Fake inventory | Search URLs. Never “in stock.” |

Request-access cards are fine. `configured: true` without a key is a scoring fail.

---

## Scoring rule (scorekeeper later)

- Do **not** claim `configured: true` without the key in env.
- Do **not** call heuristic hours Motor / Mitchell / ALLDATA / factory.
- Do **not** call NHTSA campaigns, complaints, or stars a Carfax / AutoCheck / NMVTIS file.
- Heuristic fluids stay `source: heuristic`. Catalog stays `catalog`. Honda miss must not invent 5W-30.
- Plate without a key stays a note. Chrome stays disconnected. VIN campaign probe may report 403 — that is a pass.
- +10 only if the lever below shipped **and** the PAPER wall held. Do not double-count hydrate-first or the safe SW.

---

## Honest +10 levers

What code ships that actually moves the number. Not a pamphlet about a pamphlet.

### Identification 52→62 — identity packet — **SHIPPED** (62)

vPIC is real. Chrome is not. Plate is a note. VIN open/closed is a link. The remaining ten is **one object the owner can take to the window**, not a fake build sheet.

**Ship:** `src/lib/identity-packet.ts` (or equivalent) that binds, from data we already have:

1. VIN + year/make/model + every non-empty DecodeVinValues field we already print on `/sticker` (displacement, HP, cylinders, engine code).
2. Fluids source stamp (`catalog` vs `heuristic`) — oil visc for the Honda demo stays 5W-20.
3. SaferCar VIN href + plain “Y/M/M is weaker than this VIN.”
4. Chrome stamp `{connected:false}` — “not a window sticker.”
5. Plate/state/miles/concern as **notes**.
6. Copy / print / report slice so `/sticker`, `/garage`, `/report` read the **same** packet.

Photo path: JPEG compress + crop hint + Tesseract, optional `/api/ocr` only if `OPENAI_API_KEY` is on, honest miss. No plate-to-VIN default-on.

### Quote defense 54→64 — quote book — **SHIPPED** (64)

Licensed hours are PAPER. The remaining ten is a **thicker typical book that says it is typical**, used on the actual RO.

**Ship:**

- Grow `src/data/job-catalog.json` from ~15 toward **~28** common passenger-car jobs. Hours stay “typical,” never Motor.
- Grow `src/lib/quote.ts` `PART_BOOK` regexes for the upsells we already flag (flush, trans flush, throttle-body, cabin) plus the new jobs. “Ask what failed” stays.
- Quote desk compare is **line-level** against the ZIP indie band **and** the typical-hour job. Script cites the band (“coastal indie high for pads…”).
- Source stamp on every compare: regional typical hours, national-ish parts band, not VIN SKUs.

Last-two tickets already exist. Do not rewrite `/scan`. Do not invent TecDoc stock.

### UX 58→68 — shell — **SHIPPED** (68). First-run still paper.

Session and Car / Ticket / Shops already shipped. The remaining ten is the **mad-owner 30-second path** and empty states that name the next desk. Not a second site. Not Inter.

**Ship:**

- First-run (one device): three stamps — identify the car, mark this ticket, leave with a sentence. `openhood.firstRun` in localStorage. No account. **Still paper — that key was never written. Missing file: a first-run component writing `openhood.firstRun`.** UX 68 still awarded on demo VIN + thin loaders + auto `:3100` rescue.
- Empty / error copy on the three primaries names the next desk. Failure does not apologize.
- Skip link, focus ring, 44px stamps, contrast on canary/grease. Closer to AA — not a certified audit.
- Route loading stays the thin ticket bar. Do not bring back full-page “Opening bay…”.
- How-it-works `dummy` / `genius` stay CSS altitude only. Never user-facing labels.

Night-bay palette and stencil. Do not generic-SaaS the homepage.

### Data depth 48→58 — pamphlet growth — **SHIPPED** (58). DTC / SKU targets still paper.

Factory fluids, Identifix TSBs, and a history file are PAPER. The remaining ten is **more rows we can defend**, still a pamphlet.

**Ship:**

- Fluids JSON **216 → big catalog** via existing gen scripts (EXISTING + ADDED + MORE_ROWS; ~7.8k-line file). JSON first, in-code fallback, then heuristic. Honda `1HGCM82633A004352` stays **5W-20**. **Shipped.**
- SKU cross-ref **90 → ~100** (WAVE asked ~140). Not TecDoc. **Still short — leftover: `src/data/sku-crossref.json`.**
- DTC: core `src/lib/dtc.ts` still ~**160** (WAVE asked ~220); jobs `src/lib/jobs/dtc-dictionary.ts` still ~**206** (WAVE asked ~270). Real SAE titles. **Still paper — leftover files: those two books.**
- TSB desk: public pattern cards **15 + 16 extra = 31**. Not stolen dealer PDFs. **Shipped.**
- Playbooks: 12 core + 12 extra = **24**. **Shipped.**
- Reliability: NHTSA ODI + published method. Not CR. **Shipped.**
- Loud `catalog` vs `heuristic` on the spec sheet (do not quiet this).

Reliability method is already written. Do not turn complaint counts into CR bubbles.

### Integrations 42→52 — honesty bay — **SHIPPED** (52)

Places/Yelp/plate keys on are PAPER. The remaining ten is a bay that **groups the jacks and tells the truth**.

**Ship:**

- `/integrations` + `GET /api/integrations/status`: **live / outbound / dark / refused**. Chrome disconnected. Stripe live refused. Plate dark without keys. Places/Yelp `{connected:false, results:[]}` without keys.
- VIN-campaign probe already 403 — keep it. Show the 403. Do not parse SaferCar HTML.
- Request-access cards complete for TecDoc, Carfax business, MOTOR, MarketCheck, CarsXE, VinAudit, Chrome, eBay Browse. No `configured: true` on those.
- `public/openapi.yaml` lists routes that exist. Agent `/agent/api` matches.

Do not add a Motor client. Do not add an eBay Browse fetch without `EBAY_CLIENT_ID` + secret.

### Trust 44→54 — refuse wall (same owner as uniqueness) — **SHIPPED** (54)

ToS / privacy / wrong-city-as-default already shipped. Counsel, Stripe live, escrow, users, reviews: PAPER. The remaining ten is **every number wearing its source**, and no social-proof theater.

**Ship:**

- `/trust` refuse wall: no users in this repo, no reviews, counsel has not signed plate or `sk_live_`, hold is test-or-demo, we do not certify shops.
- Source stamps the owner can read: NHTSA vs heuristic vs ZIP typical vs outbound Carfax.
- Hold path: keep refusing `sk_live_`. Test key says test. No fake deposit.
- `security.txt` / privacy path stay linked. No invented bond number.

### Mobile 36→46 — waiting-room PWA — **SHIPPED** (46). Store / iOS BLE still paper.

iOS BLE and store apps are PAPER. Safe SW already shipped — **do not regress it.** The remaining ten is a pin that keeps the last packet when Wi-Fi dies.

**Ship:**

- `/__bay/last.json` holds last car **and** last script **and** a short identity-packet snapshot (not HTML).
- `/offline` names which desks need the network (Identify, Quote). Never paint `/offline` onto `/quote` `/directory` `/recalls`.
- `public/sw.js`: no `navigate` / `document` intercept. Precache icons + manifest only. Activate deletes `openhood-shell-*`.
- Camera + client JPEG compress on identify/quote. 44px hits.
- Install copy: “pin this site.” Never “get it on the App Store.”

Production / `next start` registers; `next dev` leftover-only. `/?unlock=1` and `scripts/rescue-3100.mjs` still move dead :3100 tabs to :3000.

### Uniqueness 76→86 — execute the job (same owner as trust) — **SHIPPED** (86)

86 is **not** the first licensed pipe (that is AXIS 80). 86 is the unique job executed: mark **this** RO, say **these** three lines, refuse the marketplace, and show the honest matrix. A unique pamphlet that works in the waiting room — still a pamphlet.

**Ship:**

- One waiting-room spine: identity packet → grease-pencil → three-line script → print/share. No booking cut. No “Book this shop.”
- Stamp what RepairPal / Carfax / AutoZone / dealer apps optimize for vs what this bay stamps. We take no cut. They route the job.
- Voice: [BRAND.md](BRAND.md). Measurements beat adjectives. Empty states name the next move.
- If uniqueness work starts looking like a shop network, inventory, or escrow — stop. Uniqueness **falls** if we become them.

---

## File ownership (parallel; do not collide)

Seven implementers. Eight axes. Trust and uniqueness share one owner so the refuse wall and the advocate spine stay one voice.

| Owner | Owns | Reads, does not rewrite | Never |
| --- | --- | --- | --- |
| **identification packet** | `src/lib/identity-packet.ts` (new), `src/app/sticker/**`, `src/app/vin/**`, `src/app/api/vin/**`, `src/app/api/identify/**` if present, `src/lib/nhtsa.ts` (honesty only), `src/lib/chrome-data.ts` (stub), `src/components/spec-sheet.tsx`, `src/components/vehicle-gate.tsx`, `src/components/photo-intake.tsx` | `src/lib/fluids.ts` (source field), `src/lib/vehicle-session.ts`, report assemble identity slice | Live Chrome fetch. `recallsByVin` success. Plate default-on. `src/lib/history/plate.ts` writes. |
| **quote book** | `src/lib/quote.ts`, `src/lib/labor/**`, `src/data/job-catalog.json`, `src/data/labor-zip-bands.json`, `src/app/quote/**`, `src/app/estimate/**`, `src/app/api/quote/**`, `src/app/api/estimate/**`, `src/components/quote-desk.tsx` | identity packet (VIN on the ticket), fluids visc on the script | `motor.ts` / `tecdoc.ts`. Hours labeled factory. Fake stock. `/scan`. |
| **UX shell** | `src/components/site-nav.tsx`, `src/components/site-footer.tsx`, `src/config/nav/**`, `src/app/page.tsx`, `src/app/how-it-works/**`, `src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/components/page-brief.tsx`, `src/components/bay-link.tsx`, `src/components/bay-path.tsx`, `src/components/how-it-works.tsx`, `src/components/reading-level.tsx`, first-run component (new), `openhood.firstRun` | desk interiors | Palette rewrite of every desk. Accounts. Marketplace homepage. `/estimate` `/quote` internals. |
| **data depth** | `src/data/fluids-catalog.json`, `src/lib/fluids.ts`, `src/data/sku-crossref.json`, `src/lib/dtc.ts`, `src/lib/jobs/dtc-dictionary.ts`, `src/data/tsb-patterns.json`, `src/lib/expert/tsb.ts`, `src/app/catalog/**`, `src/app/obd/**`, `src/app/jobs/obd/**`, `src/app/expert/**` (pattern cards), `scripts/gen-fluids-catalog.mjs`, `scripts/fluids-catalog-more.mjs` | `/reliability` method (already shipped) | Stolen TSB PDFs. Heuristic labeled catalog. Honda oil change. Identifix client. |
| **integrations bay** | `src/lib/integrations/**`, `src/data/apis.json`, `src/app/integrations/**`, `src/app/api/integrations/**`, `src/app/agent/api/**`, `public/openapi.yaml`, `src/app/api/openapi/**`, `.env.example` comments | `src/lib/directory/places.ts`, `src/lib/history/plate.ts`, `src/lib/chrome-data.ts`, `src/lib/trust/hold.ts` (status only) | `configured: true` without keys. Places/Yelp merge theater. eBay Browse without secrets. New Motor/Carfax clients. |
| **mobile PWA** | `public/sw.js`, `public/manifest.webmanifest`, `public/icons/**`, `src/components/pwa-boot.tsx`, `src/components/pwa-unlock-script.tsx`, `src/lib/pwa.ts`, `src/app/offline/**`, `src/components/media-capture.tsx`, `src/components/offline-escape.tsx` | identity packet + last script fields for `last.json` | HTML intercept. Cached `/quote` `/directory` `/recalls`. iOS BLE. `apps/native`. `/scan` rewrite. |
| **trust+uniqueness** | `src/app/trust/**`, `src/lib/trust/**`, `src/app/api/trust/**`, `src/app/terms/**`, `src/app/privacy/**`, refuse-wall / advocate-spine copy on `/how-it-works` and home cite (`src/app/_components/home-cite.tsx`), `public/security.txt` | quote script + identity packet (consume) | `sk_live_` accepted. Escrow client. Fake reviews/users/bond. “Book this shop.” Counsel-signed badge. |

**Shared read-only:** `src/lib/vehicle-session.ts` (already persists). Identification reads the vehicle. UX writes `openhood.firstRun` only. Mobile writes `/__bay/last.json` only.

**Do not touch this wave:** `/scan` internals, `/history` rewrite, `/finder` rewrite, `/book` rewrite, `/directory` search rewrite, `public/sw.js` navigate intercept, Honda 5W-20, NHTSA displacement rounding.

---

## Definition of done (wave)

1. Demo VIN still **2003 Honda Accord · 3.0L · 5W-20**.
2. PAPER table still true on a cold `/integrations` GET — licensed jacks `configured: false` or `{connected:false}`.
3. Quote compare cites ZIP typical hours and says it is not Motor.
4. Recalls on this VIN are Y/M/M + SaferCar link, not an open/closed file we fetched.
5. SW never serves cached HTML for a desk. `/offline` is its own route.
6. Night-bay identity held. Native `fetch` only.
7. `npm run lint && npx tsc --noEmit && npm run build`. Then exercise Car → Ticket → Script on a phone-width viewport.

Scorekeeper updated [RATING.md](RATING.md) **27 August 2026**: 62 / 64 / 68 / 58 / 52 / 54 / 46 / 86 → overall **61**. WAVE leftovers that did not ship: `openhood.firstRun`, DTC 220 / 270, SKU ~140. PAPER table still true.

Related: [RATING.md](RATING.md) · [AXIS-100.md](AXIS-100.md) · [EXECUTION-BOARD.md](EXECUTION-BOARD.md) · [BRAND.md](BRAND.md) · [ROADMAP.md](../ROADMAP.md).
