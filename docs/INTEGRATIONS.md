# Integrations

The `/integrations` patch bay. Every **Open** / **Connect** / **Request access** control is a real URL or a working public API. We do not invent TecDoc SKUs, Carfax XML, or live dealer inventory.

Nav stamp: `src/config/nav/integrations.ts` (`INTEGRATIONS_NAV_ITEM`). Reusable chips: `src/components/integration-strip.tsx`.

## Live (no paid key)

These open official pages. Several also call a public API from this bay.

| Jack | What it does | API or deep link |
| --- | --- | --- |
| **NHTSA vPIC** | VIN decoder page + decode-in-bay | `vpic.nhtsa.dot.gov` + `GET /api/integrations/nhtsa?kind=vin` |
| **NHTSA SaferCar recalls** | VIN / YMM recall desk | `nhtsa.gov/recalls` + `kind=recalls` |
| **NHTSA NCAP** | 5-star ratings page | `nhtsa.gov/vehicle/{Y}/{MAKE}/{MODEL}` + `kind=ratings` |
| **SaferCar complaints** | Owner complaint search | `nhtsa.gov/search` + `kind=complaints` |
| **EPA MPG** | Official city / hwy / combined | FuelEconomy.gov REST via `GET /api/integrations/mpg` |
| **Find-a-Car** | EPA PowerSearch / Find-a-Car | `fueleconomy.gov/feg/findacar.shtml` |
| **OSM / Nominatim** | ZIP → pin → directory | `GET /api/integrations/geocode` + `/directory` |
| **YouTube how-to** | Job search + guides desk | YouTube results URL + `/guides` |
| **RockAuto, AutoZone, Advance, O’Reilly, Amazon, eBay Motors** | Parts search templates | Public storefront query strings |
| **Google Maps / Apple Maps** | Directions from an address | `maps/dir/?api=1` and `maps.apple.com/?daddr=` |
| **IIHS ratings** | Official ratings lookup UI | `iihs.org/ratings` (body style is theirs) |
| **Carfax consumer** | Owner report portal | `carfax.com/vehicle-history-reports/` — type the VIN there; we do not scrape |
| **RepairPal / Yelp** | Shop research link-outs | Public search / estimator |
| **Fuelly** | Optional owner-logged MPG | `fuelly.com/car/{make}/{model}/{year}` |
| **Bring a Trailer / Cars & Bids** | Public consumer auctions | Site search |
| **Copart / IAA** | Public lot search | Browse is public; bidding usually is not |

**Share this bay** uses the Web Share API (clipboard fallback) and `window.print()`.

## Env-upgrade (honest connected / not)

`GET /api/integrations/status` reads these. `configured:true` only if the key is actually present. Paid adapters are **not** hammered on the matrix — `probed:skip`. An empty key is never `configured:true`.

| Env | If connected | If not |
| --- | --- | --- |
| `OPENAI_API_KEY` | Open `/agent` · `probed:skip` | Connect → platform.openai.com |
| `GOOGLE_PLACES_API_KEY` | Open `/directory` (Places merge) · `probed:skip` | Connect → Google Maps APIs |
| `YELP_API_KEY` | Open `/directory` (Fusion merge) · `probed:skip` | Connect → Yelp developers |
| `YOUTUBE_API_KEY` | Open `/guides` + related clips · `probed:skip` | Connect → YouTube Data API; search URLs still work |
| `CARSXE_API_KEY` | Open `/history` (plate decode) · `probed:skip` | Connect → api.carsxe.com; plate stays a note |
| `MARKETCHECK_API_KEY` | Open `/history` (plate decode) · `probed:skip` | Connect → marketcheck.com |
| `VINAUDIT_API_KEY` | Title snapshot on `/history` · `probed:skip` | Connect → vinaudit.com/api; outbound Carfax cards |
| `RESEND_API_KEY` + `CONTACT_TO_EMAIL` | Email `/contact` · `probed:skip` | Local JSONL |
| `STRIPE_SECRET_KEY` (`sk_test_`) | Packet Checkout on `/integrations` · `product:packet` · `probed:skip` | — |
| `STRIPE_SECRET_KEY` (`sk_live_`) | Packet fee **only** with `STRIPE_PACKET_PRICE_ID`. Else detected, `product:none`, escrow refused | No escrow. No shop cuts. No marketplace. |

How to buy the rest (Motor, TecDoc, Chrome, Carfax, escrow): [AXIS-100.md](AXIS-100.md), [LICENSES.md](LICENSES.md), [ROADMAP.md](../ROADMAP.md).

## Founder bay

`/integrations` lists every env name for copy-paste plus one line on what it unlocks. Weekend keys (`OPENAI`, `CARSXE`, `MARKETCHECK`, `VINAUDIT`, `GOOGLE_PLACES`, `YELP`, `YOUTUBE`, `RESEND`, `STRIPE`) go live when the real key is present. Paper keys stay `configured:false` even if pasted. See `.env.example`.

## Catalog-only (request access)

No live feed. Buttons go to the vendor’s real sales / developer page. A key in env does **not** flip `configured:true`. Empty bay: `skus:[]`, `hours:[]`.

- TecDoc / TecAlliance — `connected:false`, `skus:[]` (TecAlliance catalog license)
- MOTOR / Identifix — `connected:false`, `skus:[]` (Hearst Aftermarket shop license)
- PartsTech / Nexpart / Worldpac — `connected:false`, `skus:[]` (shop parts book)
- Chrome Data (J.D. Power)
- Mitchell / ProDemand
- ALLDATA
- Carfax **business** API (not the consumer portal)
- NMVTIS approved provider
- Cox / KBB
- Auto.dev / CarAPI
- CCC / FNOL
- eBay Browse API (OAuth secret)

## Routes

| Path | Role |
| --- | --- |
| `/integrations` | Patch bay + founder env rack |
| `GET /api/integrations/status` | Matrix, keys, `probed`, Stripe, empty catalog, founder rows |
| `GET /api/integrations/places` | Places adapter. Key off → `configured:false`, `results:[]` |
| `GET /api/integrations/yelp` | Fusion adapter. Key off → empty, no invented stars |
| `GET /api/integrations/plate` | CarsXE / MarketCheck. Off → plate is a note |
| `GET /api/integrations/openai` | Status only. Does not call OpenAI |
| `GET /api/integrations/stripe` | Test vs live vs none. Test = packet Checkout. Live = Price ID or refuse. Escrow refused |
| `POST /api/stripe/packet` | Optional print-packet / hold-this-bay Checkout. Test key, or live + existing `price_` |
| `GET /api/integrations/catalog` | Licensed empty bay. TecDoc / MOTOR / PartsTech `connected:false`, `skus:[]` |
| `GET /api/integrations/partstech` | PartsTech adapter. Always empty. Contract name only |
| `GET /api/integrations/vinaudit` | Weekend title key status. Off → no snapshot |
| `GET /api/integrations/mpg?year=&make=&model=` | EPA rows |
| `GET /api/integrations/nhtsa?kind=vin\|recalls\|complaints\|ratings` | SaferCar / vPIC |
| `GET /api/integrations/geocode?q=` | Nominatim |
| `GET /api/integrations/youtube?q=` | How-to search + optional Data API |
| `GET /api/integrations/links?...` | Computed outbound hrefs |

Machine catalog of directory providers remains `GET /api/directory/catalog` and `docs/DATA-SOURCES.md`.
