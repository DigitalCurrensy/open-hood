# Native / store path

Paper. Not a listing.

Open Hood is a website you can pin. We are **not** on the App Store or the Play Store. Do not put a store badge on the bay. Do not write “Available on the App Store.”

The Expo shell lives in [`apps/native`](../apps/native). It is a sibling package. Optional `npm install` inside that folder only. Root Next `tsconfig` excludes `apps/` so a missing native install cannot break `npm run build`.

## What physics allows today

- **Android Chrome:** Web Bluetooth ELM327 on `/obd`, `/jobs/obd`, `/scan`, and `/mechanic-mode`. Read stored DTCs (Mode 03). Live PIDs on `/scan`. Type-to-quote is `/quote?code=`.
- **iOS Safari:** no Web Bluetooth. Never claim Safari BLE. Type the code from any $20 scanner, **or** use the TestFlight native build when invited (`apps/native` + `react-native-ble-plx`).
- **PWA:** `public/manifest.webmanifest` is `standalone`. Apple touch icon is wired. `PwaBoot` shows the install / share hint. The service worker must not intercept HTML.

## Apple Developer → TestFlight (paper until a binary exists)

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year).
2. Create bundle id `app.openhood.bay`. Enable Bluetooth usage strings (`NSBluetoothAlwaysUsageDescription` is already in `apps/native/app.json`).
3. `cd apps/native && npm install && npx expo prebuild`. Do not hoist Expo to the repo root.
4. EAS profile `preview` (`distribution: internal`). Upload to App Store Connect.
5. Invite **internal testers** on TestFlight. Pair a parked BLE ELM327. Mode 03 → `POST /api/jobs/dtc` → type-to-quote.
6. App Store review is later. No “GET” badge on the website. Never say the app is available on the App Store.

## Play Console → internal track (paper until a binary exists)

1. Play Console one-time fee ($25). Package `app.openhood.bay`.
2. EAS `preview` Android build. Submit to the **internal testing** track only.
3. Testers install from the internal track link. Same Mode 03 → Next API path.
4. Production Play listing is later. A PWA pin is not a Play listing.

## PWA — Add to Home Screen (ships today)

**iPhone / iPad (Safari)**

1. Open the bay in Safari (not Chrome-on-iOS for the pin if you want Apple’s A2HS sheet).
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Confirm **Add**. The icon is `apple-touch-icon`. Display is `standalone`.
5. Safari still has no Web Bluetooth. Type the code, or use TestFlight native if invited.

**Android (Chrome)**

1. Open the bay in Chrome.
2. Menu → **Add to Home screen** / **Install app**, or accept the `PwaBoot` prompt.
3. Chrome on Android can pair a BLE ELM327 on `/obd` and `/scan`.

Same website. Not a store app.

## What is still paper

| Item | Why |
| --- | --- |
| App Store binary | Needs Apple Developer, TestFlight, review. Not this session. Do not claim a listing. |
| Play Store production | Internal track is the honest next step. PWA install is not a Play listing. |
| iOS Safari BLE | Impossible. Core Bluetooth lives in `apps/native` only. |
| Mode 02 freeze-frame | Ask the shop. Not captured on the web desk or this shell. |

Related: [AXIS-100.md](AXIS-100.md) Mobile · [WAVE-PLUS10.md](WAVE-PLUS10.md) · [EXECUTION-BOARD.md](EXECUTION-BOARD.md) WP-40 / WP-41.
