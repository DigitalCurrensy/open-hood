# 200% competitor matrix

Rated **25 August 2026**. Product name: **Open Hood**. Brand paper: [WHITEPAPER.md](WHITEPAPER.md).

**200%** here means the advocate job *plus* a stamp on the board for every desk the incumbents sell: RepairPal-class estimate, Carfax-class history, YourMechanic-class booking, AutoZone Fix Finder, live OBD, bonded hold / insurance, KBB-style value, CR-style reliability. It does **not** mean we licensed those companies. It is a feature-matrix fantasy, not a score.

We cannot become Carfax this week. We shipped the **surfaces** — routes, hrefs, public APIs, outbound portals, and honest “request access” hooks. A stamp is not a feed. Surfaces ≠ licenses.

Competitive score of the bay: [RATING.md](RATING.md) (**54%**). That is the honest number after Phase 1 surfaces (Car / Ticket / Shops, directory miss stays a miss, `/terms` + `/privacy`, DTC 160 / 206). It is not 200. It is not licensed hours. How to actually buy every pipe to 100%: [AXIS-100.md](AXIS-100.md). Internal “does the bay work”: [SCORECARD.md](SCORECARD.md). Licensed holes stay on [ROADMAP.md](../ROADMAP.md), [INTEGRATIONS.md](INTEGRATIONS.md), and [LICENSES.md](LICENSES.md). BD first emails: [OUTREACH.md](OUTREACH.md).

Nav source: `src/config/nav/matrix.ts`. Phone path: `src/config/nav/consumer.ts`. Site board merges it in `src/components/site-nav.tsx`.

---

## DONE (working surface)

These paths run on public data, on-device storage, a thin hardware stack, or a real outbound URL. Empty states say what is missing. No invented inventory.

