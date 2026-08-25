# Industry roles

The car does not care who is holding the ticket. The pipeline does. AutoShield gives each desk a tool that finishes in under 30 seconds. We do not book shops, sell parts, or invent live dealer inventory.

Build / swap notes stay on `/builds` (core). Job tools live under `/jobs`.

## The pipeline

1. **Owner / daily driver** — `/jobs/owner`  
   Confidence checklist before a shop visit. One sentence for the writer. Measurements, not adjectives.

2. **DIY weekend mechanic** — `/jobs/diy`  
   Job card: tools, torque mindset (“use a chart, don’t guess”), safety.

3. **Service advisor / writer** — `/jobs/advisor`  
   RO decoder. LOF, alignment, trans service — what the owner hears vs what you should say.

4. **Technician / ASE** — `/jobs/tech`  
   The questions the customer will ask. A pad for millimeters on rotors. We do not invent the book spec.

5. **Parts counter** — `/jobs/parts`  
   OEM vs aftermarket vs CAPA body. VIN last-8. No fake “in stock.”

6. **Dealer sales / F&I** — `/jobs/sales`  
   What not to bury. PPI reminder. Products are yes/no lines.

7. **Independent shop owner** — `/jobs/shop`  
   Fair quoting: diagnosis split, supplies disclosed, call before extras.

8. **Insurance adjuster / body shop** — `/jobs/claims`  
   Photo list that will actually support a claim.

9. **Inspector / PPI / lemon-law adjacent** — `/jobs/inspector`  
   Walk-around shot list. Not legal advice. Not a filing.

10. **Auction buyer / wholesaler** — `/jobs/auction`  
    Public vs dealer lanes. Fee gotchas. Landed cost. No live lanes.

11. **Fleet / shop manager** — `/jobs/fleet`  
    Interval vs upsell. Approve the page, not the pitch.

12. **EV owner** — `/jobs/ev`  
    12V, tires, brakes, cabin, coolant loops. There is no oil change.

## Shared tools

| Route | Job |
| --- | --- |
| `/jobs` | Who-are-you switchboard |
| `/jobs/obd` | P/B/C/U translator — layperson, likely systems, do not throw parts |
| `/jobs/codes` | Alias → `/jobs/obd` |
| `/jobs/ppi` | Guided PPI photo list |
| `/jobs/ro-terms` | Invoice slang glossary |

Core also keeps `/obd` for VIN-aware scanner copy. The jobs book is the larger dictionary (`src/lib/jobs/dtc-dictionary.ts`) plus the “do not throw parts” line.

## APIs

- `GET /api/jobs/dtc?code=P0420`
- `GET /api/jobs/terms?q=lof`
- `GET /api/jobs/roles`

## Nav

`src/config/nav/jobs.ts` — stamps for the jobs board. Core site nav is separate (`src/lib/nav.ts`).
