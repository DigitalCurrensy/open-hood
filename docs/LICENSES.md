# License jack — vendor table

Status is **request-access** until a key is on and the desk says so. Do not invent Carfax XML, Motor hours, or TecDoc SKUs. Product: **Open Hood**. Plan: [AXIS-100.md](AXIS-100.md).

| Vendor | What we buy | Env key | Sales path | Status |
| --- | --- | --- | --- | --- |
| NHTSA vPIC | VIN decode | — | Public REST | **Live** |
| NHTSA SaferCar | Y/M/M campaigns, complaints, NCAP | — | `api.nhtsa.gov` | **Live** (Y/M/M) |
| NHTSA VIN open/closed | Per-VIN campaign close-out | — | `nhtsa.gov/recalls` web; `recallsByVin` is **403** | Link-out. Bulk = request NHTSA partnership or a fleet vendor |
| EPA FuelEconomy | Official MPG | — | Public REST | **Live** |
| OSM / Nominatim | Rooftops + geocode | — | Public, User-Agent | **Live** |
| OpenAI | Quote/VIN photo vision | `OPENAI_API_KEY` | platform.openai.com | Env |
| Google Places | Nearby rooftops | `GOOGLE_PLACES_API_KEY` | Cloud Console | Env (coded) |
| Yelp Fusion | Phones / addresses | `YELP_API_KEY` | yelp.com/developers | Env (coded) |
| YouTube Data | Related clips | `YOUTUBE_API_KEY` | Cloud Console | Env |
| CarsXE | Plate-to-VIN | `CARSXE_API_KEY` | api.carsxe.com | Env (coded, dark) |
| MarketCheck | Plate-to-VIN (+ listings later) | `MARKETCHECK_API_KEY` | marketcheck.com | Env (coded, dark) |
| Chrome Data / J.D. Power | Build / options / style IDs | `CHROME_DATA_KEY` | jdpower.com/business/automotive/chrome-data | Request access |
| MOTOR / Identifix (Hearst) | Labor times, diagnostics, TSB | `MOTOR_API_KEY` | motor.com | Request access |
| Mitchell / ProDemand | Labor / estimating | `MITCHELL_API_KEY` | mitchell.com/contact-us | Request access |
| ALLDATA | Shop service info | `ALLDATA_API_KEY` | alldata.com/contact | Request access |
| TecDoc / TecAlliance | VIN-linked SKUs | `TECALLIANCE_KEY` | tecalliance.net/en/contact | Request access |
| PartsTech | ZIP-real shop parts $ | `PARTSTECH_API_KEY` | partstech.com/contact | Request access |
| Carfax business | Accidents, titles, shop stamps | — | carfaxfordealers.com | Request access (hard sale) |
| VinAudit | Title / salvage snapshot | `VINAUDIT_API_KEY` | vinaudit.com/api | Request access |
| NMVTIS approved provider | Federal title brands | `NMVTIS_PROVIDER_KEY` | vehiclehistory.bja.ojp.gov | Request access |
| Experian AutoCheck | Score / brands | — | Consumer portal live; business = request | Consumer link-out |
| Cox / KBB | Residuals | `KBB_API_KEY` | coxautoinc.com/contact | Request access |
| eBay Browse | Live Motors listings | `EBAY_CLIENT_ID` + `EBAY_CLIENT_SECRET` | developer.ebay.com | Request access (search URL live) |
| Stripe | Test hold / future live | `STRIPE_SECRET_KEY` | dashboard.stripe.com | Test only; live refused |
| Escrow / MTL partner | Lawful hold of customer funds | (partner) | Counsel + state license or escrow.com-class | Request access |
| CCC / Mitchell Claim / Verisk | FNOL | `CCC_API_KEY` | cccis.com/contact | Request access |
| CDK / Reynolds / Tekion | Dealer DMS | — | **We do not write the RO.** Request only if they offer read-only appointments | Request access / refuse |
| CarAPI / Auto.dev | Trim trees / listings | `CARAPI_API_KEY` / `AUTODEV_API_KEY` | Not required for vPIC | Catalog |
| Apple / Google | Native store apps | — | Developer accounts | Not started |

Machine catalog: `src/data/apis.json`, `src/lib/integrations/catalog.ts`, `GET /api/integrations/status`.
