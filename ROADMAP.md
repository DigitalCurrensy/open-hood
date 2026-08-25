# Roadmap

User-visible outcomes only. If it isn’t on a page, it isn’t done.

## Now (shipped in this repo)

- Identify a car from a VIN, a compressed plate/VIN photo (Tesseract on-device), or year/make/model.
- Plate + US state + mileage + concern text ride along as notes — plate is not a magic VIN.
- Read a one-card fluids / PSI / filter sheet in plain English.
- Mark up a pasted (or photographed) repair order and leave with a counter script.
- Map a noise to shop questions.
- Read every pulled NHTSA campaign as “what this means” + what to say at the dealer.
- Search RockAuto / AutoZone / Amazon from the card SKUs.
- Type an OBD-II code from any cheap scanner and get a layperson explanation + cost band.
- Print or copy mechanic-mode talking points (rotors in millimeters, oil spec, no extras).
- Log a kit / swap (chassis + engine + trans) on this device.
- Open a Maps search for a shop without pretending we certified them.
- See what’s free and what’s Phase 2 on How it works.

## Next

- **VIN-specific recall open/closed** — NHTSA’s VIN campaign check, not just year/make/model rows.
- **More catalog SKUs** — popular US vehicles beyond the current fluids book; still heuristic when we miss.
- **Quote memory** — keep the last two marked-up tickets so mechanic-mode can compare shops.
- **Triage printout** — one page: specs + open safety recalls + last script, for the glove box.
- **Shop notes, not a network** — you jot “this independent measured rotors” after a visit. Still not RepairPal.
- **DTC book growth** — more P1xxx / maker codes with “ask them to print the factory title.”

## Later

- **Escrow / pay-the-shop** — only when money movement and disputes actually work. No fake Pay button before then.
- **TecDoc / OEM labor times** — licensed data, not guessed hours.
- **Live dealer / parts-store inventory** — real availability APIs, not scraped fiction.
- **TSB + customer-service campaign hunt** — “hidden warranty” language with citations.
- **Keep / sell / repair bands** — RepairVerdict-style only if we can cite sources.
- **Pre-purchase checklist** — Lemon Squad is an inspector network; we would ship a DIY list + script, not a fake PPI.

We will not ship a control that looks live and isn’t.
