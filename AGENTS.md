<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Contributor notes

- Brand and routes: `docs/BRAND.md`, `docs/WHITEPAPER.md`, `src/lib/brand.ts`, `src/lib/nav.ts`, `README.md`. Product name is **Open Hood**.
- Keep the night-bay identity. Do not generic-SaaS the UI.
- Native `fetch` only. No axios.
- Do not add fake inventory, escrow, or TecDoc. Put those on `ROADMAP.md`.
- Round NHTSA displacement in `src/lib/nhtsa.ts` (`3.0L`, not `3.00`). Do not regress.
- Photo tools stay optional behind `OPENAI_API_KEY` with honest fallback copy.
- After UI changes: exercise the flow in a browser, then `npm run lint && npx tsc --noEmit && npm run build`.
