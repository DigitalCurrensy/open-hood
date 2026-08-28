# Open Hood: every axis to 100%

Dated **25 August 2026**. Product name: **Open Hood**. Brand paper: [WHITEPAPER.md](WHITEPAPER.md). This file is the acquisition and integration plan, not a rating change.

**Delta 27 August 2026.** [RATING.md](RATING.md) now scores the working tree at **61%** product (mean floored of the eight +10 bars). Company stays **~35%** — still zero users. Licensed pipes are still paper. 100% is still this bill of materials. Do not treat 61 as “we bought Motor.”

| Axis | 25 Aug start | 27 Aug tree | Still paper to 100 |
| --- | ---: | ---: | --- |
| Identification | 50 | **62** | Chrome catalog + plate key on by default + VIN-true open/closed |
| Quote defense | 52 | **64** | Motor / Mitchell hours + TecDoc SKUs |
| UX | 56 | **68** | WCAG AA + first-run (`openhood.firstRun` never written) |
| Data depth | 42 | **58** | Factory fluids feed + legal TSB + history file. DTC still ~160 / ~206 |
| Integrations | 44 | **52** | Places/Yelp keys on + eBay Browse + advocate DMS held |
| Trust | 40 | **54** | Counsel + bond + Stripe live + users |
| Mobile | 42 | **46** | Store apps + iOS BLE. Safe SW + Android BLE already in |
| Uniqueness | 76 | **86** | First licensed pipe without becoming a marketplace |
| **Overall** | 50s | **61** | Mean floored. Next 39 are contracts |

Honda lock unchanged: `1HGCM82633A004352` → 2003 Accord **3.0L** **5W-20**.

Verified in this repo today: fluids JSON grown (EXISTING + ADDED + MORE_ROWS; ~7.8k-line file), 43 typical-hour jobs, 24 playbooks, 31 pattern cards, identification packet + check-digit + SaferCar stamps, live plate adapter (dark without key), Places/Yelp jack coded and dark, status matrix, safe SW, auto `:3100` rescue, compare-3, honest zeros. Stripe live keys refused. `api.nhtsa.gov/recalls/recallsByVin` returns **403**. Public REST recalls stay year/make/model.

Interactive scoreboard: open the Axis 100 canvas beside chat. Written companions: [TEAM.md](TEAM.md), [EXECUTION-BOARD.md](EXECUTION-BOARD.md), [LICENSES.md](LICENSES.md), [WAVE-PLUS10.md](WAVE-PLUS10.md).

**100%** is the owner problem fully solved against RepairPal + Carfax + a scan tool + Motor/TecDoc + a native waiting-room app + a trust institution. It is not a landing page. It is not “we skip Carfax.” Uniqueness at 100% is **the only advocate that also bought the pipes** — not a RepairPal clone.

---

## Money and time (order of magnitude)

| Horizon | What you can actually finish | USD |
| --- | --- | ---: |
| Phase 0 (this week) | Session persistence, last-two quotes, request-access cards, honest VIN-campaign probe | Engineering time only |
| 12 months | ~70–85% if BD closes Motor + TecDoc + Chrome + plate + Places/Yelp; native started | **$0.9M–$1.8M** |
| 18–30 months | All eight axes at 100%, including Carfax-class file *if they sell*, escrow/MTL partner, iOS BLE | **$1.8M–$3.5M** cumulative |

**Cannot ship without a signed contract and money:** Chrome Data, Motor / Mitchell / ALLDATA hours, TecDoc SKUs, Carfax/AutoCheck/NMVTIS commercial file, VIN-true open/closed (NHTSA partnership or licensed bulk VIN), live Places/Yelp at scale, eBay Browse secret, Cox/KBB residual, Stripe live + escrow/MTL, insurance FNOL, dealer DMS (if we ever ask), App Store native + BLE.

**Can code now:** session, IA, a11y, PWA polish, DTC book growth, request-access cards, OpenAI vision as paid OCR, SaferCar Y/M/M + VIN link-out, OSM directory, ZIP bands, last-two quotes.

