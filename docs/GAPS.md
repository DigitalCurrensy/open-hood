# Gap ledger — Open Hood

Dated **27 August 2026**. Product: **Open Hood**. This is the founder ops packet for every remaining hole — not a score bump.

**Honda lock (do not regress):** `1HGCM82633A004352` → **2003 Honda Accord**, displacement **3.0L** (not `3.00`), oil **5W-20**. Door jamb still wins a catalog miss.

You cannot buy Chrome, Motor, Carfax, Consumer Reports, or TecDoc in a coding session. You can send the letter, paste a weekend key, hire counsel, and keep the desk honest. A signed PDF is the only thing that flips a PAPER row to live.

Companion files: [OUTREACH.md](OUTREACH.md) (paste-ready emails) · [ACQUIRE-MVP.md](ACQUIRE-MVP.md) (48-hour run) · [RATING.md](RATING.md) (honest scores) · [LICENSES.md](LICENSES.md) · [AXIS-100.md](AXIS-100.md) · [EXECUTION-BOARD.md](EXECUTION-BOARD.md) · [ROADMAP.md](../ROADMAP.md).

---

## Honest score rule (vs the 105% ask)

**105% is not a score.** It is a founder wish. Code cannot mint a factory book, a Carfax file, a CR bubble, or an App Store listing. [RATING.md](RATING.md) stays the unweighted mean of eight axes, floored. Today that mean is **61**. Company overlay stays **35** until someone outside this repo uses the bay.

| Claim | Rule |
| --- | --- |
| Product 100 on any axis | Signed contract **and** live fetch **and** the desk names the vendor. Env paste alone is not 100. |
| Product 105 | Does not exist. Do not write it. |
| Company 100 | Users, revenue, counsel letter, at least one licensed feed. Not a thicker pamphlet. |
| `configured: true` | Key actually present **and** the jack is allowed to go live. Chrome / Motor / TecDoc / VinAudit stay `false` until the contract is filed. |
| +10 this week | Only if acquire happened **and** the live path is coded **and** the hard-no wall held. |

Status key used below: **PAPER** = contract or money. **WEEKEND** = key you can buy in 48 hours. **CODE** = can ship without a license. **CLOSED** = already true; do not regress. **REFUSE** = filling it would kill the product.

---

## A. Why not 100 — PAPER / contracts

These thirteen items are why no axis is 100 and why the mean cannot be 105. Each row is gap → founder process → fix → done → hard no.

### A1. Plate-to-VIN — Identification — BIG — PAPER + WEEKEND

**Today.** Adapter lives in `src/lib/history/plate.ts`. `GET /api/history/plate` and `GET /api/integrations/plate` stay dark until a key is on **and** the desk has a DPPA / permissible-purpose checkbox. A vendor VIN then POSTs `/api/identify` like a typed 17. Without a key, plate + state + miles are a **note** plus a state-format stamp. We do not invent a VIN.

**Gap.** No `CARSXE_API_KEY` or `MARKETCHECK_API_KEY` on this bay. Counsel has not signed the plate ToS.

**Founder process (exceptional).**

1. Pick **one** decoder. CarsXE first (`https://api.carsxe.com`). MarketCheck (`https://www.marketcheck.com`) is the backup, not a second live vendor.
2. Create a legal entity account. Read the DPPA addendum before you paste anything. Permissible purpose for an owner looking up **their** plate is the lane we will claim. Fleet skip-trace is not.
3. Send the CarsXE / MarketCheck packet in [OUTREACH.md](OUTREACH.md) if the self-serve form stalls. Ask for commercial plate-to-VIN, US only, republication = show the VIN on our desk, not resell the file.
4. Hire counsel (contractor, [TEAM.md](TEAM.md)). Written yes/no: may we decode in production? Banned states? Retention? The checkbox on the desk is an **acknowledgment**, not that letter.
5. Paste **one** key into `.env.local`. Never commit it. Do not paste both and “see which works.”
6. On `/history` or `/sticker` plate desk: type a real plate + state, check DPPA, decode. Confirm `connected: true`, `inventedVin: false`, VIN binds into the identity packet, Honda demo VIN still **3.0L / 5W-20**.
7. Update [LICENSES.md](LICENSES.md) CarsXE or MarketCheck from Env (coded, dark) → **Live**. Scorekeeper may move Identification toward **75**, not 100. Chrome and VIN-true recalls are still paper.

