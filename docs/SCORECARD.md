# Open Hood scorecard

Honest rating of what this repo actually does today. Not a pitch deck.

## Score: **7 / 10**

A useful consumer-advocate bay: VIN decode, fluids card, quote grease-pencil with ZIP labor bands, symptom map, typed OBD dictionary plus a thin Chrome/Android BLE scan, NHTSA year/make/model recalls assembled as a history jacket, OSM shop directory (Places/Yelp jack when keys exist), EPA MPG, owner guides, and an agent that **calls those modules as tools** (keyword router always; OpenAI function calling when `OPENAI_API_KEY` is set). Beginner / Expert is a reading altitude on one page.

It is not a shop operating system. It does not move money, decode a plate without a paid key, or sell TecDoc hours. Competitive score against RepairPal / Carfax / Fix Finder: [RATING.md](RATING.md) (**51%**). Different bar.

## What 20 / 10 would be

Twenty is the full fantasy stack people ask for after they like the window script:

| Capability | Why it is a 20 |
| --- | --- |
| **Full TecDoc / OEM labor** | Licensed hours and operations, not a guessed “fair band.” |
| **Live plate-to-VIN** | Paid DMV/decoder. A plate in this bay is still a note. |
| **Escrow / pay-the-shop** | Money movement, disputes, chargebacks. No fake Pay button. |
| **Full scan tool** | Freeze-frame, readiness, manufacturer PIDs, iOS. Today: type a code, or three generic PIDs + stored DTCs on Chrome/Android BLE. |
| **Insurance / claims** | Carrier APIs, estimate matching, total-loss rules. |
| **Dealer DMS** | Write the RO, clock hours, parts on the ticket. We do not sit in their bay. |
| **VIN-specific open/closed recalls** | NHTSA VIN campaign check, not year/make/model rows. |
| **Live dealer / store inventory** | Real availability APIs. We will not invent “in stock.” |

That list is **later**, not pretend-shipped. See `ROADMAP.md`.

## Gaps closed this pass

- Real **tool/function calling** on `POST /api/agent`: `decode_vin`, `lookup_dtc`, `analyze_quote_text`, `diagnose_symptoms`, `get_fluids_for_vehicle`, `search_guides`, `search_directory`, `get_recalls`, `get_epa_mpg`, plus playbooks, RO terms, and outbound parts search URLs.
- Same tools run from a **keyword router** when there is no OpenAI key, so “P0420”, “flush quoted”, and a pasted VIN still *do* something.
- **OpenAPI 3.1** at `public/openapi.yaml`, served at `GET /api/openapi` (yaml or json). Readable view at `/agent/api`.
- **Beginner / Expert** on the agent page (storage key `openhood.reading-level`). Legacy `dummy` / `shop-talk` values migrate. No “dummy” labels on the surfaces we touched.
- Reply now includes **facts + invocations + next desks** (`/quote` `/guides` `/directory` `/obd` `/expert`).
- **ZIP labor bands** on `/estimate` and on quote flags (5 regions, 12 jobs). Not Motor hours.
- **Web Bluetooth ELM327** on `/scan` (Chrome/Android): RPM, speed, coolant, stored codes. Desktop is demo PIDs.
- **History jacket** + Carfax/NMVTIS consumer links. Places/Yelp jack on `/directory` when keys exist.
- **Fluids JSON book** — 216 year/make/model rows + 90 filter cross-refs. Honda demo stays 5W-20. Tesla stays not applicable.
- **Installable PWA** — home-screen website (`PwaBoot`, `/offline`). Not an App Store app.
- **Decoder sticker** — `/sticker` lists non-empty vPIC fields. Not a Monroney.

## Still later

- VIN-specific recall open/closed (not just Y/M/M).
- TecDoc / Mitchell / AllData hours.
- Plate-to-VIN on by default, escrow, insurance, dealer DMS.
- Live parts inventory and “book this bay.”
- Native store apps and iOS Bluetooth. PWA is a pin-able website.
- Hidden-warranty TSB hunt with citations (SaferCar patterns exist; we do not pirate dealer PDFs).
- More maker-specific DTCs. Fluids book is 216 JSON rows — still heuristic on a miss.

## How to read the 7

The product already helps an owner walk to the window with a sentence and a closed wallet. The agent can now **execute** the desks behind that sentence. It still cannot replace a licensed inspection, a factory subscription, or a shop management system — and we will not paint those buttons until they work.