Stripe **test** hold is not escrow. Stripe **live** is still not escrow. True hold of customer funds is a money-transmitter or a licensed escrow partner. Counsel signs before `sk_live_` is accepted.

Dealer DMS 100% as **advocate**: we never write the RO. Visit packet + OEM scheduler outbound. A CDK/Reynolds partner program is optional and often refused. Becoming a shop OS drops uniqueness.

---

## Identification — 62% → 100%

**100% in owner terms.** This exact car: VIN or plate, factory options, and whether *this* VIN still has an open recall.

**Why not higher.** vPIC is real. Plate rides as a note unless `CARSXE_API_KEY` or `MARKETCHECK_API_KEY` is on (`src/lib/history/plate.ts`). Chrome Data is a catalog stub. SaferCar VIN open/closed is a link (`nhtsa.gov/recalls?vin=`). Public `recallsByVin` is 403. Session used to die with the tab (Phase 0 now persists `openhood.vehicle` in localStorage). Tesseract on a stamped VIN is luck.

**Bill of materials**

| Item | Vendor / product | Contract | Typical sales path | USD / time |
| --- | --- | --- | --- | --- |
| VIN decode | NHTSA vPIC (have) | None | Already live | $0 |
| Build / options | Chrome Data / J.D. Power | Enterprise license + usage audit | jdpower.com/business → AE → 3–6 mo | $15k–$80k/yr + per-VIN |
| Plate-to-VIN | CarsXE and/or MarketCheck | API + state DPPA addendum | Self-serve key, then compliance review | $50–$2k/mo + $0.10–$0.50/call |
| VIN open/closed | NHTSA SaferCar VIN tool; bulk via licensed fleet/insurance vendor | NHTSA will not sell open REST; commercial bulk exists | Request NHTSA data partnership **or** buy a fleet VIN-recall API | $0 link-out; $10k–$60k/yr if a vendor sells bulk |
| Title brands (optional) | VinAudit or other NMVTIS-approved provider | Per-report + commercial ToS | vinaudit.com/api | $0.50–$2/VIN |
| Photo VIN | OpenAI vision (have hook) or Google Document AI | Usage | Platform key | cents / photo |

**Code.** `src/lib/nhtsa.ts` (vPIC + Y/M/M + `fetchVinCampaignLookup`), `src/lib/history/plate.ts`, `POST /api/history/plate`, `GET /api/integrations/nhtsa?kind=vin-campaign`, `src/lib/chrome-data.ts` honesty stub (`connected: false` — never fake a window sticker; live fetch **after** contract). Env: `CHROME_DATA_KEY`, `CARSXE_API_KEY`, `MARKETCHECK_API_KEY`, `VINAUDIT_API_KEY`. Tests: Honda demo `1HGCM82633A004352` still 5W-20; plate without key stays a note.

**Ladder.** 50 → **60** session + VIN-campaign honesty + plate env cards. → **80** live plate-to-VIN + Chrome style IDs. → **100** Chrome build sheet + VIN-true open/closed + optional NMVTIS snapshot we actually fetched.

**Risks.** Publishing Chrome options we did not license. Scraping SaferCar. Plate decode in banned states.

**Depends on.** Trust (DPPA / ToS). Data depth (history file is a different axis).

---

## Quote defense — 64% → 100%

**100% in owner terms.** This printed line is fair or it is not — licensed hours, ZIP-real parts, the photo of *this* RO.

**Why not higher.** `src/lib/quote.ts` ~12 regexes. `/estimate` is 5 ZIP regions × 12 typical-hour jobs (`src/lib/labor`, `src/data/labor-zip-bands.json`, `src/data/job-catalog.json`). Not Motor. Not TecDoc. Tesseract is a lottery; OpenAI vision is optional.

**Bill of materials**

