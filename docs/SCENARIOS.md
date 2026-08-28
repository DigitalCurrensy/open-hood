# Owner scenario playbooks

Beginner script on the left. Genius measurements on the right. We cover the situations owners actually hit without inventing paid databases, TecDoc hours, live lots, or pirated TSB PDFs.

Route: `/expert`  
Alias: `/playbooks` → `/expert`  
Detail: `/expert/[slug]`  
Patterns: `/expert/tsb`  
Printable card: `/expert/cheatsheet`

## What is in the book

Twelve playbooks:

| Slug | Situation |
| --- | --- |
| `pre-shop` | Pre-shop visit — one sentence, one code, millimeters before you walk in |
| `used-ppi` | Used-car 30-minute PPI — walk-around before money moves |
| `check-engine` | Check-engine night — freeze-frame, do not throw parts |
| `brake-noise` | Brake squeal vs grind — indicator tab vs metal-on-metal |
| `shop-choice` | Dealer vs indie vs chain — we book nobody |
| `ev-owner` | EV 12V / tires / brakes — there is no oil change |
| `auction-fees` | Auction lane fees — hammer is not landed cost |
| `after-quote` | Cabin filter / flush / “while you’re in there” |
| `seasonal` | Winter / summer — PSI, battery, coolant spec |
| `road-trip` | Road-trip go/no-go the night before |
| `lemon-buyback` | Lemon-ish / buyback — questions, not legal advice |
| `claim-photos` | Insurance photos after a hit |

Each playbook has: beginner steps (what to do / what to say), genius notes (what mm, PSI, 32nds, volts, or a DTC freeze-frame means), a three-line window script, a do-not list, and links to desks that already exist (`/agent`, `/guides`, `/quote`, `/jobs`, `/directory`, `/obd`, plus `/recalls`, `/symptoms`, `/mechanic-mode` when the scenario needs them).

## Failure patterns (`/expert/tsb`)

A pattern library, **not** stolen TSB PDFs. Cards describe public campaigns and widely reported owner patterns (Takata, P0420-before-the-cat, EV 12V, etc.). The Honda Accord 2003 Takata pointer is a SaferCar campaign lookup — the bay demo VIN is that car.

- SaferCar recalls / VIN: https://www.nhtsa.gov/recalls  
- Takata campaign: https://www.nhtsa.gov/campaign/takata-air-bags  
- Live pull: `GET /api/expert/safercar?year=2003&make=Honda&model=Accord` (NHTSA campaigns + complaint counts)

If a shop cites a TSB, they show the OEM bulletin number and the measurement that matches. We do not host ALLDATA, Identifix, or dealer PDFs.

## APIs

| Path | Job |
| --- | --- |
| `GET /api/expert/playbooks` | Filtered book (`q`, `audience`) |
| `GET /api/expert/playbooks?id=pre-shop` | One playbook |
| `GET /api/expert/playbooks/[slug]` | One playbook |
| `GET /api/expert/tsb` | Pattern library (`q`, `make`, `symptom`) |
| `GET /api/expert/safercar?year=&make=&model=` | Official NHTSA campaigns + complaints |

## File ownership

- `src/lib/expert/**`
- `src/app/expert/**`
- `src/app/api/expert/**`
- `src/data/scenario-playbooks.json`
- `src/data/tsb-patterns.json`
- `src/config/nav/expert.ts`
- `docs/SCENARIOS.md`

`EXPERT_NAV_ITEM` is ready for the bay stamp board (`src/lib/nav.ts`). `/playbooks` is a thin redirect so either URL works.