**Fix.** Buy the decoder. Paste the key. Check DPPA on the desk. Decode a real plate → session VIN.

**Done.** `connected: true`, `inventedVin: false`, VIN on the car, Honda demo still 3.0L. Without a key the desk still says **note**, not “lookup failed, here’s a guess.”

**Hard no.** Invent a VIN on a miss. Default-on without counsel. Scrape a DMV. Run both vendors in production.

**100 on this slice.** Live plate + Chrome build sheet + VIN-true open/closed. Plate alone is not Identification 100.

---

### A2. VIN-true open/closed recalls — Identification — BIG — PAPER

**Today.** SaferCar **year/make/model** campaigns, grouped, plus a SaferCar VIN href (`nhtsa.gov/recalls?vin=`). Public `api.nhtsa.gov/recalls/recallsByVin` is **403**. The identification packet already stamps “Y/M/M is weaker than this VIN.” Probe may report 403 — that is a pass.

**Gap.** We do not have NHTSA’s per-VIN close-out file. NHTSA will not sell open REST.

**Founder process.**

1. Do **not** scrape SaferCar HTML. If an engineer proposes a parser, stop the merge.
2. Two doors, in order:
   - **NHTSA data partnership / fleet vendor** — ask for commercial VIN campaign status. Start at SaferCar partnership contacts and licensed fleet/insurance VIN-recall APIs ($10k–$60k/yr band in [AXIS-100.md](AXIS-100.md)).
   - **Same plate vendor** if CarsXE (or a fleet API) sells a VIN-recall/campaign endpoint. Stamp it **vendor file · not NHTSA public 403**. SaferCar stays the government close-out.
3. Send the NHTSA / vendor paragraph in [OUTREACH.md](OUTREACH.md) (CarsXE packet includes the optional campaign ask). Chrome email does not cover this.
4. When a file lands: counsel reads republication. Engineering fetches only behind the key. Empty / 403 stays a SaferCar link. Honda Y/M/M rows must not become “open on this VIN” without the file.

**Fix.** Licensed VIN-recall/campaign endpoint when keyed, stamped vendor-not-NHTSA. SaferCar remains the official close-out.

**Done.** Open vs closed on **this** VIN from a licensed file, plus the SaferCar link. Public 403 still documented.

**Hard no.** Scrape `nhtsa.gov` HTML. Relabel Y/M/M as VIN-true. Hide the 403.

**100 on this slice.** This row + Chrome. Identification 100 requires both.

---

### A3. Chrome Data / Monroney — Identification — BIG — PAPER

**Today.** `src/lib/chrome-data.ts` is `{connected:false}`. Ledger on `/sticker`: vPIC fields vs MSRP, packages, styleId, destination, RPO. Stamp says not Chrome, not a Monroney. `CHROME_DATA_KEY` in env does **not** flip `configured: true`. `GET /api/integrations/chrome` stays disconnected.

**Gap.** No J.D. Power Chrome Data contract. vPIC is not a window sticker.

**Founder process.**

1. Send the J.D. Power Chrome letter in [OUTREACH.md](OUTREACH.md) this weekend. Door: `https://www.jdpower.com/business/automotive/chrome-data`. Ask for an AE, NDA, and a quote for consumer-advocate republication (style IDs + packages + destination on `/sticker`).
2. Budget band: **$15k–$80k/yr + per-VIN** ([AXIS-100.md](AXIS-100.md)). This is not a weekend key.
3. Counsel reads the audit clause before anyone writes a client. Chrome licenses often forbid printing a Monroney lookalike.
4. After signature: replace the stub with a live fetch behind `CHROME_DATA_KEY`. Desk names J.D. Power. Honda demo still 3.0L from **vPIC**, not a guessed MSRP.
5. Until then: do not add `src/lib/chrome-data.ts` live fetch. A key in `.env` without a PDF is still `{connected:false}`.

