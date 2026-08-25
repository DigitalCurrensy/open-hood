# How-to / YouTube glossary

Cars for dummies, next generation. A deep, searchable bay of **real jobs** a non-mechanic can understand — each mapped to a how-to video, not a random dump.

Route: `/guides`  
Detail: `/guides/[slug]`  
Deep-links: `?q=` (free text) and `?part=` (cabin-filter, brake-pads, tpms, …) so quote and symptom pages can point here later.

## What is in the book

Forty jobs across thirteen families: fluids, filters, brakes, tires, battery, OBD, lights, wipers, ignition, jacking, buying used / PPI, talking to a shop / reading an RO, and EV owner (no oil, 12V, tires).

Each entry has: `id`, `title`, `plainEnglish`, `difficulty` (1–5), `timeEstimate`, `toolsNeeded`, `partsNeeded`, `safetyNotes`, `steps`, `youtube` (`videoId`, `title`, `channel`, `whyThisVideo`), `relatedSymptomIds`, `relatedPartTypes`, `jobRoles` (`owner`, `DIY`, `tech`, `service-writer`), plus `jobFamily`, `diySafe`, `shopSentence`, `askAtTheShop`, and `verified`.

## YouTube IDs

We only embed an iframe when `verified` is true **and** `videoId` is a real ID confirmed with YouTube oEmbed (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=…`). Preferred channels when they actually have the job: ChrisFix, Scotty Kilmer, Engineering Explained, Regular Car Reviews (price context), WeberAuto, Out of Spec, TIA, AutoZone / 1A Auto when they are the honest clip.

If a single well-known video is not honest enough (parking brake, tire rotate, turn signals), `videoId` is empty, `verified` is false, and the UI uses:

`https://www.youtube.com/results?search_query=`

Do not invent IDs to fill a hole.

## Optional YouTube Data API

If `YOUTUBE_API_KEY` is set, `GET /api/guides/related?id=oil-change` searches related clips (max 4, `safeSearch=strict`, revalidate 1 hour). Without the key the glossary still works fully — related search falls back to a YouTube results URL and honest copy. Document the key here; do not invent a Bluetooth dongle or a fake live catalog.

`GET /api/guides` returns the filtered book (`q`, `part`, `job`, `difficulty`, `diy`).

## Filters

| Param | Meaning |
| --- | --- |
| `q` | Words against title, plain English, parts, steps, channel |
| `part` | Alias from `src/config/nav/guides.ts` (`cabin-filter`, `12v-battery`, …) |
| `job` | Family id (`fluids`, `ev`, …) |
| `difficulty` | Exact 1–5 |
| `diy` | `1` or `true` = driveway-safe only |

## UI

Index: search, family stamps, difficulty, DIY-safe. Empty bay tells you what to try next.

Detail: dummy-friendly steps, `youtube-nocookie` embed (or search fallback), safety stripe, **If you are not DIY: here is the sentence to tell the shop instead**, ask-at-the-shop box, related jobs.

## File ownership

- `src/app/guides/**`
- `src/lib/guides/**`
- `src/app/api/guides/**`
- `src/data/youtube-glossary.json`
- `src/config/nav/guides.ts`
- `docs/GUIDES.md`

Do not hang this bay off the header stamp board from this desk. `GUIDES_NAV` is ready when the shell owner wants it.
