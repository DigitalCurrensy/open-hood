# Data sources

What Open Hood actually calls, what is a paid hook, and what we refuse to scrape.

## Wired now (no paid key)

| Source | Job | Where |
| --- | --- | --- |
| **OpenStreetMap Overpass** | Near-me rooftops (`shop=car`, `shop=car_parts`, `shop=car_repair`, `shop=tyres`, `amenity=fuel`, plus wash / inspection / towing tags) | `src/lib/directory/overpass.ts` → `GET /api/directory/search` |
| **Nominatim** | ZIP / city → lat/lon | `src/lib/directory/nominatim.ts` |
| **NHTSA vPIC** | VIN decode | Existing `@/lib/nhtsa` (imported, not edited) |
| **NHTSA SaferCar** `api.nhtsa.gov` | Complaints + NCAP ratings + recalls | `src/lib/directory/nhtsa-safety.ts` |
| **EPA FuelEconomy.gov** | City / highway / combined MPG | `src/lib/directory/epa.ts` |
| **IIHS ratings** | Crash-test link-out by year / make / model | `https://www.iihs.org/ratings/vehicle/{make}/{model}/{year}` |
| **Seed chains** | AutoZone, O’Reilly, Advance, NAPA, Pep Boys, Discount Tire, Firestone + dealer-group locators | `src/data/chains.json` |
| **Seed auctions** | Copart, IAA, Manheim, ADESA, GovPlanet, GSA, Copart.ca, BaT, Cars & Bids, Mecum, Barrett-Jackson | `src/data/auctions.json` |
| **Part types** | Oil filter, pads, rotors, battery, plugs, … | `src/data/part-types.json` |

Overpass and Nominatim use Next `fetch` with `revalidate: 3600` (plus a 1-hour in-process cache). Search times out in ~14s, then serves **cached sample rooftops only when the owner asked for demo ZIPs `90210` or `43215`**. A geocode miss or an empty Overpass sweep for any other query stays empty — we do not swap in Beverly Hills. Results stamp `updatedAt`. This is not a live national dealer database.

