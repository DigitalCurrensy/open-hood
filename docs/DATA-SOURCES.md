# Data sources

What AutoShield actually calls, what is a paid hook, and what we refuse to scrape.

## Wired now (no paid key)

| Source | Job | Where |
| --- | --- | --- |
| **OpenStreetMap Overpass** | Near-me rooftops (`shop=car`, `shop=car_parts`, `shop=car_repair`, `shop=tyres`, `amenity=fuel`, plus wash / inspection / towing tags) | `src/lib/directory/overpass.ts` → `GET /api/directory/search` |
| **Nominatim** | ZIP / city → lat/lon | `src/lib/directory/nominatim.ts` |
| **NHTSA vPIC** | VIN decode | Existing `@/lib/nhtsa` (imported, not edited) |
| **NHTSA SaferCar** `api.nhtsa.gov` | Complaints + NCAP ratings | `src/lib/directory/nhtsa-safety.ts` |
| **EPA FuelEconomy.gov** | City / highway / combined MPG | `src/lib/directory/epa.ts` |
| **Seed chains** | AutoZone, O’Reilly, Advance, NAPA, Pep Boys, Discount Tire, Firestone + dealer-group locators | `src/data/chains.json` |
| **Seed auctions** | Copart, IAA, Manheim, ADESA, GovPlanet, GSA, Copart.ca, BaT, Cars & Bids, Mecum, Barrett-Jackson | `src/data/auctions.json` |
| **Part types** | Oil filter, pads, rotors, battery, plugs, … | `src/data/part-types.json` |

Overpass is slow and rate-limited. Search times out in ~14s, then serves **cached sample rooftops** for demo ZIPs `90210` and `43215` so `/directory` never looks broken.

Nominatim wants a unique `User-Agent` and ≤1 request/second. We send `AutoShieldAI/0.1` and cache geocodes.

## Paid / licensed hooks (env only)

Set the variable. If it is missing, the desk says so. We do not invent inventory.

| Env | Provider | Status |
| --- | --- | --- |
| `GOOGLE_PLACES_API_KEY` | Google Places Nearby | Stub: merged when present |
| `YELP_API_KEY` | Yelp Fusion | Stub: merged when present |
| `MARKETCHECK_API_KEY` | MarketCheck listings | Cataloged, not called |
| `CARAPI_API_KEY` | CarAPI catalogs | Cataloged |
| `CARSXE_API_KEY` | CarsXE plate/history | Cataloged |
| `AUTODEV_API_KEY` | Auto.dev listings | Cataloged |
| `VINAUDIT_API_KEY` | VinAudit title/history | Cataloged |
| `CHROME_DATA_KEY` | Chrome Data / J.D. Power | Cataloged (enterprise) |
| `TECALLIANCE_KEY` | TecDoc / TecAlliance | Cataloged — **do not fake SKUs** |
| `MOTOR_API_KEY` | MOTOR / Identifix | Cataloged |
| `YOUTUBE_API_KEY` | YouTube Data API | Cataloged |
| `EBAY_CLIENT_ID` | eBay Browse | Not wired — Browse needs a secret. Outbound Motors search URLs only |

Full machine catalog: `src/data/apis.json` and `GET /api/directory/catalog`.

## What we will not scrape

Copart lots, IAA lots, Carfax reports, dealer inventory HTML, RockAuto / AutoZone stock. Auction and parts desks are **link-out search URLs**.

## Near-me flow

1. User types a ZIP or city on `/directory`.
2. Nominatim geocodes (demo coordinates if the public instance is down and the ZIP is `90210` / `43215`).
3. Overpass `around:` query for automotive tags (~12 km).
4. Optional Google Places / Yelp merge if those keys exist.
5. Client filters: dealers · parts · repair · body · tires · towing · inspection · carwash.
6. Cards show name, address, `tel:`, website, map, type. Hours come from OSM `opening_hours` when present.

## Routes

| Path | Role |
| --- | --- |
| `/directory` | Near-me rooftops + chain locators + provider catalog |
| `/directory/parts` | RockAuto / AutoZone / Amazon / eBay Motors query URLs |
| `/auctions` | Public vs dealer-only lanes; year/make/model query params |
| `GET /api/directory/search?q=&type=` | Geocode + Overpass (+ demo fallback) |
| `GET /api/directory/geocode?q=` | Nominatim only |
| `GET /api/directory/mpg?year=&make=&model=` | EPA |
| `GET /api/directory/complaints?year=&make=&model=` | SaferCar complaints |
| `GET /api/directory/ratings?year=&make=&model=` | NCAP stars |
| `GET /api/directory/parts?year=&make=&model=&part=` | Outbound SKU URLs |
| `GET /api/directory/catalog` | Provider catalog + env status |
| `GET /api/auctions/search?year=&make=&model=` | Auction link-out list |

Nav export for the rest of the site (do not edit site-nav from this layer): `src/config/nav/directory.ts`.