**Fix.** Email J.D. Power. When licensed, live style IDs. Until then the ledger stays honest.

**Done.** Real MSRP / packages / styleId for the VIN, vendor named. Stub gone only after the contract is filed.

**Hard no.** Fake window-sticker prices. Print a Monroney we did not buy. `configured: true` on a lonely env var.

**100 on this slice.** Chrome live + VIN-true recalls + plate on by default.

---

### A4. Motor / Mitchell / ALLDATA hours — Quote — BIG — PAPER

**Today.** Typical-hour job book + regex price book + packed-LOF flags + ZIP indie vs dealer bands. Every line is stamped **typical / regional — not Motor**. `GET /api/integrations/motor` returns `{configured:false, hours:[]}`. Do not add a live `motor.ts` until Hearst or Mitchell signs.

**Gap.** Licensed labor. A ZIP band is not a factory guide.

**Founder process.**

1. Send **Motor first** (Hearst / Identifix) using the [OUTREACH.md](OUTREACH.md) Motor letter. Door: `https://www.motor.com`. Ask for a **data license we may republish as hours on an owner desk**, not a shop-login PDF.
2. Same week, send Mitchell / ProDemand as the alternate (`https://www.mitchell.com/contact-us`). One live book later — not both.
3. ALLDATA is a third door if both say no. Shop subscription ≠ republish right.
4. Budget: **$25k–$150k/yr**, 3–9 months AE. Not 48 hours.
5. Counsel: may we print the hour next to the owner’s RO line? If the license is shop-only, walk.
6. After signature: adapter swaps our book for licensed hours when `MOTOR_API_KEY` or `MITCHELL_API_KEY` is on. Dark lane stays our typical book. Line shows vendor + catalog ID.
7. Update LICENSES.md. Scorekeeper may move Quote toward **85**, not 100. TecDoc SKUs are still paper.

**Fix.** Contract Motor or Mitchell. Adapter uses licensed hours when the key exists; our book stays the dark lane.

**Done.** Line says Motor (or Mitchell) with a catalog ID. Heuristic hours never wear that badge.

**Hard no.** Relabel heuristics as Motor / Mitchell / ALLDATA / factory. Guess hours. Become a booking estimator.

**100 on this slice.** Motor or Mitchell **plus** TecDoc VIN SKUs **plus** a photo that reads (vision key). Hours alone are not Quote 100.

---

### A5. Vision key off — Quote — BIG — WEEKEND

**Today.** `OPENAI_API_KEY` → vision path, `usedCloud: true`. Off → Tesseract lottery that still parses `$`. Desk stamps which. Paste path is always keyless.

**Gap.** No OpenAI key on this machine (or the prod host). The path is coded.

**Founder process.**

1. Open `https://platform.openai.com`. Create a project key. Billing on. Usage cap you can live with.
2. Paste `OPENAI_API_KEY` into `.env.local` / Vercel. Never commit.
3. Photograph a real RO (cabin-filter markup on a Honda is the demo). Confirm line items hit the quote engine and the desk says vision, not lottery.
4. Cold check: unset the key in a branch — stamp must return to Tesseract lottery. Do not spend a week tuning OCR.
5. This is a **weekend buy**. It does not wait on Motor. Quote can leave 64 toward the mid-60s/70s with vision **and** still not be Motor.

**Fix.** Paste `OPENAI_API_KEY`. Photograph an RO. Confirm flags + three-line script.

**Done.** Camera is the primary reader; Tesseract is fallback. Honda ZIP 90210 cabin markup still flags.

**Hard no.** Pretend Tesseract is vision. Hide a missing key.

**100 on this slice.** Vision is necessary and not sufficient. Licensed hours + VIN SKUs remain.

---

### A6. Not Carfax — Data — BIG — PAPER

**Today.** `/history` is NHTSA identity + Y/M/M campaigns + complaints + NCAP + owner log. Title bay stamped **Not a Carfax file**. Consumer Carfax / AutoCheck / NMVTIS / NICB are **purchase URLs**. VinAudit / CarsXE history only if a **contracted** key is on.

**Gap.** No Carfax business XML. No NMVTIS snapshot we paid for.