`recalls.nhtsa.dot.gov` does not resolve. The live consumer desk is [nhtsa.gov/recalls](https://www.nhtsa.gov/recalls). Vehicle pages: `https://www.nhtsa.gov/vehicle/{year}/{MAKE}/{MODEL}`. IIHS: `https://www.iihs.org/ratings/vehicle/{make}/{model}/{year}`. EPA model card: `https://www.fueleconomy.gov/feg/bymodel/{year}_{Make}_{Model}.shtml`.

Nominatim wants a unique `User-Agent` and ≤1 request/second. We send `OpenHood/0.1` and cache geocodes. Five-digit ZIPs use structured `postalcode` + `country=USA` so `90210` lands in Los Angeles, not a colliding overseas code.

Live Overpass around a dense ZIP can return hundreds of POIs. The API ranks by miles and returns the nearest 80 so the desk stays readable.

## Paid / licensed hooks (env only)

Set the variable. If it is missing, the desk says so. We do not invent inventory.

| Env | Provider | Status |
| --- | --- | --- |
| `GOOGLE_PLACES_API_KEY` | Google Places Nearby | Stub: merged when present |
| `YELP_API_KEY` | Yelp Fusion | Stub: merged when present |
| `MARKETCHECK_API_KEY` | MarketCheck plate-to-VIN | Coded on `/history`; listings not called |
| `CARAPI_API_KEY` | CarAPI catalogs | Cataloged |
| `CARSXE_API_KEY` | CarsXE plate-to-VIN | Coded on `/history` plate; can also unlock CarsXE history |
| `CARSXE_HISTORY_API_KEY` | CarsXE history snapshot | Live on `/history` title bay when set; empty + not a Carfax file when off |
| `AUTODEV_API_KEY` | Auto.dev listings | Cataloged |
| `VINAUDIT_API_KEY` | VinAudit title/history | Live on `/history` title bay when set; empty + not a Carfax file when off |
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
| `/directory?zip=90210` | Same desk; `zip` or `q` fills the search |
| `/directory/90210` | Dynamic ZIP / city segment; same search as `?zip=` |
| `/directory/parts` | RockAuto catalog + AutoZone / Amazon / eBay Motors query URLs |
| `/auctions` | Public vs dealer-only lanes; year/make/model query params |
| `GET /api/directory/search?q=&type=` | Geocode + Overpass (demo fallback only for asked 90210 / 43215) |
| `GET /api/directory/places?zip=` | Google / Yelp merge; `{connected:false, results:[]}` without keys |
| `GET /api/directory/geocode?q=` or `?lat=&lon=` | Nominatim forward or reverse |
| `GET /api/directory/mpg?year=&make=&model=` | EPA |
| `GET /api/directory/complaints?year=&make=&model=` | SaferCar complaints |
| `GET /api/directory/ratings?year=&make=&model=` | NCAP stars |
| `GET /api/directory/recalls?year=&make=&model=` | SaferCar recall count + campaign numbers |
| `GET /api/directory/parts?year=&make=&model=&part=` | Outbound SKU URLs |
| `GET /api/directory/catalog` | Provider catalog + env status |
| `GET /api/auctions/search?year=&make=&model=` | Auction link-out list |

Nav export for the rest of the site (do not edit site-nav from this layer): `src/config/nav/directory.ts`.

## Working outbound URL patterns

| Desk | Broken / old | Working now |
| --- | --- | --- |
| AutoZone locator | — | `https://www.autozone.com/locations/?q={zip}` |
| O'Reilly locator | `oreillyauto.com/locations?q=` (bot-blocked / q dropped) | `https://locations.oreillyauto.com/?q={zip}` |
| Advance locator | `/search?q=` redirected | `https://stores.advanceautoparts.com/index.html?q={zip}` |
| Firestone locator | `/store-locator/?q=` redirected | `https://www.firestonecompleteautocare.com/locate/display-map/?q={zip}` |
| Discount Tire | — | `https://www.discounttire.com/store-locator?q={zip}` |
| AutoNation | `/dealers` 404 | `https://www.autonation.com/dealers/results` |
| Penske | `/dealerships.htm` 404 | `https://www.penskeautomotive.com/locations/` |
| Lithia | `/dealerships.htm` 404 | `https://www.lithia.com/locations/store-locations.htm` |
| Sonic | `/dealerships.htm` 404 | `https://www.sonicautomotive.com/all-locations.htm` |
| Group 1 | `/dealerships` 404 | `https://www.group1auto.com/dealer-locations/` |
| Hendrick | `hendrickauto.com/dealerships.htm` 404 | `https://www.hendrickcars.com/dealership/directions.htm` |
| Copart | — | `https://www.copart.com/lotSearchResults?free=true&query={ymm}` |
| IAA | `?search=` still loads; Keyword is the live form | `https://www.iaai.com/Search?Keyword={ymm}` |
| BaT | — | `https://bringatrailer.com/?s={ymm}` |
| Cars & Bids | — | `https://carsandbids.com/search?q={ymm}` |
| GovPlanet | `/en/search?q=` **404** | `https://www.govplanet.com/jsp/s/search.ips?mode=1&keyword={ymm}` |
| Barrett-Jackson | `/Events/All-Auctions?search=` **404** | `https://www.barrett-jackson.com/results` |
| GSA | homepage only | `https://gsaauctions.gov/auctions/search?searchText={ymm}` |
| RockAuto | `partsearch/?partnum=2018 Honda Civic oil filter` is not a SKU | `https://www.rockauto.com/en/catalog/{make},{year},{model}` |
| eBay Motors | — | `https://www.ebay.com/sch/6000/i.html?_nkw={query}` |
