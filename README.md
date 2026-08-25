# AutoShield AI

Factory specs in plain English. Don’t authorize a repair until you can say the script at the counter.

AutoShield is a consumer-defense bay, not a shop marketplace. Identify the car (VIN, photo, or year/make/model). We translate NHTSA data and the repair order into sentences a service writer has to answer.

## What’s live

| Desk | What it does |
| --- | --- |
| **Bay** `/` | VIN, plate/VIN photo (local Tesseract + JPEG compress), or year/make/model |
| **Spec sheet** `/garage` | Fluids / PSI / filter SKUs (catalog + heuristic) |
| **Quote defense** `/quote` | Paste or photo-mark an RO; grease-pencil padded lines |
| **Symptoms** `/symptoms` | Noise + moment → causes and shop questions |
| **Recalls** `/recalls` | NHTSA campaigns with “what this means” and a dealer script |
| **Parts** `/parts` | RockAuto / AutoZone / Amazon **search URLs** from SKUs (not live inventory) |
| **OBD** `/obd` | Type a code from any $20 scanner — no dongle |
| **Mechanic mode** `/mechanic-mode` | Printable / copyable counter script + rotor talking points |
| **Builds** `/builds` | Kit / swap binder: chassis + engine + trans (on-device) |
| **Shops** `/shops` | Honest Maps search stub + questions to ask before you book |
| **How it works** `/how-it-works` | What’s free, what we refuse to fake |
| **Directory / Auctions / Guides / Agent / Jobs** | Sibling desks — nav is wired; pages land with those agents |

Demo VINs on the bay: `1HGCM82633A004352` (2003 Honda Accord), F-150, Tesla Model S.

## How this is different

RepairPal, Openbay, YourMechanic, and dealer apps exist to **route you into a shop**. Carfax stores history. FIXD / Torque sell a **dongle**. RockAuto sells parts. ShopAdvisor is for the shop.

AutoShield is the person standing next to you at the window:

1. **Advocate, not marketplace** — no booking fee, no certified-shop network.
2. **Translator** — factory specs, recalls, and DTCs in sentences you can say out loud.
3. **Grease-pencil on the actual RO** — markup + a three-line script.
4. **Hardware-free OBD** — type the code; we don’t invent a Bluetooth puck.
5. **Honest parts path** — search URLs, not fake “in stock at your dealer.”
6. **Swap / kit tracker** — when one VIN is a lie.
7. **Thin shop stub** — we open Maps and hand you questions. We do not certify anyone.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npx tsc --noEmit
npm run build
```

### Environment

Copy `.env.example` to `.env.local`. `OPENAI_API_KEY` is optional.

Without a key: VIN decode, year/make/model identify, local photo OCR (Tesseract.js on the device), fluids, recalls, local quote markup, symptoms, OBD, parts, and the counter script still work. Photos are compressed to JPEG on the client so the upload does not die on a 12 MB phone shot.

A license plate is a note, not a DMV lookup. We do not pretend to own a commercial plate-to-VIN API.

## Architecture

- Next.js 16 App Router, TypeScript, Tailwind v4, `src/`
- Native `fetch` only (no axios)
- `POST /api/vin` — NHTSA vPIC + recalls + fluids card
- `POST /api/identify` — VIN **or** year/make/model (+ plate, miles, concern)
- `GET /api/catalog` — NHTSA makes / models for a year
- `POST /api/quote` — local price book; OpenAI vision if configured
- `POST /api/symptoms` — rule map
- `POST /api/ocr` — optional cloud VIN assist (returns honestly if no key)
- Session: identified vehicle + last quote in `sessionStorage`
- Builds: `localStorage` on this device

`next.config.ts` sets `turbopack.root` to this project. Leave it.

## Deploy

```bash
npx vercel
```

Production needs no secrets for the core bay. Set `OPENAI_API_KEY` in the host if you want photo OCR.

## Coming later (not shipped as broken buttons)

Escrow for a repair, TecDoc / OEM labor times, and live dealer inventory are Phase 2. See [ROADMAP.md](ROADMAP.md). Voice and palette: [docs/BRAND.md](docs/BRAND.md).