**Founder process.**

1. Send the Carfax-for-Dealers letter in [OUTREACH.md](OUTREACH.md). Door: `https://www.carfaxfordealers.com`. First sentence: we are an **owner advocate**, we do not sell dealer leads, we will not scrape consumer HTML. Ask if they sell a business file to that job. Expect **no**. That is still a done outreach.
2. Same day, send VinAudit (`https://www.vinaudit.com/api`). They sell title/salvage snapshots to more than dealers. This is the realistic +10 ([ACQUIRE-MVP.md](ACQUIRE-MVP.md) Data).
3. Optional: NMVTIS-approved provider list at `vehiclehistory.bja.ojp.gov`. Same rule — paid snapshot, named vendor.
4. Counsel: republication of brands (salvage, flood, lemon) on an owner desk.
5. After a contracted key: show that snapshot, stamp the vendor, keep consumer Carfax as a link-out. `VINAUDIT_API_KEY` without a contract stays `configured: false`.
6. Carfax “yes” is Data toward **95**. VinAudit-only is the honest +10. CR is a different row.

**Fix.** Contract Carfax **or** VinAudit. Live snapshot when keyed; source named. Consumer portals stay link-outs.

**Done.** Branded history file on this VIN, source named. Without a contract the axis **stays in the 50s** — more NHTSA rows are not Carfax.

**Hard no.** Invent accidents, titles, or odometer. Scrape consumer Carfax / AutoCheck HTML. Call NHTSA a Carfax file.

**100 on this slice.** History file we fetched + factory fluids + legal TSB. NHTSA jacket is not 100.

---

### A7. Not Consumer Reports — Data — BIG — PAPER (likely never)

**Today.** `/reliability` + [RELIABILITY.md](RELIABILITY.md): NHTSA ODI counts by component, pace = filings ÷ years, local votes on this browser. Copy says complaint counts, **not** Consumer Reports. No bubbles.

**Gap.** CR is a subscriber survey magazine. They do not sell weekend bubbles. They may never license the chart.

**Founder process.**

1. Send the CR licensing letter in [OUTREACH.md](OUTREACH.md). Ask once, in writing: do you license reliability marks to a consumer-advocate web bay that will not become a shop network? If **no** or no reply in 30 days, mark LICENSES.md **refused / no sale** and stop asking.
2. Do **not** email CR asking to clone the magazine. Do not scrape bubbles.
3. Stay exceptional at NHTSA: component maps → playbooks, published method, Honda Accord POWER TRAIN example stays a count, not a score.
4. A CR license (slow, expensive, often no) is the only way this desk may look like CR. Until then the desk must **never** look like CR.

**Fix.** CR license **or** a desk that never looks like CR. The second path is the default and is already the product.

**Done.** Either a CR license on the desk, or the current method with no bubble theater. Both are honest. Only the first moves the CR-shaped gap.

**Hard no.** CR-shaped scores from complaint counts. Scraped bubbles. “CR-equivalent.”

**100 on this slice.** Factory books + Identifix TSB + history file + a method you can show a journalist. CR is optional if they sell; NHTSA method is required either way.

---

### A8. Licensed catalog empty — Integrations — BIG — PAPER

**Today.** Integrations bay groups live / outbound / dark / refused. TecDoc / MOTOR / PartsTech SKU racks are **empty** (`skus:[]`). OSM is the shop map. Storefront search URLs are live. `configured: true` only with a wired key that is allowed to go live.

**Gap.** No TecDoc VIN SKUs. No PartsTech ZIP-real shop parts $. No dealer DMS (and we will not write the RO).

**Founder process.**

1. Send TecAlliance (`https://www.tecalliance.net/en/contact`) — VIN-linked interchange by region. Env hook: `TECALLIANCE_KEY`.
2. Send PartsTech (`https://www.partstech.com/contact`) — shop book dollars, not a RockAuto search URL. Env: `PARTSTECH_API_KEY`.
3. Do **not** email CDK / Reynolds / Tekion asking to write the RO. If they offer read-only appointments, optional. We still send the owner to the OEM scheduler.
4. Budget: TecDoc €10k–€80k/yr; PartsTech $2k–$15k/yr + usage.
5. Until signed: empty bay. Request-access cards. No dummy SKUs. OSM stays the map.
6. After signed: live SKUs, vendor named, still **not** “in stock.”