| Stamp | Path | What an owner can actually do | Incumbent analog | What it is not |
| --- | --- | --- | --- | --- |
| Home | `/` | NHTSA VIN or year / make / model. Extra vPIC chips (HP, TPMS) when present. Plate is a note. | Dealer app identity | Plate-to-VIN without a paid key |
| Glass | `/sticker` | Every non-empty DecodeVinValues field. Stamped not a Monroney. | Window sticker / Chrome Data | MSRP, packages, destination |
| Garage | `/garage` | Fluids / PSI / filter SKUs from **216** JSON rows, then 27 in-code rows, then a labeled heuristic | OEM owner app spec card | Factory service book |
| Book | `/catalog` | Search the fluids pamphlet + 90 OEM / Fram / Wix / Purolator rows | Owner-manual binder | TecDoc / MOTOR |
| Quote | `/quote` | Paste or photograph an RO. ~12-regex price book + ZIP indie-band compare + counter script | RepairPal “is this fair?” without their corpus | Licensed hours |
| Estimate | `/estimate` | Job + ZIP → parts / labor **band**. 5 regions, 12 jobs. Compare a quoted total | RepairPal estimator | Motor / Mitchell hours |
| Symptoms | `/symptoms` | Noise + moment → inspect list | Symptom checkers | A diagnosis |
| Recalls | `/recalls` | SaferCar **year / make / model** campaigns | SaferCar / dealer campaign list | VIN open / closed close-out |
| History | `/history` | vPIC + recalls / complaints / NCAP + NMVTIS / Carfax / AutoCheck **consumer** links. Owner log merge if present. Plate decode only if CarsXE / MarketCheck key is on | Carfax / AutoCheck / NMVTIS | Accident file, title brand, odometer tape |
| OBD | `/obd` | Type a P/B/C/U from any $20 scanner | Car Scanner English, no bus | Live PIDs |
| Scan | `/scan` | Web Bluetooth ELM327 (Chrome / Android): RPM, speed, coolant, stored DTCs. Demo PIDs on desktop | Torque / FIXD / Car Scanner | Mode 02 freeze-frame, manufacturer PIDs, iOS |
| Parts | `/parts` | RockAuto / AutoZone / Amazon / eBay Motors **search URLs** | AutoZone aisle | TecDoc / shelf count |
| Finder | `/finder` | 19 aisle tickets. Code or symptom → jobs → store searches. “Don’t throw parts” on P0420 | AutoZone Fix Finder | In-stock SKU |
| Directory | `/directory` | Nominatim + OSM Overpass rooftops. No booking cut | RepairPal shop network minus the network | Certified network |
| Visit | `/book` | Visit request stored locally / mailed if contact env exists. OSM shortlist. OEM scheduler outbound | YourMechanic / Wrench / dealer scheduler | A dispatched mechanic |
| Auctions | `/auctions` | Lane list + year / make / model query params. Link-out only | Copart / IAA / Manheim **public pages** | Live Manheim board |
| Guides | `/guides` | Curated jobs + verified YouTube IDs or a search URL | How-to apps | Stolen TSB PDFs |
| Talk | `/agent` | Keyword router always; OpenAI tools only with a key | In-app advisor | A licensed tech line |
| Expert | `/expert` | Twelve playbooks. SaferCar patterns — not pirated TSB PDFs | Shop TSB books (public subset) | Identifix / dealer TSB |
| Jobs | `/jobs` | Role desks: owner through fleet | Industry portals | A shop OS |
| Log | `/log` | Date, miles, what was done. This device | Carfax service stamps (owner-entered) | Participating-shop feed |
| Copy | `/report` | Print / JSON packet from session + log | Customer copy | A state inspection |
| Lines | `/integrations` | Live public APIs + request-access cards | Patch bay | A live TecDoc jack |
| RO | `/contact` | Name + phone or email + the ticket. We do not sell it | Service-writer window | A CRM |
| Bond | `/trust` | Bonded-estimate checklist, claim photo list, carrier FNOL links, AAA locator link-out. Hold is **demo** unless Stripe **test** key (live keys refused) | Bonded estimates / insurance FNOL | Escrow, live card capture |
| Worth | `/value` | Transparent depreciation illustration + KBB / Edmunds / NADA consumer searches | KBB / Edmunds / NADA | Cox / KBB residual feed |
| File | `/reliability` | NHTSA complaint counts + optional localStorage vote | Consumer Reports bubbles | CR subscriber methodology |
| How | `/how-it-works` | What is free vs what we refuse to fake | — | — |

The matrix nav is imported, not href-only. Finder, estimate, history, sticker, catalog, book, scan, trust, value, reliability, log, report, contact, expert, integrations, directory, auctions are on disk.

---

## STILL NEEDS PAID PIPE

A control that looks live without the contract is a bug. These stay catalog / request-access until a real key and a real agreement exist. This is the gap between **50%** and the 200% fantasy.

