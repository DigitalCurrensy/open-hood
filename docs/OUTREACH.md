# Vendor outreach — Open Hood

Dated **27 August 2026**. Product: **Open Hood**. We are a consumer advocate at the service writer’s window. We mark this RO and hand the owner three lines. We do **not** book shops. We do **not** take a cut. We never write the dealer repair order.

This is who to email, the letter to paste, and what we will not scrape. It is not a mail-merge. Do not claim we already have their file. **We have not signed Chrome, Motor, Carfax, Consumer Reports, or TecDoc.**

Companion tables: [LICENSES.md](LICENSES.md), [GAPS.md](GAPS.md), [AXIS-100.md](AXIS-100.md), [EXECUTION-BOARD.md](EXECUTION-BOARD.md), [ACQUIRE-MVP.md](ACQUIRE-MVP.md).

**Honda lock (do not put in a vendor email as if we licensed it):** `1HGCM82633A004352` → 2003 Accord, **3.0L**, **5W-20** from NHTSA vPIC + our fluids pamphlet.

Replace `[NAME]`, `[EMAIL]`, `[ENTITY]`, `[PHONE]`, `[SITE]` (default site `https://openhood.ai`) before you send. Log the send at the bottom.

---

## What to say in the first sentence

Open Hood is a waiting-room advocate for the owner. VIN decode and year/make/model recalls are public (NHTSA). Rooftops are OpenStreetMap. Quote markup is our own regex book plus ZIP labor bands until we license hours. We want a **licensed feed**, republished only as the license allows, behind a request-access card until the key is on.

We will not scrape their HTML, their dealer portal, or their shop login to fake a catalog.

---

## Who to email

| Vendor | Why we are talking | First door | What we want | What we will not do |
| --- | --- | --- | --- | --- |
| **MOTOR / Identifix (Hearst)** | Book time and legal TSB | motor.com contact / Hearst Autos data sales | Labor hours + diagnostics we are allowed to show. Env hook: `MOTOR_API_KEY` | Guess hours and label them Motor. Pirate Identifix PDFs. |
| **Mitchell / ProDemand** | Alternate hours book | mitchell.com/contact-us | Same job if Hearst says no. `MITCHELL_API_KEY` | Call ZIP bands “Mitchell.” |
| **TecAlliance (TecDoc)** | VIN-linked SKUs | tecalliance.net/en/contact | Catalog license by region. `TECALLIANCE_KEY` | Invent interchange. Scrape RockAuto. |
| **PartsTech** | ZIP-real shop parts $ | partstech.com/contact | Shop book dollars. `PARTSTECH_API_KEY` | Fake “in stock.” |
| **J.D. Power Chrome Data** | Build / options / style IDs | jdpower.com/business/automotive/chrome-data | Window-sticker facts on `/sticker`. Live when `CHROME_API_KEY` / JD Power contract. Alias: `CHROME_DATA_KEY`. Adapter stays `{connected:false}` until both land. | Print a Monroney we did not buy. Invent MSRP. |
| **CarsXE** | Plate-to-VIN | api.carsxe.com | Production plate decode after counsel + DPPA. Hook already in `src/lib/history/plate.ts`. `CARSXE_API_KEY` | Turn the plate on without ToS. Scrape a DMV. |
| **MarketCheck** | Plate-to-VIN (listings later) | marketcheck.com | Same plate job as backup. `MARKETCHECK_API_KEY` | Call listings live before we mean to. |
| **Carfax for Dealers** | Accident / title / shop stamps | carfaxfordealers.com | A business file *if they sell to an advocate*. Hard sale. | Scrape consumer Carfax HTML. Invent wrecks. |
| **VinAudit / other NMVTIS** | Title brands we can fetch | vinaudit.com/api | Snapshot we actually paid for. `VINAUDIT_API_KEY` | Fake a Carfax clone. |
| **Consumer Reports** | Subscriber reliability (optional) | consumerreports.org / licensing | Ask once if they license marks. Default is no. | Scrape bubbles. Draw CR-shaped scores from NHTSA counts. |
| **Apple Developer** | Native BLE / TestFlight | developer.apple.com/programs | $99 enrollment. Not a store listing. | “Available on the App Store” before a binary exists. |
| **Google Places + Yelp Fusion** | Denser rooftops | Cloud Console / yelp.com/developers | Billing on keys already coded. OSM stays live without them. | Require those keys. Show a live-looking empty Places board. |
| **Cox / KBB** | Residuals | coxautoinc.com/contact | Fetch later. Today `/value` is illustration + consumer search URLs. | Print a KBB number we did not buy. |
| **eBay Browse** | Live Motors listings | developer.ebay.com | OAuth later. Search URL is live now. | Fake “in stock.” |
| **NHTSA** | VIN-true open/closed | SaferCar partnership / fleet vendor | Public Y/M/M stays. `recallsByVin` is 403. | Scrape SaferCar VIN HTML. |

