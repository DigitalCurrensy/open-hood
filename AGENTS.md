<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Open Hood — what this repo is

Owner's advocate. VIN → spec card → marked ticket → three sentences at the window.
Live: https://open-hood.vercel.app
Not a shop. Not Carfax. Not AutoShield (old brand name).

## Contributor notes

- Brand: `docs/BRAND.md`, `src/lib/brand.ts`, `README.md`. Name is **Open Hood**.
- Consumer stamps: Car `/`, Ticket `/quote`, Script `/mechanic-mode`, Ask `/#ask`.
- Lab desks stay folded. Do not put them on the homepage rail.
- Path alias `@/*` → `src/*` is for Next/`tsc` only. `node --test` files must use relative imports and live in `src/**/*.test.ts` (excluded from `tsconfig`).
- Native `fetch` only. No axios.
- Do not add fake inventory, escrow, Motor hours, or Carfax. Those stay on `ROADMAP.md`.
- Honda demo VIN `1HGCM82633A004352` prints **5W-20** and **3.0L**. Do not regress.
- `OPENAI_API_KEY` is optional. 429 → typed tools still answer and the chip says so.
- After UI changes: `npm test && npm run lint && npx tsc --noEmit && npm run build`.
- GitHub About website must be `https://open-hood.vercel.app`, never the dead AutoShield host.