| License | Why a stamp is not enough | Surface we shipped instead |
| --- | --- | --- |
| **TecDoc / TecAlliance** | VIN-correct interchange and OEM-linked SKUs. We do not invent “in stock.” | `/parts`, `/finder` storefront searches |
| **Carfax business API** | Accidents, titles, participating-shop stamps, dealer XML. We do not scrape Carfax HTML and we do not republish their file. | `/history` consumer purchase URLs + NHTSA jacket |
| **MOTOR hours** (Hearst / Identifix) | Book time. A ZIP band and 12 typical-hour jobs are not a Motor guide. | `/estimate` regional averages |
| **Mitchell / ALLDATA** | Same hole as Motor if anyone asks. Shop subscription, not a pamphlet. | Same estimate desk |
| **Manheim** (and ADESA) | Wholesale lane data and live lots. We do not scrape the lane. | `/auctions` link-out |
| **Dealer DMS** | Write the RO, clock hours, parts on *their* ticket. We do not sit in their bay. | `/book` OEM scheduler outbound |
| **Chrome Data** (J.D. Power) | Build / options / packages. vPIC fields are not a window sticker. | History “decoder options” note |
| **CarsXE / MarketCheck plate-to-VIN** | Code is in `/history`. Dark without the key and the contract. A plate is a note. | Photo-the-VIN path |
| **VinAudit / NMVTIS provider** | Title brands, junk/salvage. We link the federal consumer pages. We do not sell the snapshot. | NMVTIS / AutoCheck outbound |
| **Cox / KBB / NADA feed** | Residuals and auction comps. Our illustration is age × miles × condition. | `/value` consumer searches |
| **Google Places / Yelp Fusion** | Denser rooftops and phones than OSM. Jack is coded (`GET /api/directory/places`). Dark without the keys. | Nominatim + Overpass + demo ZIP cache; OSM-only stamp when keys are off |
| **eBay Browse OAuth** | Live listing search. We open the public search URL. | Parts / finder hrefs |
| **Stripe live / escrow** | Money movement, disputes, chargebacks. Live keys are refused on `/trust`. Test hold is not a shop deposit. | Demo stamp or Stripe **test** PaymentIntent, never captured here |
| **Insurance carrier APIs** | FNOL, estimate matching, total-loss rules. | Carrier FNOL **links** on `/trust` |

Also cataloged, not called: Auto.dev listings. See `src/data/apis.json` and `GET /api/integrations/status`.

---

## What 200% is not

- Not a Carfax report we generated.
- Not Motor or TecDoc hours we guessed and labeled “factory.”
- Not a dispatched mobile mechanic.
- Not a live Manheim board.
- Not a dealer management system.
- Not Consumer Reports’ subscriber methodology.
- Not a Cox / KBB valuation feed (unless a key exists and the desk says so).
- Not 200% of RepairPal + Carfax + AutoZone + Car Scanner. That arithmetic is the fantasy name of this file. The bay is **50%**.

The advocate loop stays the product: identify the car, mark **this** RO, say the measurement at the window. The matrix is so an owner who came from RepairPal, Carfax, AutoZone, or a dealer app can find the matching desk without us pretending we bought their database.

---

## Nav stamps

From `MATRIX_NAV_ITEMS` (deduped by href against the existing board). All of these import a real nav module or a local `AUCTIONS_NAV_ITEM` / `DIRECTORY_NAV_ITEM`.

| Stamp | href | Module |
| --- | --- | --- |
| Estimate | `/estimate` | `ESTIMATE_NAV_ITEM` |
| History | `/history` | `HISTORY_NAV_ITEM` |
| Sticker | `/sticker` | `STICKER_NAV_ITEM` |
| Book | `/catalog` | `CATALOG_NAV_ITEM` |
| Visit | `/book` | `BOOK_NAV_ITEM` |
| Finder | `/finder` | `FINDER_NAV_ITEM` |
| Scan | `/scan` | `SCAN_NAV_ITEM` |
| Bond | `/trust` | `TRUST_NAV_ITEM` |
| Worth | `/value` | `VALUE_NAV_ITEM` |
| File | `/reliability` | `RELIABILITY_NAV_ITEM` |
| RO | `/contact` | `CONTACT_NAV_ITEM` |
| Copy | `/report` | `REPORT_NAV` |
| Log | `/log` | `LOG_NAV_ITEM` |
| Expert | `/expert` | `EXPERT_NAV_ITEM` |
| Lines | `/integrations` | `INTEGRATIONS_NAV_ITEM` |
| Directory | `/directory` | `src/config/nav/directory.ts` |
| Auctions | `/auctions` | `AUCTIONS_NAV_ITEM` in `matrix.ts` |
| How-to / Guides | `/guides` | `GUIDES_NAV` |
| Talk | `/agent` | `AGENT_NAV_ITEM` |
| Who / Jobs | `/jobs` | `JOB_INDEX` |

Chips an owner will see if they were not already on the board: **Estimate, History, Sticker, Book, Visit, Finder, Scan, Bond, Worth, File, Copy**.