**Fix.** Contract. Empty bay until then.

**Done.** Real SKUs from the licensed feed, not dummy inventory. Hours still need Motor (A4).

**Hard no.** Fake parts. Fake interchange. Scrape RockAuto. `configured: true` without a key.

**100 on this slice.** Places/Yelp keys on + eBay Browse + empty licensed racks filled + advocate DMS definition held (never write the RO).

---

### A9. Stripe live / escrow — Integrations + Trust — BIG — REFUSE (escrow) / WEEKEND (test)

**Today.** `STRIPE_SECRET_KEY=sk_test_…` may mean a **test** hold / packet on `/trust`. Says test. Never captured as a shop deposit. `sk_live_` is detected and **refused** (`configured: false`, `checkout: false`, escrow refused). No marketplace payouts.

**Gap.** Founder may want live payments. Live charges need counsel. True escrow needs an MTL or a licensed escrow partner — year-2 money.

**Founder process.**

1. This weekend: Stripe Dashboard → **test** key only. Paste `sk_test_`. Complete one test payment if a packet SKU exists. Stamp must say **test**.
2. Send nothing to escrow.com this weekend. Do not open Connect for shops.
3. Counsel memo (same letter as plate): Stripe live = **not yet**. Escrow / MTL = **no**. Packet fee later = maybe, after ToS.
4. If you ever accept `sk_live_`: packet fee for **our** print/hold-this-bay product only. Never hold repair funds. Never take a shop cut.
5. Update `/trust` only after the memo is dated. No hologram “bonded” badge.

**Fix.** `sk_test_` for test. Live only for a packet fee, never hold-repair-funds.

**Done.** Test checkout works; escrow still off. `sk_live_` cannot look configured.

**Hard no.** Escrow theater. Shop cuts. YourMechanic economics. Demo hold that looks like a deposit.

**100 on this slice.** Bond + authorized live hold + SOC2 + escrow/MTL partner + FNOL — Trust 100, not Integrations 100. Integrations 100 does not require escrow.

---

### A10. iOS Bluetooth — Mobile — BIG — PAPER (physics)

**Today.** Android Chrome Web Bluetooth ELM327 on `/scan`, `/obd`, `/mechanic-mode`. Live Mode 01 PIDs + Mode 03 codes. Safari: **type the code**. Desktop: **demo PIDs** and says so. [NATIVE.md](NATIVE.md) is the TestFlight path. `apps/native` is documentation / scaffold — not a listing.

**Gap.** iOS has no Web Bluetooth. Core Bluetooth needs a native binary.

**Founder process.**

1. Enroll Apple Developer Program — packet in [OUTREACH.md](OUTREACH.md) ($99/yr). This is an account, not a store listing.
2. Buy one ELM327 puck + keep an Android Chrome phone as the **live** waiting-room path this quarter.
3. Hire-4 / contractor (month 6+, [TEAM.md](TEAM.md)): Expo in `apps/native` only. `react-native-ble-plx`. Same Next APIs. Root `tsconfig` already excludes `apps/`.
4. Internal TestFlight: parked puck, Mode 03, type-to-quote. iOS Safari copy stays “no Web Bluetooth.”
5. Do not put a store badge on the website.

**Fix.** Apple Developer + native BLE + TestFlight. Same API as the bay.

**Done.** iPhone reads DTCs over BLE in a **TestFlight or store binary**. Safari still cannot.

**Hard no.** Claim BLE works in Safari. Fake a paired puck on iPhone web.

**100 on this slice.** iOS BLE + freeze-frame Mode 02 + offline bay + store listing. TestFlight alone is not Mobile 100.

---

### A11. Store app — Mobile — BIG — PAPER

**Today.** PWA: `public/sw.js` 200, `standalone` manifest, apple-touch icons, pin-this-site copy. Not App Store. Not Play.

**Gap.** Listing, review, signed binaries.

**Founder process.**

