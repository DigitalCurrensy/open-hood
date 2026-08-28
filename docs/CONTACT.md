# Contact / the RO window

Route: `/contact`  
API: `POST /api/contact` (status: `GET /api/contact`)

Talk to Open Hood. This is a **repair-advocate window**, not a SaaS demo form. Owners slide the estimate under the glass. We do not book shops, sell the RO, or take a cut.

## Fields

Required: **name** plus **phone or email**, and **consent** (we do not sell the RO). Partnership / press still need a sentence.

Optional: role (owner / DIY / shop / dealer / fleet / other), VIN, year / make / model, mileage, what they need (quote review, symptom, recall, shop find, partnership, press, other), message / paste quote, callback window, JPEG of the estimate.

Photos reuse `compressImageFile` from `@/lib/image` on the phone. Server cap is **4 MB JPEG**.

## Mailer vs local

`GET /api/contact` reports `{ delivery, mailer, toConfigured }` without leaking addresses.

| Env | What happens |
| --- | --- |
| `RESEND_API_KEY` **and** `CONTACT_TO_EMAIL` | Resend sends the ticket (optional `CONTACT_FROM_EMAIL`; reply-to is the owner email). |
| Either key alone, or neither | Persist to `.data/contact-submissions.jsonl` on this machine. Success still returns a **printable summary**. Copy never says “sent to our team.” |

`.data/` is gitignored. Photo bytes are recorded; the raw JPEG is not written into the jsonl.

Naive in-memory rate limit: 6 tickets / 10 minutes / IP.

## File ownership

- `src/app/contact/**`
- `src/app/api/contact/**`
- `src/lib/contact/**`
- `src/config/nav/contact.ts`
- `docs/CONTACT.md`

`CONTACT_NAV_ITEM` / `CONTACT_BRIEF` are ready for the shell. Site-nav may import the stamp. PageBrief reads the brief from `UX_BRIEFS`.
