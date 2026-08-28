# Roadmap

User-visible outcomes only. If it isn’t on a page, it isn’t done.

## Now (shipped in this repo)

- Identify a car from a VIN, a compressed plate/VIN photo (Tesseract on-device), or year/make/model.
- Plate + US state + mileage + concern text ride along as notes — plate is not a magic VIN.
- Read a one-card fluids / PSI / filter sheet in plain English.
- Search a **216-row** fluids book on `/catalog` (plus 90 OEM / Fram / Wix / Purolator filter rows). Door jamb still wins.
- Mark up a pasted (or photographed) repair order and leave with a counter script.
- Map a noise to shop questions.
- Read every pulled NHTSA campaign as “what this means” + what to say at the dealer.
- Search RockAuto / AutoZone / Amazon from the card SKUs.
- Type an OBD-II code from any cheap scanner and get a layperson explanation + cost band.
- Print or copy mechanic-mode talking points (rotors in millimeters, oil spec, no extras).
- Log a kit / swap (chassis + engine + trans) on this device.
- Open a Maps search for a shop without pretending we certified them.
- See what’s free and what’s Phase 2 on How it works.

## Next (code — not a license)

- **Quote memory** — keep the last two marked-up tickets so mechanic-mode can compare shops.
- **Triage printout** — one page: specs + nameplate safety recalls + last script, for the glove box. VIN open/closed stays a SaferCar link until a licensed file lands (Later).
- **Shop notes, not a network** — you jot “this independent measured rotors” after a visit. Still not RepairPal.
- **DTC book growth** — more P1xxx / maker codes with “ask them to print the factory title.”

## Later — licensed pipes (PAPER)

These stay paper until a signed contract and a desk that names the vendor. **We have not signed Chrome, Motor, Carfax, Consumer Reports, or TecDoc.** A key in env does not flip them live. Letters: [docs/OUTREACH.md](docs/OUTREACH.md). Founder process: [docs/GAPS.md](docs/GAPS.md).

- **Escrow / pay-the-shop** — only when money movement and disputes actually work. No fake Pay button before then. Stripe **test** is not this.
- **TecDoc / OEM labor times** — licensed Motor / Mitchell / TecAlliance data, not guessed hours. `/estimate` stays ZIP typical until then.
- **Chrome Data / Monroney** — J.D. Power catalog. `/sticker` stays vPIC and `{connected:false}`.
- **Carfax / NMVTIS commercial file** — accidents, titles, shop stamps we fetched. `/history` stays NHTSA + consumer link-outs.
- **VIN-true recall open/closed** — NHTSA partnership or licensed bulk. Public `recallsByVin` is 403. Do not scrape SaferCar HTML.
- **Live dealer / parts-store inventory** — real availability APIs, not scraped fiction. Finder stays search URLs.
- **TSB + customer-service campaign hunt** — Identifix / legal TSB with citations. Pattern cards are not stolen PDFs.
- **Keep / sell / repair bands** — RepairVerdict-style only if we can cite sources. `/value` stays illustration + consumer searches.
- **Consumer Reports bubbles** — only if they license. Default is NHTSA complaint counts ([docs/RELIABILITY.md](docs/RELIABILITY.md)).
- **Store apps / iOS BLE** — Apple Developer + native binary. PWA is a pin. [docs/NATIVE.md](docs/NATIVE.md).
- **Pre-purchase checklist** — Lemon Squad is an inspector network; we would ship a DIY list + script, not a fake PPI.

We will not ship a control that looks live and isn’t.

**100% on every axis (licenses, team, money):** [docs/AXIS-100.md](docs/AXIS-100.md). Product score is [61%](docs/RATING.md) — not 105 — until those pipes exist. Company overlay **35** until users. Execution queue: [docs/EXECUTION-BOARD.md](docs/EXECUTION-BOARD.md). Org: [docs/TEAM.md](docs/TEAM.md). Vendor table: [docs/LICENSES.md](docs/LICENSES.md).