Do not email CDK / Reynolds / Tekion asking to write the RO. If they offer read-only appointments, that is optional. We still send the owner to the OEM scheduler in another tab.

---

## What we are (copy you can paste)

Open Hood is a consumer-defense web bay. An owner types a VIN or year/make/model, pastes or photographs an estimate, and leaves with a sentence for the counter. We take no booking fee. We do not dispatch a mechanic. We do not sell the shop a lead.

Public pipes we already use, with attribution: NHTSA vPIC, SaferCar year/make/model, EPA FuelEconomy, OpenStreetMap Nominatim and Overpass.

Licensed pipes we do **not** have, and will not pretend to have: Motor / Mitchell hours, TecDoc VIN SKUs, Chrome build sheets, Carfax / AutoCheck XML, plate-to-VIN in production, VIN-true recall close-out.

---

## What we will not scrape

- Carfax, AutoCheck, or NMVTIS consumer HTML
- SaferCar per-VIN campaign pages (link-out only; `recallsByVin` is 403)
- RockAuto stock or interchange
- Dealer DMS, OEM TIS portals, Identifix / ALLDATA shop logins
- Copart / IAA / Manheim lot boards
- Consumer Reports reliability bubbles

If a vendor asks “are you already using our data?” the answer is **no**, unless [LICENSES.md](LICENSES.md) says **Live** for that row.

---

## After they reply

1. Counsel reads the republication clause before anyone merges a client.
2. Engineering adds the env hook and an honest empty state — never a live-looking control.
3. Partnerships updates the status column on [LICENSES.md](LICENSES.md): request → paper → live.
4. The desk says the vendor name only when the key is on and the UI tells the truth.
5. [RATING.md](RATING.md) moves only after the live path works. Do not write 105%.

Plate-to-VIN and Stripe live stay off until [WP-12](EXECUTION-BOARD.md) counsel signs the ToS we already printed.

---

## Chrome / J.D. Power — email draft