| Item | Vendor | Contract | Sales path | USD / time |
| --- | --- | --- | --- | --- |
| Book time | MOTOR / Identifix (Hearst) **or** Mitchell ProDemand **or** ALLDATA | Enterprise data license (shop login is not a republish right) | motor.com / mitchell.com / alldata.com → AE, 3–9 mo | $25k–$150k/yr |
| VIN SKUs | TecDoc / TecAlliance | Catalog license by region | tecalliance.net contact | €10k–€80k/yr |
| ZIP-real parts $ | PartsTech / Nexpart / Worldpac | Shop API | partstech.com | $2k–$15k/yr + usage |
| Production OCR | OpenAI vision (hook exists) or Google Document AI / AWS Textract | Usage | Platform | ~$1.50/1k pages or vision tokens |
| Photo pipeline | Already `MediaCapture` + `POST /api/ocr` | — | — | Eng time |

**Code.** New `src/lib/motor.ts`, `src/lib/tecdoc.ts` behind keys. `src/lib/quote.ts` and `src/lib/estimate` consume licensed hours only when `MOTOR_API_KEY` / `MITCHELL_API_KEY` / `TECALLIANCE_KEY` are set; otherwise keep the ZIP band and say so. Never label heuristic hours “factory.” Env listed in [LICENSES.md](LICENSES.md).

**Ladder.** 52 → **60** last-two tickets (Phase 0) + always-on paid OCR. → **80** Motor hours + PartsTech ZIP parts. → **100** Motor/Mitchell + TecDoc VIN SKUs + photo that reads.

**Risks.** Guessing hours and calling them Motor. Uniqueness falls if we become a booking estimator.

**Depends on.** Data depth (same licenses). Identification (VIN-correct SKUs need a real VIN).

---

## UX — 68% → 100%

**100% in owner terms.** Three moves on a phone while angry: identify the car, mark this ticket, leave with a sentence.

**Why not higher.** Night-bay identity is consistent. Stamp board is a lot of desks (`src/config/nav/matrix.ts`). `sessionStorage` died with the tab (Phase 0 → localStorage). How-it-works still uses `dummy`/`genius` data attributes (CSS altitude, not a second site). No guided first-run.

**Bill of materials.** Senior frontend + contractor designer. No license. Optional user-test budget $3k–$8k.

**Code.** `src/components/site-nav.tsx` (collapse stamps), `src/config/nav/ux.ts`, `src/lib/vehicle-session.ts`, `src/lib/bay-storage.ts`, empty/error on each desk, a11y pass. Do not generic-SaaS the bay.

**Ladder.** 56 → **70** session survives + consumer IA (Car / Ticket / Shops). → **85** WCAG AA + onboarding. → **100** 30-second mad-owner path, print/share, empty states that name the next desk.

**Risks.** Shipping a marketplace homepage. Adding accounts before they do work.

**Depends on.** Mobile (the counter is a phone). Uniqueness (voice).

---

## Data depth — 58% → 100%

**100% in owner terms.** Fluids from a factory book, TSBs we are allowed to show, DTC coverage a tech would recognize, a history file we paid for, a reliability method we can defend.

**Why not higher.** 216 JSON fluids rows + 90 SKU cross-refs + heuristic. Honda demo stays 5W-20. DTC: ~69 + 104 jobs codes. TSB desk is public pattern cards (`src/data/tsb-patterns.json`). History is NHTSA + outbound Carfax. Reliability is complaint counts + a local vote.

**Bill of materials**

| Item | Vendor | Notes | USD |
| --- | --- | --- | ---: |
| Factory fluids | MOTOR / ALLDATA / OEM TIS (Toyota TIS, Ford PTS) | OEM portals often have no API | $5k–$40k/yr |
| TSB legally | Identifix Direct-Hit (Hearst) | Do not pirate dealer PDFs | bundled with Motor or $15k–$80k |
| DTC OEM | Same + our book growth | Book growth is free | — |
| History file | Carfax for Dealers **or** Experian AutoCheck **or** VinAudit/NMVTIS | Carfax sells to dealers/lenders; advocate is a hard sale | $20k–$120k/yr if they sell |
| Reliability method | Write our own (NHTSA ODI + owner log + published rules) | CR does not license bubbles | Eng + research |