1. Apple packet (A10) + Google Play Console ($25) when native exists.
2. TestFlight internal → App Store review. Play internal track → production.
3. Privacy nutrition, Bluetooth usage strings, no “we book shops.”
4. PWA stays the web MVP. Pin copy never becomes “GET it on the App Store” until a public URL exists.
5. Score can leave **46 toward 56** on a real store URL. Not 100. iOS BLE is the rest.

**Fix.** TestFlight → App Store / Play. PWA stays.

**Done.** Real public store URL on the bay. Binary exists.

**Hard no.** “Available on the App Store” before it is. Store badge on a website.

---

### A12. Social proof — Trust — BIG — by design (do not mint)

**Today.** `users: 0`, `reviews: 0`. Ticket counts from local gitignored jsonl (zero is a real number). No counsel stamp. Awaiting outside review.

**Gap.** No consented names. No users in this repo.

**Founder process.**

1. `/contact`: name + phone or email + consent. Add **consent to be named** if the desk does not already collect it. Do not sell the RO.
2. This month: ten owners or shops you actually sat with. They tick consent. Quotes on `/trust` **only** from those rows. Empty list if zero.
3. Hire outside counsel to read `/terms` and `/privacy`. Dated letter. Not a hologram. Checkbox ≠ lawyer.
4. Do not buy testimonials, review widgets, or a bond number you did not file.
5. Company score may leave 35 when those ten exist. Trust axis may leave 54 toward the 60s. It does not become 100.

**Fix.** Consented names on `/contact`. First 10. Counsel letter dated.

**Done.** N named, consented quotes. Counsel memo dated. User count is a real N, not a rounded marketing number.

**Hard no.** Minted testimonials. Invented users. “0 reviews” theater. Counsel badge without a signature.

---

### A13. Cart would kill uniqueness — Uniqueness — BIG — REFUSE

**Today.** Identify → spec → quote flags → three-line script → OSM shops (no book) → print. Compare-3 ROs. `checkout: false`. We take no cut.

**Gap.** Temptation to add booking, SKU checkout, dispatch, or a lead fee. That is RepairPal / YourMechanic / AutoZone. Filling this “gap” **lowers** uniqueness.

**Founder process.**

1. Do not. Deepen compare-3, scripts, print packet. Licensed pipes (A3–A8) sit **behind** the grease-pencil when they land.
2. If a vendor’s paper requires we dispatch or take a cut, walk.
3. Weekly scoreboard: if a “Book this shop” control appears, uniqueness **falls** and the founder stop-ships ([TEAM.md](TEAM.md)).
4. This row is done when we are still not them.

**Fix.** Do not add a cart. That is the fix.

**Done.** Still not RepairPal / YourMechanic / AutoZone. No book, cart, dispatch, or cut.

**Hard no.** Book-a-shop. Escrow as a marketplace. Pay-the-shop. Fake inventory. Certified-shop network.

**100 on this slice.** The unique job **plus** Motor + VIN-true recalls + history, still no marketplace. 86 is the job on a pamphlet. 100 is the job on the pipes.

---

## B. Weekend keys — code is ready

Paste in 48 hours. `configured: true` only after a real key (and counsel, where the desk says so). Status bay: `/integrations`. Do not wait on Chrome replies to do this list.

| Env | Unlocks | Process | Skip if |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | RO + VIN photo vision | Paste → `/quote` camera → confirm `usedCloud` | You accept Tesseract lottery |
| `CARSXE_API_KEY` **or** `MARKETCHECK_API_KEY` | Plate-to-VIN (+ optional vendor VIN recalls) | One vendor → DPPA check → plate desk → `inventedVin: false` | Counsel has not signed; key stays dark |
| `VINAUDIT_API_KEY` | Title snapshot | Paste **after** commercial account → `/history` still “not Carfax” | No contract; env alone stays `configured: false` |
| `GOOGLE_PLACES_API_KEY` | Nearby overlay | Optional. OSM stays source of truth | Billing scare |
| `YELP_API_KEY` | Phones / addresses | Optional. Same board | Same |
| `YOUTUBE_API_KEY` | Related clips | Optional. Search URLs stay live | — |
| `RESEND_API_KEY` + `CONTACT_TO_EMAIL` | Real contact email | Optional. jsonl always saves | — |
| `STRIPE_SECRET_KEY=sk_test_…` | Test packet / hold | Never `sk_live_` escrow | You were about to paste live |

