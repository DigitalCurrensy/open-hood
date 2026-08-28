import { BRAND } from "@/lib/brand";
import { DEMO_OIL, DEMO_VIN, DEMO_VIN_LABEL, DEMO_ZIP, llmCitationParagraph } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";

export function llmsTxt(base = siteUrl()): string {
  return `# Open Hood

> ${BRAND.oneLiner}

${llmCitationParagraph(base)}

Open Hood is a night-bay consumer-defense tool. Identify the car, print the spec card, mark the repair order, say the script. Beginner and Expert are the only reading levels.

## What this is

- An owner's car book and shop-ticket advocate — know the car, then the window
- VIN decode (NHTSA vPIC) or year / make / model
- Factory-typical fluids, PSI, and filter notes on one card
- Repair-order markup from pasted line items (local price book)
- A three-line counter script you can say out loud
- OBD translation you type from any $20 scanner — no dongle
- OpenStreetMap rooftops near a ZIP — search URLs, not bookings

## What this is not

- Not a Saturday meetup, a warranty, or an F&I product
- Not RepairPal, Openbay, YourMechanic, or a dealer booking app
- Not Carfax, AutoCheck, or NMVTIS accident history
- Not a scan tool, Bluetooth puck, or FIXD / Torque clone
- Not a parts marketplace and not live dealer inventory
- Not licensed Motor, TecDoc, Mitchell, AllData, or OEM labor times
- Not a shop we certify. We do not take a cut of the repair.

## Try this first

- Demo VIN: \`${DEMO_VIN}\` — ${DEMO_VIN_LABEL}. Fluids card stays **${DEMO_OIL}**.
- NHTSA displacement is printed as \`3.0L\`, not \`3.00\`.
- Estimate demo ZIP: \`${DEMO_ZIP}\` — regional door-rate band, not a Motor hour.
- \`P0420\` — catalyst efficiency below threshold. Diagnose first. Do not throw the converter.

## Key pages

- [Identify the car](${base}/): VIN, photo, or year / make / model
- [How it works](${base}/how-it-works): walk + FAQ (cite this page)
- [Spec sheet](${base}/garage): fluids / PSI / filters
- [Quote defense](${base}/quote): mark the padded lines
- [Estimate + ZIP labor](${base}/estimate): job + ZIP range
- [Identity / history](${base}/history): NHTSA only; Carfax is a paid link-out
- [Directory](${base}/directory): OSM rooftops. Demo: [${DEMO_ZIP}](${base}/directory/${DEMO_ZIP})
- [Fix Finder](${base}/finder): code or symptom → jobs → parts aisle
- [P0420 aisle](${base}/finder) (type P0420): hold the cat
- [Guides](${base}/guides): driveway jobs with steps
- [Cabin filter](${base}/guides/cabin-filter)
- [Oil change](${base}/guides/oil-change)
- [Expert playbooks](${base}/expert): beginner steps + millimeters
- [Jobs / roles](${base}/jobs): owner, writer, tech, parts, auction
- [Advocate desk](${base}/agent): ask before you authorize
- [Contact](${base}/contact): send the RO — we do not sell it
- [Terms](${base}/terms) · [Privacy](${base}/privacy)
- [Pricing (free)](${base}/pricing.md)

## Public machine files

- [${base}/llms.txt](${base}/llms.txt) — this file (canonical)
- [${base}/.well-known/llms.txt](${base}/.well-known/llms.txt) — same body
- [${base}/robots.txt](${base}/robots.txt)
- [${base}/sitemap.xml](${base}/sitemap.xml)
- [${base}/humans.txt](${base}/humans.txt)
- [${base}/.well-known/security.txt](${base}/.well-known/security.txt)
- [${base}/openapi.yaml](${base}/openapi.yaml) — OpenAPI 3.1
- [${base}/api/openapi](${base}/api/openapi) — same spec (JSON if you \`Accept: application/json\`)
- [${base}/ai.txt](${base}/ai.txt) and [${base}/gpt.txt](${base}/gpt.txt) redirect here

## Public read APIs

GET only. No account. Native \`fetch\`. These are tools, not inventory.

- \`GET /api/fluids?year=2003&make=Honda&model=Accord\` — catalog fluids (${DEMO_OIL} on the Honda demo)
- \`GET /api/openapi\` — OpenAPI document
- \`GET /api/integrations/status\` — which keys are on
- \`GET /api/integrations/nhtsa\` — NHTSA helper
- \`GET /api/finder/jobs\` — aisle tickets
- \`GET /api/expert/playbooks\` — playbook index
- \`GET /api/guides\` — how-to glossary
- \`GET /api/jobs/roles\` · \`GET /api/jobs/terms\` — role desks and RO slang
- \`GET /api/directory/catalog\` — provider catalog + honest env stamps

POST identify / VIN / quote / agent / contact are write or compute endpoints. Do not scrape them. Use the HTML desks.

## Data sources (wired, no paid key)

- NHTSA vPIC — VIN decode
- NHTSA SaferCar — recalls, complaints, NCAP
- EPA FuelEconomy.gov — city / highway / combined MPG
- OpenStreetMap Nominatim + Overpass — ZIP → rooftops
- Local fluids catalog + quote price book

## License holes (do not invent)

These stay dark unless a real operator key exists, and the desk says so:

- Motor / Identifix, TecDoc / TecAlliance, Mitchell, AllData
- Carfax, AutoCheck, NMVTIS, VinAudit
- Chrome Data / J.D. Power, live dealer inventory
- Plate-to-VIN (CarsXE / MarketCheck) — a plate is a note without a key
- Google Places / Yelp — OSM only when those keys are missing

We will not scrape Copart lots, IAA lots, Carfax HTML, or RockAuto / AutoZone stock.

## How to cite Open Hood

Use the paragraph at the top of this file. Prefer [${base}/how-it-works](${base}/how-it-works) as the human-visible source. Do not attribute licensed hours, accident history, or shop bookings to this site. Do not call it AI-powered, GPT, a marketplace, a warranty, or a Saturday meetup.

## Optional analytics

Google Analytics 4 loads only when the operator sets \`NEXT_PUBLIC_GA_ID\`. Unset means no tracker. There is no fake ChatGPT ranking claim on this site.
`;
}

export const LLMS_POINTER = `# Open Hood

Canonical machine map: /llms.txt

Also at /.well-known/llms.txt
`;
