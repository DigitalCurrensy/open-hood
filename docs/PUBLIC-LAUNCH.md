# Make Open Hood a public portfolio repo

This file is the operator checklist. Code cannot flip GitHub visibility or Vercel from here.

## 1. Fix the About box (do this first)

GitHub → **open-hood** → gear next to **About**

| Field | Set this |
| --- | --- |
| Description | Owner's car book: VIN → spec card → marked-up repair order → three sentences at the window. Not a shop. Not Carfax. |
| Website | `https://open-hood.vercel.app` |
| Topics | `automotive` `nextjs` `typescript` `vercel` `nhtsa` `vin` `consumer-protection` `repair` `pwa` `openai` |

Delete `autoshield-ai-psi.vercel.app`. That URL 404s.

## 2. Green the live site

GitHub sidebar currently shows **Preview** and **Production** red, and an old green “Production – open-hood” from weeks ago. Latest `main` is not what strangers hit until Vercel production is green on the newest commit.

1. Vercel → project **open-hood** → latest failed production → read the build log.
2. Common cause: TypeScript / lint on a wave commit, or missing env on Production.
3. Redeploy **Production** from `main` at `54f80a9` or newer (`portfolio-public`).
4. Confirm https://open-hood.vercel.app shows **Owner tools** + **Lab desks**, not only **More tools**.

## 3. GitHub Actions

This branch adds `.github/workflows/ci.yml` (`npm test`, `tsc`, `lint`). After merge, **Actions** must be enabled on the repo (Settings → Actions → Allow).

The red **0/1** on `main` today is a Vercel GitHub Check, not Actions — there was no workflow file.

## 4. Delete merged branches

On Branches, delete:

`demo-skin-ask` `harden-rt28` `plus10-council` `premium-desks` `dense-wave-2` `dense-wave-3` `portfolio-public` (after merge)

Keep `main` only.

## 5. Make it public (not a fork)

This repo is already an original (`DigitalCurrensy/open-hood`), not a fork. Good.

Settings → General → Danger Zone → **Change repository visibility** → Public.

Public repos can be forked by anyone. GitHub does not offer “public, no forks” on a user repo. If you need no-forks, stay private and share a live demo + this README.

## 6. Screenshots for the README

After production is green and the install banner is gone:

1. Hard-refresh `/` → dismiss any leftover banner once.
2. Capture: Home+Ask, Honda loaded, `$89 cabin` answer, `/quote`, `/obd`, `/shops`.
3. Drop PNGs in `docs/shots/` as `01-home.png` … and link them from README.

Until those files exist, README uses `/og.png` and live URLs. Do not commit someone else's cars.

## 7. Secrets that must stay out of git

- `OPENAI_API_KEY` lives on Vercel only.
- No `.env.local` in the tree.
- If you public the repo, rotate any key that ever sat in a screenshot.