**Ops in the same 48 hours (not a vendor).** Live tab is **:3000** or production. Kill leftover **:3100**. `scripts/rescue-3100.mjs` or `/?unlock=1`. A dead worker cannot score UX or Mobile.

**Do not buy this weekend (send the letter, then wait):** Chrome, MOTOR, Mitchell, TecAlliance, PartsTech, Carfax, Consumer Reports, NHTSA VIN partnership. Emails: [OUTREACH.md](OUTREACH.md).

---

## C. WAVE leftovers — named, not faked

These were asked in [WAVE-PLUS10.md](WAVE-PLUS10.md). They are code, not licenses. They do **not** buy Identification 100.

### C1. `openhood.firstRun` — MEDIUM — CODE

**Today.** Auto `:3100` → `:3000` rescue exists. First-run tour flag was never written (or is landing with the trust/UX pass). A leftover SW can still paint WI-FI DROPPED if the founder opens the dead tab and skips unlock.

**Gap.** First tab should never be a trapped offline shell.

**Fix.** `localStorage` key `openhood.firstRun`. First visit: hard-nav to the live origin, demo VIN affordance (`1HGCM82633A004352`), garage → quote. Unlock remains one stamp.

**Done.** First session cannot paint WI-FI DROPPED on `/quote`. Honda demo one tap.

**Hard no.** Full-page “Opening bay…”. Cached `/offline` HTML on live desks.

---

### C2. DTC book ~160 / ~206 vs asked 220 / 270 — MEDIUM — CODE

**Today.** Core `src/lib/dtc.ts` ~160. Jobs book ~206. Generic P/B/C/U decoder on a miss. P0420-quality “don’t throw the converter” is the bar.

**Gap.** WAVE asked 220 / 270. Files did not grow that far (unless a later pass landed — count the book, do not invent).

**Fix.** Grow `/jobs/obd` + glossary with say-this scripts. Real SAE titles. Not a dongle app. Not invented diagnoses.

**Done.** Counts meet 220 / 270 **or** the scorekeeper leaves the leftover named. Either is honest.

**Hard no.** Padding with fake TSBs. Calling the book Torque.

---

### C3. SKU cross-ref ~100 vs asked ~140 — MEDIUM — CODE

**Today.** OEM → Fram / Wix / Purolator rows. Finder aisles + `/directory/parts` are **search URLs**.

**Gap.** WAVE asked ~140. Not TecDoc.

**Fix.** More RockAuto / AutoZone / O’Reilly / NAPA **hrefs**. Not inventory counts.

**Done.** ~140 search rows **or** leftover named. Never “in stock.”

**Hard no.** Dummy on-hand qty. Minted interchange.

---

### C4. Fluids heuristic miss — SMALL — CODE

**Today.** Fluids JSON is a large pamphlet (hundreds of Y/M/M rows). Honda demo stays **catalog 5W-20**. A weird trim still falls through to `source: heuristic`. Door jamb wins.

**Gap.** Heuristic will be wrong on a lot of cars.

**Fix.** Add a JSON row for the miss. Stamp **HEURISTIC** until then. Do not label it catalog or Motor.

**Done.** Honda lock holds. New rows are catalog. Misses stay loud.

**Hard no.** Honda miss invents 5W-30. Heuristic labeled `catalog`.

---

## D. Small / polish

