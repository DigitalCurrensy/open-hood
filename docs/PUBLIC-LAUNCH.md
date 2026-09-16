# Public portfolio — operator checklist

As of **16 September 2026**. Code cannot flip GitHub visibility from here.

## Already done

- Live origin: **https://open-hood.vercel.app** (not the dead AutoShield host)
- GitHub About website points at that origin
- `main` only (merged wave branches deleted)
- CI green: test + tsc + lint
- Branch ruleset **Protect main**: no delete, no force-push, required check `check`; DigitalCurrensy may bypass
- `OPENAI_API_KEY` **removed** from Vercel Production. Ask is typed tools. Confirm: `GET /api/agent` → `keyOn: false`
- README walk + `docs/shots/` captures of the waiting-room pages
- MIT, original repo (not a fork)

## You still click

1. Phone incognito: demo Honda → Ask `$89 cabin filter` → copy lines.
2. Settings → General → Danger Zone → **Change repository visibility → Public**.
3. Open the repo logged out. Confirm README images and the live link.

There is no “public, no forks” on a user MIT repo. Forks get source, not Vercel env.

## Secrets

- Do not commit `.env.local`.
- Do not put `OPENAI_API_KEY` back on Production unless: separate OpenAI project, hard monthly cap ($5–$10), allow-list `gpt-4o` only, then redeploy.
- Revoke any OpenAI key that ever sat in a screenshot.

## Optional after public

- Record a 90-second vertical phone walk; paste the URL under the README walk.
- Custom domain later. Not required for the portfolio piece.
- Ten consented owners is GTM, not a git setting.
