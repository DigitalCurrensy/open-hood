# Open Hood native (`apps/native`)

Sibling Expo shell. Optional install. Do not hoist this into the Next root `package.json` — that would break `npm run build`.

This folder is the **store path**, not a store listing.

- Not available on the App Store.
- Not on the Play Store.
- Expo Go cannot load `react-native-ble-plx`. You need a development build, TestFlight, or a Play internal track.

iOS Safari has **no Web Bluetooth**. Type the code on the website, or use this native build when invited. Never claim Safari BLE.

## What it does

1. Scan for a BLE ELM327 (Nordic UART / FFE0 / FFF0 — same UUIDs as `src/lib/obd/bluetooth.ts`).
2. `ATZ` → `ATE0` → optional `ATL0` `ATS0` `ATH0` `ATSP0`.
3. Mode 03 stored DTCs.
4. `POST { code }` to the same Next route: `/api/jobs/dtc`.
5. Type-to-quote opens `/quote?code=` on that origin.

Classic SPP ELM327 pucks stay in Car Scanner / Torque. This shell is BLE only. Park first.

## Optional install (never at repo root)

```bash
cd apps/native
cp .env.example .env
# Physical phone: EXPO_PUBLIC_BAY_ORIGIN=http://<your-lan-ip>:3000
npm install
npx expo install --fix
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

Root Next `tsconfig.json` already excludes `apps/`. Root ESLint ignores `apps/**`. A missing `node_modules` here does not fail `npm run build`.

## Distribution (paper until a binary exists)

| Track | How | Do not say |
| --- | --- | --- |
| TestFlight | Apple Developer ($99/yr) → bundle `app.openhood.bay` → EAS `preview` → internal testers | “Available on the App Store” |
| Play internal | Play Console ($25) → package `app.openhood.bay` → EAS submit `preview` / internal track | “Get it on Google Play” |
| PWA | Website: iPhone Share → Add to Home Screen. Android Chrome → Add to Home screen | Store badge |

App Store / Play production review is later. No GET badge on the website.

See [docs/NATIVE.md](../../docs/NATIVE.md).