**Code.** `src/data/fluids-catalog.json` stays pamphlet until a feed lands. `src/lib/expert/tsb.ts` stays patterns. New clients only after contract. Reliability: publish methodology in `docs/` before scoring it.

**Ladder.** 42 → **55** more DTC + written reliability method. → **75** licensed fluids + legal TSB. → **100** factory books + Identifix + history file we fetched + method we can show a journalist.

**Risks.** Stolen TSB PDFs. Invented accident rows. Heuristic oil on a miss.

**Depends on.** Quote defense (Motor). Identification (VIN). Trust (republication rights).

---

## Integrations — 52% → 100%

**100% in owner terms.** Places and Yelp actually merge. Parts listings we are allowed to show. Partner webhooks. We still do not write the dealer RO.

**Why not higher.** Live: vPIC, SaferCar Y/M/M, EPA, OSM, outbound stores. Jacks coded dark: Places, Yelp, plate. Catalog: TecDoc, Carfax business, Chrome, Motor, eBay Browse secret. Stripe live refused. No DMS.

**Bill of materials**

| Item | Vendor | Path | USD |
| --- | --- | --- | ---: |
| Rooftops | Google Places Nearby (New) + Yelp Fusion | Console keys; already coded | ~$32/1k Nearby after credit; Yelp free then paid |
| Listings | eBay Browse OAuth | developer.ebay.com | $0 + secret |
| Value feed | Cox / KBB | Enterprise | $10k–$50k/yr |
| DMS | CDK / Reynolds / Tekion | **Decision: never write the RO.** Optional appointment read-only if offered | $50k–$250k and often no |
| Webhooks | Our `POST /api/integrations/hooks` | Eng | — |

**Code.** `src/lib/directory/places.ts` (live when keys on). `src/lib/integrations/catalog.ts`. New eBay client only with `EBAY_CLIENT_ID` + `EBAY_CLIENT_SECRET`. DMS: do not add a “write RO” button.

**Ladder.** 44 → **55** Places + Yelp keys on + plate env cards (Phase 0). → **75** eBay Browse + webhooks. → **100** those plus advocate DMS definition held + optional KBB fetch.

**Risks.** Fake “in stock.” Becoming RepairPal’s shop network.

**Depends on.** Trust (API ToS). Quote (TecDoc is also quote).

---

## Trust — 54% → 100%

**100% in owner terms.** A bonded number, a hold that is real money under law, a claim path a carrier recognizes, SOC2/privacy, no demo-hold theater.

**Why not higher.** Honesty is high. Institution is near zero. `/trust` hold is demo unless `sk_test_`. `sk_live_` refused. Directory demo fallback can show 90210 rooftops. No users, no bond, no SOC2.

**Bill of materials**

| Item | What you buy | USD |
| --- | --- | ---: |
| Surety / bonded estimates | Bond + premium | $5k–$25k + annual |
| E&O + cyber | Policies | $5k–$25k/yr |
| Stripe live | Standard Stripe; Connect if shops are involved | fees |
| True escrow / hold | Licensed escrow partner **or** money-transmitter license (most US states) | $50k–$200k legal + $25k–$100k/yr |
| Insurance FNOL | CCC / Mitchell Claim / Verisk partnership | $25k–$100k, 6–12 mo |
| SOC2 Type I→II | Auditor + counsel | $20k–$80k year 1 |
| Privacy | CCPA/state ToS, DPA | $10k–$40k |
| Fix demo ZIP | Eng — do not show the wrong city | Phase 1 |

**Code.** `src/lib/trust/hold.ts` — keep refusing `sk_live_` until legal writes ToS. New escrow client only with a partner. No fake Pay.

