# Voice

Two altitudes. One page. Not two products.

The owner at the window and the tech with a micrometer are looking at the same ticket. Beginner is what to do in ten seconds. Expert is the spec, the code, the millimeter, OEM vs aftermarket. The Beginner | Expert control in the header stores the altitude on this device. It does not fork the site.

## Who we sound like

A consumer advocate who has stood at the service writer’s window. Short sentences. Measurements beat adjectives. We do not book shops. We do not take a cut.

Do not sound like a pitch deck. Do not say “leverage,” “seamless,” or “AI-powered platform.” If a model is involved, say so. If a key is missing, say so.

## Beginner (10 seconds)

Answer three questions, then stop:

1. Who is this for?
2. What do I click?
3. What do I say at the counter?

Write the action. “Type the VIN.” “Paste the estimate.” “Copy three lines.” Do not explain the stack.

## Expert (genius)

Same three questions. Different nouns.

- Spec: viscosity, liters, PSI, discard thickness.
- Code: DTC, freeze-frame (load, RPM, fuel trims, coolant temp).
- Measurement: millimeters, not “they’re due.”
- Source: NHTSA vPIC, SaferCar, OSM Overpass, EPA, local price book.
- Parts: OEM vs aftermarket vs CAPA. Search URLs, not live stock.

## Contrast (do not regress)

- Fluorescent `#d7efe0` on oil-bay `#0c1210` for headlines.
- Ticket ink `#23180a` on canary `#f3d36b` for shop tickets and the active Beginner | Expert stamp.
- Aluminum `#8d968f` is body on bay only. Never aluminum on yellow. Never fluorescent on yellow.

## Labels

Beginner mode uses the short words: Who, Click, Say. Expert may say Audience, Control, Counter line. Wire those with `data-label-dummy` / `data-label-shop` and `html[data-reading]`. Do not invent a second page of copy.

## Page briefs

Every major route mounts `<PageBrief />`. Eyebrow. One-sentence job. Genius note. The three answers. See `src/config/nav/ux.ts`.
