# Brand

Night service bay. Not a SaaS dashboard. Not a Saturday meetup.

**Open Hood**  
Know the car. Then the window.

## Lockup

| Slot | Line |
| --- | --- |
| Name | Open Hood |
| Tagline | Know the car. Then the window. |
| Kicker | Owner's book · not a shop |
| Promise | Factory specs in plain English. Don't authorize until you can say this at the counter. |
| CTA | Type the VIN |
| CTA 2 | Paste the estimate |

## What it is

The car book you use when the hood is up or the light is on: oil, codes, recalls, what a job usually costs, what to say at the shop. We don't book the bay. We don't take a cut.

## What it isn't

Not a Saturday meetup. Not a shop. Not a warranty. Not Carfax. Not three quotes so someone gets the job. Not Cars & Coffee, not “hoods up,” not a club.

## Voice

Write like a consumer advocate who has stood at the service writer's window.

- Factory specs in plain English.
- Don't authorize until you can say this at the counter.
- Measurements beat adjectives. “They're due” is not a millimeter reading.
- We do not book shops. We do not take a cut.
- Failure and empty states tell the owner what to do next. They do not apologize.
- Photos get compressed and read on the phone. A missing API key is not a dead button.

Do not sound like a pitch deck. Do not say “leverage,” “seamless,” or “AI-powered platform.” If a model is involved, say so. If a key is missing, say so.

Never: hoods up, cars and coffee, meet, cruise, club, bring yours, see you in the lot, book now, partner shops, network, get quotes, we found you a match.

## Palette

| Token | Hex | Job |
| --- | --- | --- |
| Oil-bay | `#0c1210` | Background |
| Bay-2 | `#151e1a` | Cards |
| Fluorescent | `#d7efe0` | Headlines |
| Aluminum | `#8d968f` | Body |
| Canary ticket | `#f3d36b` | Shop tickets, primary buttons |
| Ticket ink | `#23180a` | Type on yellow |
| Grease | `#b42318` | Markup rings |
| Cone orange | `#e85d04` | Safety stripe, kickers |

Display: Big Shoulders Stencil. Body: Barlow. Data: IBM Plex Mono.

## Do

- Stencil titles, stamp-style nav, NCR-yellow tickets, grease-pencil rings.
- Two columns from `md` up when the desk has an input and a copy.
- Honest “coming later” copy instead of dead buttons.

## Don't

- Generic gradient hero, Inter, or a marketing-site card grid with stock photos.
- Fake “in stock,” “book now,” or “pay shop.”
- Invent a Bluetooth dongle, TecDoc hours, escrow, or a plate-to-VIN lookup.

## Source of truth

Copy constants live in `src/lib/brand.ts`. Positioning paper: [WHITEPAPER.md](WHITEPAPER.md).
