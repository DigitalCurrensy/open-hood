# Open Hood team (first 12–18 months)

Not a 200-person company. A team that can buy pipes and ship the advocate bay. Product name: **Open Hood**. Axis plan: [AXIS-100.md](AXIS-100.md). Work packages: [EXECUTION-BOARD.md](EXECUTION-BOARD.md).

Assume a founder already exists (Head of Product / CEO). Everyone else is hire, contractor, or a vendor CSM after a contract.

---

## Org

```
Founder / Head of Product
├── Senior full-stack (hire 1)          Identification, Quote, UX
│   └── Integrations engineer (hire 3)  Licensed clients, observability
├── Partnerships / BD (hire 2)          Licenses, vendor CSMs
├── Mobile engineer (hire 4)            PWA → Expo/RN
├── Designer (contractor)               Consumer IA
├── Counsel (contractor)                ToS, DPPA, MTL/escrow, republication
└── Security / SOC2 (contractor)        Year-1 audit
```

Vendor CSMs (Motor, TecAlliance, J.D. Power, Stripe, Google, Yelp) report to **Partnerships**, not to engineering.

---

## Roles

| Title | Reports to | Hire vs contractor vs CSM | Owns |
| --- | --- | --- | --- |
| Founder / Head of Product | — | Exists | Uniqueness, 100% definition, weekly scoreboard, what we refuse |
| Senior full-stack | Founder | Hire, month 0–1 | Identification, Quote defense, UX. Next.js, `src/lib/*`, public APIs |
| Partnerships / BD | Founder | Hire, month 0–1 | Motor, TecDoc, Chrome, plate, Carfax/AutoCheck, Places billing |
| Commercial / privacy counsel | Founder | Contractor, month 1 | ToS, DPPA, escrow/MTL, “may we republish this row” |
| Designer | Founder | Contractor, month 2–4 | Consumer IA (fewer stamps), empty states, waiting-room type |
| Integrations / data engineer | Senior full-stack | Hire, month 4 | Licensed clients, schemas, keys, tests, logs |
| Mobile engineer | Founder | Hire, month 6 | PWA offline shell, then iOS/Android, BLE |
| Security / SOC2 | Founder | Contractor, month 8 | Audit evidence, access control |
| Vendor CSM | Partnerships | Comes with the contract | Motor, TecAlliance, J.D. Power, Stripe, Google |
| Insurance / FNOL BD | Partnerships | Fractional, month 12+ | CCC / Mitchell Claim / Verisk |

Do not hire a marketplace ops team. We do not dispatch shops.

---

## Axis owners (RACI)

R = responsible (does the work). A = accountable (one name). C = consulted. I = informed.

| Axis | A | R | C |
| --- | --- | --- | --- |
| Identification | Senior full-stack | Full-stack + integrations | BD (Chrome, plate), counsel (DPPA) |
| Quote defense | Senior full-stack | Full-stack + integrations | BD (Motor, TecDoc), counsel |
| UX | Designer (while contracted), then full-stack | Full-stack | Founder (voice) |
| Data depth | Integrations engineer | Integrations + full-stack | BD, counsel (TSB republication) |
| Integrations | Integrations engineer | Integrations | BD, founder (DMS: never write the RO) |
| Trust | Founder | Counsel + full-stack (`/trust` only after legal) | BD (bond, FNOL) |
| Mobile | Mobile engineer | Mobile + full-stack (API contracts) | Designer |
| Uniqueness | Founder | Founder + designer | Everyone — stop-ship if a booking cut appears |

---

## Hire order

1. **Senior full-stack** — now. Nothing ships without someone who already knows this repo.
2. **Partnerships / BD** — now / month 1. Licenses are the critical path, not more stamps.
3. **Counsel** — month 1, contractor. Blocks live Stripe, plate, republication.
4. **Designer** — month 2, contractor, 8–12 weeks.
5. **Integrations engineer** — month 4, after the first signed feed (or when Motor is in paper).
6. **Mobile** — month 6, after the three-button IA exists on web.
7. **SOC2 contractor** — month 8.
8. **Insurance BD** — month 12+, not before hours and ToS exist.

If budget forces a choice: **BD before a second engineer.** A second Next.js hire cannot buy Motor.

---

## Decision rights

**Engineering may ship without a meeting**

- Public APIs (vPIC, SaferCar Y/M/M, EPA, OSM, FuelEconomy).
- Request-access cards and env hooks.
- Session, PWA, empty/error states, reading level.
- Heuristic fluids / ZIP bands **labeled as such**.
- OpenAI vision when `OPENAI_API_KEY` is set.

**Legal or BD must sign before merge**

- Any licensed feed in the UI (Motor, TecDoc, Chrome, Carfax, plate in production).
- Any sentence that names a vendor as if we have their file.
- Money: `sk_live_`, Connect, escrow, shop payout.
- Bonded estimate numbers.
- App Store privacy nutrition and BLE entitlements.
- Dealer DMS of any kind.
- Showing a city we did not geocode (directory demo fallback).

**Founder stop-ship**

- Booking cut, “in stock,” invented accident/SKU, grease-pencil on our own upsell, dummy/genius user-facing labels.

---

## Cadence

**Weekly scoreboard (30 minutes, Monday).** Eight axis percentages from [RATING.md](RATING.md). No inflation. Each owner: one ship, one blocker, one contract status (request / paper / live). Board file: [EXECUTION-BOARD.md](EXECUTION-BOARD.md).

**Monthly.** Update RATING.md from the repo, not from hope. If a jack looks live and is not, it is a bug.

**Quarterly.** Re-forecast the $0.9–1.8M year-1 band. Kill any workstream that turns Open Hood into RepairPal.
