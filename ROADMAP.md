# Roadmap

Live demo: https://open-hood.vercel.app
CI on `main` is test + tsc + lint. Vercel production deploys from `main`.

User-visible outcomes only. If it is not on a page, it is not done.

## Now (shipped)

- Waiting-room path: Ask on `/`, Car, Ticket, Script.
- Demo VIN `1HGCM82633A004352` — 2003 Honda Accord, oil 5W-20, 3.0L.
- Spoken quote: “They quoted $89 for a cabin filter” → book line + three copy lines.
- Identify from VIN, on-device photo OCR, or year/make/model.
- Fluids / PSI / filter card. Catalog book on `/catalog`.
- Paste or photo a repair order. Typical-hour flags. No Motor hours.
- Noise → shop questions. OBD code from any $20 scanner.
- NHTSA nameplate recalls + dealer script. VIN open/closed is a SaferCar check.
- Parts search URLs (not stock). Maps shop stub (no booking cut).
- Ask API: tools first; model only if OpenAI returns 200. Safety lanes first.

## Next (code — not a license)

- Quote memory — last two marked tickets.
- One-page glove-box printout.
- Shop notes the owner types. Still not RepairPal.
- More P1xxx codes with “print the factory title.”

## Later — licensed pipes

Paper until a signed contract. We have not signed Chrome, Motor, Carfax, Consumer Reports, or TecDoc.

- Escrow / pay-the-shop
- TecDoc / OEM labor times
- Chrome Data / Monroney
- Carfax / NMVTIS file
- VIN-true recall open/closed (public `recallsByVin` is 403)
- Live dealer inventory
- Store apps / iOS BLE

No control that looks live and is not.
