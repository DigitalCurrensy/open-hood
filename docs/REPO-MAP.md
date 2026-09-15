# What each root file is

The GitHub file list **right column is the last commit that touched the file**, not a description of the contents. `postcss.config.mjs` still says “Ship AutoShield…” because nobody edited PostCSS since the rename. The file itself is current Tailwind 4 config.

| Path | Job |
| --- | --- |
| `README.md` | Public walk + live URL |
| `LICENSE` | MIT, DigitalCurrensy 2026 |
| `AGENTS.md` | Rules for coding agents |
| `CLAUDE.md` | Pointer at AGENTS.md |
| `ROADMAP.md` | Shipped vs paper licenses |
| `package.json` | Next 16.3, React 19, scripts `dev` `test` `lint` `build` |
| `tsconfig.json` | `@/*` → `src/*`. Tests excluded |
| `next.config.ts` | CSP, PWA headers, Turbopack root |
| `eslint.config.mjs` | eslint-config-next |
| `.github/workflows/ci.yml` | test + tsc + lint on `main` |
| `docs/BRAND.md` | Voice and palette |
| `docs/PUBLIC-LAUNCH.md` | Clicks to make the repo public |
| `docs/WHITEPAPER.md` | Category paper |
| `src/` | The product |
| `apps/native` | Optional TestFlight note. Not the demo |
| `public/` | Icons, `og.png`, `sw.js` |

Do not rewrite config files just to change the commit message column.