**To:** J.D. Power Chrome Data business development (door: [jdpower.com/business/automotive/chrome-data](https://www.jdpower.com/business/automotive/chrome-data))

**Subject:** Open Hood — licensed Chrome Data for a consumer decoder sticker (no scrape)

Hi —

Open Hood is a waiting-room advocate at the service writer’s window. An owner stamps a VIN; we print what NHTSA vPIC actually decoded. We do **not** print MSRP, packages, destination, or RPO codes. Those are Chrome / J.D. Power facts. Our `/sticker` ledger stays `{connected:false}` until a signed contract and `CHROME_API_KEY` are both on.

We want a licensed feed we are allowed to republish on that desk. We will not scrape a Monroney PDF, a dealer portal, or a build-sheet HTML page to fake a catalog.

What we will show if you sell us the file: style ID, packages, destination, RPO — stamped as Chrome, never as vPIC.

What we will not do: invent an MSRP. Call a decoder sheet a window sticker.

Thank you,
Open Hood

---

## Email packets

Send these this weekend. One thread per vendor. BCC yourself. Do not attach a pitch deck. Do not say we signed anyone else.

### 1. J.D. Power — Chrome Data

**Door:** https://www.jdpower.com/business/automotive/chrome-data  
**Hook after contract:** `CHROME_DATA_KEY` — a key in env does **not** go live until the PDF is filed.  
**Gap:** [GAPS.md](GAPS.md) A3.

**Subject:** Chrome Data license — consumer-advocate VIN sticker (not a dealer configurator)

```
Hello Chrome Data / J.D. Power business team —

I’m [NAME], founder of Open Hood ([SITE]). We are a waiting-room advocate for the vehicle owner. We decode a VIN on NHTSA vPIC, mark the printed repair order, and hand the owner three lines for the service writer. We do not book shops. We do not take a cut. We do not write the dealer RO.

We want a licensed Chrome Data feed so /sticker can show style IDs, packages, destination, and MSRP that are actually on the build — not a guessed window sticker. Today that desk prints every non-empty vPIC field and says, in writing, that it is not Chrome and not a Monroney. We will keep saying that until you sell us the file.

What we are asking:
- A conversation with an AE about a commercial catalog license for a consumer web bay.
- Republication limited to the identified vehicle on our desk (VIN the owner typed).
- Usage audit terms we can live with. We will not print a fake Monroney.

What we will not do:
- Scrape Chrome, OEM configurators, or dealer windows.
- Invent MSRP or RPO codes.
- Call vPIC a build sheet.

Public pipes we already use: NHTSA vPIC, SaferCar year/make/model, EPA FuelEconomy, OpenStreetMap. We do not have Motor, TecDoc, or Carfax. We are not pretending otherwise.

If you do not sell to an advocate that is not a dealer or OEM, please say no. We will leave the ledger dark.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 2. MOTOR / Identifix (Hearst)

**Door:** https://www.motor.com — Hearst Autos data sales if the site routes you there.  
**Hook after contract:** `MOTOR_API_KEY`  
**Gap:** [GAPS.md](GAPS.md) A4.

**Subject:** Data license for owner-facing labor hours — not a shop-login scrape

```
Hello MOTOR / Hearst Autos data team —

I’m [NAME] at Open Hood ([SITE]). Owners paste or photograph a repair order in a waiting room. We flag padded lines and hand them a sentence. We take no booking fee and we do not dispatch work.

Our hours today are a typical independent book plus ZIP labor bands. Every line is labeled typical — not MOTOR, not factory. We want a license to show Motor (or Identifix) book time next to the line they printed, with your catalog ID, when we are allowed to republish.

We are not asking for a shop login we can screenshot. We are asking whether you sell a data feed to a consumer-advocate product.

What we will not do:
- Guess hours and stamp them Motor.
- Pirate Identifix / Direct-Hit PDFs.
- Become a shop network.

If the license is shop-only and forbids owner-facing republication, please say so. We will keep our typical book and keep your name off it.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 3. Mitchell / ProDemand

**Door:** https://www.mitchell.com/contact-us  
**Hook after contract:** `MITCHELL_API_KEY`  
**Gap:** [GAPS.md](GAPS.md) A4. Send the same week as Motor. Buy **one** book later.

**Subject:** ProDemand / labor data for a consumer RO desk — republication question

```
Hello Mitchell data licensing —

I’m [NAME], Open Hood ([SITE]). We mark a customer repair order and tell the owner what to say at the counter. We do not book the shop. We do not take a cut.

We already emailed Hearst/MOTOR as the first hours door. We are writing you as the alternate: a licensed labor/estimating feed we may show on an owner desk, labeled Mitchell, with a catalog ID. Today /estimate is five regional ZIP bands and a typical-hour pamphlet. We will not call that Mitchell.

If you only sell shop estimating seats, we need that in one sentence. We will not scrape ProDemand or relabel our bands.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 4. Carfax business

**Door:** https://www.carfaxfordealers.com  
**Gap:** [GAPS.md](GAPS.md) A6. Hard sale. Sending the letter is the job; a no is an honest close.

**Subject:** Business vehicle-history file for an owner advocate — not a dealer desk

```
Hello Carfax for Dealers / business development —

I’m [NAME] at Open Hood ([SITE]). We help the owner read the repair order in the waiting room. We do not run a dealership. We do not sell leads. We do not book service.

On /history we assemble NHTSA identity, year/make/model campaigns, complaints, and NCAP stars. We deep-link your consumer purchase portal. We do not scrape Carfax HTML. We do not invent accidents, titles, or odometer readings. The desk is stamped “Not a Carfax file.”

Question: do you sell a business/API history file to a consumer-advocate product that will show accident and title brands for the VIN the owner typed, with Carfax named as the source? If the answer is dealer- and lender-only, please write that. We will stay on the consumer link-out and buy an NMVTIS snapshot elsewhere.

We will not republish a scraped report. We will not call NHTSA a Carfax.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 5. Consumer Reports licensing

**Door:** https://www.consumerreports.org — use their licensing / permissions / business contact, not a magazine subscription form.  
**Gap:** [GAPS.md](GAPS.md) A7. Ask **once**. Default is they do not sell bubbles.

**Subject:** Licensing question — reliability marks on a non-shop-network owner desk

```
Hello Consumer Reports permissions / licensing —

I’m [NAME] at Open Hood ([SITE]). We are a consumer-defense bay at the service writer’s window. We do not book shops and we do not take a cut.

Our /reliability desk counts NHTSA SaferCar complaints by year/make/model and publishes the math (filings, pace, a vote that never leaves the phone). The page says this is not a Consumer Reports survey and we do not draw CR-style bubbles. That is intentional.

I am asking once: do you license reliability scores or marks to a small owner-facing web product, with attribution, without requiring us to become a shop network? If you do not license that data, please say no. We will keep the NHTSA method and we will not scrape or imitate your chart.

We are not asking to clone the magazine.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 6. TecAlliance — TecDoc

**Door:** https://www.tecalliance.net/en/contact  
**Hook after contract:** `TECALLIANCE_KEY`  
**Gap:** [GAPS.md](GAPS.md) A8.

**Subject:** TecDoc catalog license — VIN-linked SKUs for an owner parts desk (no fake stock)

```
Hello TecAlliance / TecDoc licensing —

I’m [NAME] at Open Hood ([SITE]). Owners leave our bay with a counter script and, when they want a part, a search URL at RockAuto, AutoZone, O’Reilly, NAPA, Amazon, or eBay Motors. We do not invent interchange. We do not print “in stock.”

We want a regional TecDoc/TecAlliance catalog license so a decoded VIN can show OEM-linked SKUs we are allowed to display. Until that contract exists our parts bay is empty of licensed SKUs and we say so.

What we will not do:
- Scrape RockAuto or dealer catalogs.
- Mint dummy inventory.
- Call a search URL a TecDoc hit.

Please route this to catalog licensing. We can sign an NDA. If you only sell to parts distributors and not to a consumer advocate, write that — we will keep the empty bay.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 7. PartsTech

**Door:** https://www.partstech.com/contact  
**Hook after contract:** `PARTSTECH_API_KEY`  
**Gap:** [GAPS.md](GAPS.md) A8.

**Subject:** Shop parts API — ZIP-real dollars for an owner quote desk (not a marketplace)

```
Hello PartsTech partnerships —

I’m [NAME] at Open Hood ([SITE]). We grease-pencil a repair order. Labor is a typical independent band until we license hours. Parts dollars on our desk are still national-ish catalog guesses plus storefront search URLs.

We want a shop-book API (PartsTech / Nexpart / Worldpac class) so a ZIP can show real distributor pricing we are allowed to display, stamped PartsTech, never “in stock at this roof unless you say that.”

We do not dispatch. We do not take a cut. We will not scrape your dealers.

If you sell only to shops that buy through you, tell us whether an advocate desk is in-bounds. Empty bay until you say yes.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 8. CarsXE

**Door:** https://api.carsxe.com  
**Hook:** `CARSXE_API_KEY` — live plate decode only with key **and** DPPA checkbox. Counsel still required for production.  
**Gap:** [GAPS.md](GAPS.md) A1, optional A2.

**Subject:** Plate-to-VIN API — owner-permissible purpose, no invented VIN

```
Hello CarsXE —

I’m [NAME] at Open Hood ([SITE]). We already wired a plate-to-VIN adapter (CarsXE first, MarketCheck backup). Without a key, a US plate is a note. We do not invent a VIN on a miss.

We want a commercial plate-decoder key for owners looking up their own vehicle in a waiting room, with a permissible-purpose acknowledgment on the desk. We will not turn the key on in production until counsel reads your DPPA / ToS.

Also ask, if you sell it: a VIN recall/campaign endpoint we can stamp “vendor file · not NHTSA public recallsByVin (403).” We will keep the SaferCar VIN link as the government close-out. We will not scrape nhtsa.gov HTML.

We do not need listings for v1. We do not scrape DMVs.

Please send signup, pricing, banned states, and the republication clause.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 9. MarketCheck

**Door:** https://www.marketcheck.com  
**Hook:** `MARKETCHECK_API_KEY` — backup decoder, not a second live vendor.  
**Gap:** [GAPS.md](GAPS.md) A1.

**Subject:** Plate-to-VIN (backup to CarsXE) — listings stay off

```
Hello MarketCheck —

I’m [NAME] at Open Hood ([SITE]). We need one production plate-to-VIN decoder for US plates, owner-permissible purpose, after our counsel reads DPPA. CarsXE is our first door. We want MarketCheck as the contracted backup if they stall or refuse a state.

Our adapter already calls your plate decoder when MARKETCHECK_API_KEY is set and the owner checks permissible purpose. Keys off → plate is a note. We will not invent a VIN. We will not turn listings on until we mean to — this email is plate only.

Please send API access, pricing, and the compliance addendum.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 10. VinAudit

**Door:** https://www.vinaudit.com/api  
**Hook after commercial account:** `VINAUDIT_API_KEY` — env without a contract stays `configured: false`.  
**Gap:** [GAPS.md](GAPS.md) A6.

**Subject:** NMVTIS / title snapshot API — we will name you, we will not call it Carfax

```
Hello VinAudit API —

I’m [NAME] at Open Hood ([SITE]). /history is an NHTSA jacket plus consumer purchase links for Carfax, AutoCheck, and NMVTIS. The title bay is stamped “Not a Carfax file.” We do not scrape those sites. We do not invent salvage or odometer.

We want a commercial title/salvage snapshot we actually pay for, shown on that VIN, with VinAudit named as the source. Consumer Carfax stays a link-out.

Please send API signup, per-VIN pricing, commercial ToS, and what we may republish on an owner desk. If you require a use case: the owner typed the VIN to decide whether the ticket in their hand is the only problem.

[NAME]
[ENTITY]
[EMAIL] · [PHONE]
```

---

### 11. Apple Developer Program

This is enrollment, not a BD email. Do it this weekend if you will ever TestFlight. It does **not** make Mobile 56. It does not put a badge on the bay. Path: [NATIVE.md](NATIVE.md), [GAPS.md](GAPS.md) A10–A11.

**Door:** https://developer.apple.com/programs  
**Cost:** $99/year (individual or organization). Organization needs legal entity + DUNS.

**Founder checklist**

1. Enroll as **[ENTITY]**. If you are still a sole founder, individual is fine; move to organization before a public listing.
2. Bundle id (later): `app.openhood.bay` — do not create a second id for a demo.
3. Account holder email: `[EMAIL]`. Do not use a throwaway you will lose.
4. Enable Bluetooth usage strings when the native app exists: we pair an owner-owned ELM327 to read generic OBD-II. We do not invent a puck.
5. Internal testers only until Mode 03 works on a parked car.
6. App Store **review is later**. Website copy stays “pin this site” / Share → Add to Home Screen.

**Notes for App Review (paste when a binary exists — not now):**

```
Open Hood is a consumer-advocate waiting-room app. The owner identifies a vehicle, marks a repair order, and leaves with a script. We do not book shops and we do not take payment for repairs.

Bluetooth: optional ELM327 adapter the owner already has. We read generic Mode 01 PIDs and Mode 03 stored DTCs. Safari cannot do this; that is why the native binary exists. We do not claim manufacturer-level scan coverage.

Account: none required for the core loop. Contact form is optional and is not sold.

Payments: none in v1. No escrow. No shop checkout.
```

**If Apple support asks what you are building:** the paragraph under “What we are” above. Do not say marketplace. Do not say Carfax. Do not say “available on the App Store” on the website until the listing URL is real.

---

## Send log

Tick when the thread exists. A sent letter is PAPER started. A signed PDF is PAPER closed. This session cannot close PAPER.

| Packet | Sent (date) | Thread / ticket | Result |
| --- | --- | --- | --- |
| J.D. Power Chrome | | | |
| MOTOR / Hearst | | | |
| Mitchell / ProDemand | | | |
| Carfax business | | | |
| Consumer Reports licensing | | | |
| TecAlliance TecDoc | | | |
| PartsTech | | | |
| CarsXE | | | |
| MarketCheck | | | |
| VinAudit | | | |
| Apple Developer enrollment | | | $99 paid / not yet |

Weekend keys (OpenAI, Places, Yelp, Stripe test, Resend) are not letters. They are [GAPS.md](GAPS.md) section B and [ACQUIRE-MVP.md](ACQUIRE-MVP.md).