**Ladder.** 40 → **55** ToS + privacy + kill wrong-city demo as default. → **75** bond + Stripe live authorized hold + SOC2 kickoff. → **100** escrow/MTL partner + FNOL API or written carrier partnership + SOC2.

**Risks.** Demo hold that looks like a deposit. Money-transmitter violation.

**Depends on.** Quote (a bonded number needs licensed hours). Legal sign-off.

---

## Mobile — 46% → 100%

**100% in owner terms.** Home-screen bay in the waiting room, camera, iOS Bluetooth dongle, enough offline to keep the last car and last script.

**Why not higher.** Responsive Next app. PWA **is** wired (`PwaBoot`, `manifest: "/manifest.webmanifest"`, `public/sw.js`, `/offline`). BLE ELM327 on Chrome/Android only (`/scan`). Safari has no Web Bluetooth. Desktop scan is demo PIDs. Offline page does not cache Identify/Quote.

**Bill of materials**

| Item | Notes | USD |
| --- | --- | ---: |
| PWA polish | Cache last vehicle + last script; already registered | Eng |
| Native iOS + Android | Expo or React Native, shared TS where possible | 4–8 mo, 1–2 engineers |
| Apple Developer / Play | $99/yr + $25 | — |
| BLE | `react-native-ble-plx` / CoreBluetooth; ELM327 | Hardware $20 dongle (user’s) |
| Offline | SQLite + SW cache of `/`, `/quote`, fluids pamphlet | Eng |
| Camera | Native capture → existing compress/OCR path | Eng |

**Code.** Web stays `src/app/*`. Native new repo or `apps/native`. Do not pretend Web Bluetooth works on iPhone. Scan desk must keep saying demo on desktop.

**Ladder.** 42 → **50** offline shell for last car/script (PWA already installable). → **75** native camera apps in stores. → **100** iOS BLE + freeze-frame Mode 02 + offline bay.

**Risks.** Calling a website an App Store app. Shipping iOS BLE that does not pair.

**Depends on.** UX. Identification (camera VIN). Quote (photo RO).

---

## Uniqueness — 86% → 100%

**100% in owner terms.** Nobody else marks this RO and hands you three lines — **and** the hours/history/scan underneath are as complete as the incumbents.

**Why not higher.** The job is real. The pamphlet is thin. A unique job on a 12-job ZIP book is still a pamphlet.

**Bill of materials.** The other seven axes’ licenses **plus** a written rule: no booking cut, no fake in-stock, no grease-pencil on our own upsell. Designer + founder own the voice ([BRAND.md](BRAND.md)).

**Code.** Do not add “Book this shop and take 8%.” Do add licensed data behind the existing grease-pencil.

**Ladder.** 76 → **80** first licensed pipe (hours) with advocate copy. → **90** Motor + VIN-true recalls, still no marketplace. → **100** undisputed advocate **with** the pipes.

**Risks.** **Uniqueness falls** if we become RepairPal, YourMechanic, or AutoZone. 100% is not “match their homepage.”

**Depends on.** Every other axis. If quote/data stay heuristic, uniqueness cannot hit 100.

---

## Sequence (what to buy first)

1. **Counsel + ToS** (blocks live Stripe, plate DPPA, republication).
2. **Places + Yelp keys** (this month, coded).
3. **CarsXE or MarketCheck** (plate; coded).
4. **MOTOR or Mitchell** (quote 100% is impossible without hours).
5. **TecAlliance** (VIN SKUs).
6. **Chrome Data** (options).
7. **VinAudit / AutoCheck** while Carfax BD runs (Carfax may never sell to an advocate).
8. **NHTSA VIN bulk or fleet vendor** (open/closed).
9. **Native** once the web bay’s three-button IA exists.
10. **Escrow/MTL + FNOL** last — money and insurance are year-2 institutions.

Overall is **61%** in [RATING.md](RATING.md) from the unlicensed +10 wave. It stays in the 60s until those pipes are live and the UI says so. 100% still requires the contracts above.
