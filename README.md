# Open Hood

Know the car. Then the window.

Live demo: https://open-hood.vercel.app

Identify the car. Mark the repair order. Walk to the window with three sentences. Not a shop marketplace. Not Carfax. Not a Saturday meetup.

## Waiting-room path

1. Open `/` and tap **Try the demo · 2003 Honda Accord** (or type a VIN).
2. Ask: “They quoted $89 for a cabin filter.”
3. Copy the three lines.
4. Optional: paste a full ticket on `/quote`.

| Stamp | URL | Job |
| --- | --- | --- |
| Ask | `/#ask` | Quote line, noise, or code → sentences |
| Car | `/` | VIN or year / make / model |
| Ticket | `/quote` | Paste or photo the RO |
| Script | `/mechanic-mode` | Three lines + print |
| Spec | `/garage` | Oil / PSI / filters. Honda demo stays 5W-20 |
| Code | `/obd` | Type the scanner code |
| Noise | `/symptoms` | Sound + moment |
| Parts | `/parts` | Search URLs, not stock |
| Maps | `/shops` | Maps + questions. No booking cut |
| Recalls | `/recalls` | NHTSA Y/M/M. Dealer closes VIN |

Lab desks (finder, auctions, jobs, builds, directory OSM) stay under **Lab desks**.

Demo VIN: `1HGCM82633A004352` — 2003 Honda Accord 3.0L, oil **5W-20**.

## What this is not

RepairPal / Openbay book a shop. YourMechanic sends a person. Carfax sells a file. Motor / TecDoc sell hours. AutoZone sells a SKU. We send a script.

## Run it

```bash
npm install
npm run dev
npm test
```

Copy `.env.example` to `.env.local`. `OPENAI_API_KEY` is optional. If the key is on and OpenAI returns 429, Ask stays on typed tools and says so.

Crawlers: `/llms.txt`, `/robots.txt`, `/sitemap.xml`.

## Architecture

- Next.js 16 App Router, TypeScript, Tailwind v4
- `POST /api/agent` — tools + optional model. Safety short-circuit first.
- `POST /api/quote` — typical-hour book. Accepts `specs` or `vehicle`.
- `POST /api/vin` — NHTSA vPIC
- Session in `sessionStorage`. No account.

## Coming later (not painted as live)

Escrow, TecDoc / Motor hours, live dealer inventory, plate-to-VIN. See ROADMAP.md.