| Gap | Size | Today | Fix | Done | Hard no |
| --- | --- | --- | --- | --- | --- |
| Founder still opens :3100 | SMALL (UX) | Auto-bounce + `/?unlock=1` + `scripts/rescue-3100.mjs` | Always `:3000` or production. Do not `next start` on 3100 | Cold phone opens Car → Ticket → Script on the live origin | Claiming UX 68+ from a dead tab |
| Soft nav / Opening bay | SMALL | Thin `BayTicketBar`; `BayLink` hard-nav | Hunt leftover `<Link>` traps that keep a stale shell | No full-page “Opening bay…” on desks we touched | Marketplace homepage |
| Tesseract lottery without OpenAI | SMALL once A5 is on | Lottery stamp + `$` parse | Keep as fallback. Do not spend a week on OCR | Vision primary when keyed | Pretend device OCR is vision |
| Check digit vs Ford/Tesla demo 17s | SMALL | ISO 3779 stamp; fail still decodes WMI | Stamp fail, still identify. Do not block | Honda check-digit path unchanged | Blocking identify on a demo 17 |
| `/vin/:vin` used to 307 | SMALL | Redirect should be gone; packet 200 | Confirm identity packet 200 on the Honda VIN | `/vin/1HGCM82633A004352` serves the packet | Soft 307 loop |
| Counsel / DPPA | SMALL–MEDIUM | Checkbox on plate desk | Hire counsel. Memo dated. Checkbox stays acknowledgment | Letter on `/trust` or linked | Hologram “counsel signed” |
| PWA on iOS | SMALL | Share → Add to Home Screen | Copy says pin / A2HS. [NATIVE.md](NATIVE.md) for TestFlight | Never “app store” | Store badge |
| Compare-3 empty state | SMALL | Three paste boxes + flags | Keep deepening flags. No buy button | Three ROs in, script out | Checkout |
| Directory geocode miss | SMALL | Empty ZIP stays empty; 90210 / 43215 demo only if asked | Do not revive wrong-city default | Miss is a miss | Beverly Hills for a random ZIP |
| Production `sw.js` 404 (old) | **CLOSED** | `public/sw.js` must stay 200 | Never intercept `navigate` / `document` | Precache icons + manifest only | Cached desk HTML |

---

## E. Company 35% — not a product axis

**Today.** No users in this repo. No revenue. No counsel letter. No vendor PDFs signed. Overlay in [RATING.md](RATING.md): live demo ~40, traction **8**, revenue **12**, moat ~38, GTM ~24, technical execution ~52, legal ~42, path-to-100 docs ~68 → **company 35**.

**Gap.** A company score is not a thicker night-bay. It is people, money, and paper.

**Exceptional close (this quarter — still not 105).**

| Move | Why it counts | Does not count as |
| --- | --- | --- |
| **10 consented tickets** | Real owners/shops via `/contact` with consent to be named | Minted reviews |
| **One Stripe test payment** | Proves the test hold path | Escrow, live charges, shop cut |
| **OpenAI + one plate decoder on** | Demo can photograph an RO and (with DPPA) decode a plate | Chrome, Motor, Carfax |
| **Outside privacy read of `/privacy`** | Dated counsel / privacy memo | Hologram badge |
| **TestFlight internal** | Native path started ([NATIVE.md](NATIVE.md)) | App Store listing |
| **Eight vendor emails sent** | PAPER clock starts. Log them on [OUTREACH.md](OUTREACH.md) | “We signed Chrome” |

**Done for a company tick.** Those six exist in the world, not only in markdown. Scorekeeper may move company into the **40s**. Traction stays tiny until N > 10 and someone returns.

**Hard no.** Fake user counts. Fake revenue. Writing 105% on [RATING.md](RATING.md). Claiming a signed feed we do not have.

**Company 100.** Users + revenue + counsel + at least one of Motor / Chrome / TecDoc / history live + uniqueness rule held. Years, not a weekend.

---

## How the founder runs the board

Monday 30 minutes ([TEAM.md](TEAM.md) cadence):

1. Open this file. Mark A–E: PAPER / sent / signed / live / refused.
2. Open `/integrations`. Every licensed jack still dark unless LICENSES.md says **Live**.
3. Honda VIN: **3.0L · 5W-20**. Fail the week if it regresses.
4. Do not edit [RATING.md](RATING.md) from hope. Code + keys + contracts only.

Related: [OUTREACH.md](OUTREACH.md) · [ACQUIRE-MVP.md](ACQUIRE-MVP.md) · [RATING.md](RATING.md) · [NATIVE.md](NATIVE.md) · [LICENSES.md](LICENSES.md) · [ROADMAP.md](../ROADMAP.md).
