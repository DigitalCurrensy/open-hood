# Reliability — how Open Hood counts

Route: `/reliability`
Source API: `GET /api/directory/complaints?year=&make=&model=` → NHTSA ODI

Short version: we count who already filed, we divide by how long the car has been on the road, and we let you stamp one vote that never leaves your phone. That is the whole method. It is on the page and it is in this file so nobody has to take our word for it.

## What we measure

Two things, and they do not mix.

1. **The public file.** NHTSA SaferCar complaints on a year, make, and model. A raw count of filings, plus SaferCar's own crash / fire / injured / deaths tallies and the components people named most.
2. **Your vote.** Solid, mixed, or lemon-ish on the nameplate in front of you, with an optional note. Stored in `localStorage` on this browser.

We do not blend them into one number. A federal complaint count and one owner's opinion are different objects.

## Formula

**Filings.** Whatever ODI returns for that year/make/model. No filtering, no de-duping, no re-coding of severity.

**Pace.** `filings ÷ years of the nameplate`, where years = current year − model year, floored at 1. A 2018 nameplate read in 2026 is divided by 8. That is it. The heat words on the ticket (quiet / typical / heavy) are cutoffs at 8 and 25 filings per year — our labels, chosen for the counter, not from a study.

**Local vote.** Solid = 5, mixed = 3, lemon-ish = 1. The panel mean is the plain average of the votes on this device, capped at the last 80. Clearing your browser clears the panel.

**What the formula does not carry.** No vehicles-in-operation. We do not know how many of these cars were sold or are still registered, so pace is per year, never per 100 cars. A million-unit nameplate and a niche one are treated identically. There is no weighting, no sampling frame, and no confidence interval, because there is no sample — there is a pile of self-selected filings.

## What it is not

**Complaint counts, not Consumer Reports.** CR is a magazine we do not license. CR surveys its subscribers, asks about specific systems, and publishes bubbles off a real sample. We count who was annoyed enough to file with the federal government. Those are different populations answering different questions. We will not draw a CR-style bubble, and we will not scrape theirs.

**Not J.D. Power.** No initial-quality or dependability index, no problems-per-100-vehicles, no OEM survey panel. Their numbers are exposure-adjusted. Ours are not.

**Not a diagnosis.** A heavy file means ask a question — "what part, and does mine do that?" — not "this car is broken." A quiet file can mean a good car or a car nobody bothered to write up. Neither is a verdict on the vehicle in your driveway. If we did not decode the VIN, we make no claim about that specific car at all.

## Sources

- **NHTSA ODI / SaferCar** — `api.nhtsa.gov` `complaintsByVehicle`, by year / make / model. Public, free, no key. Counts, crash/fire/injury/death flags, and component labels are carried through exactly as NHTSA published them. We do not audit them.
- **Your browser** — `localStorage` key `openhood.reliability.votes`. No server write, no account, no pooling. We never see your vote.

Nameplate-level, not VIN-level. SaferCar's VIN tools are a link-out from the desk, not our file.

## Why we published this

Because a reliability number with no visible math is a magazine badge, and the whole point of Open Hood is that you should not have to trust a badge.

A journalist, a shop, or an owner should be able to read this page, open the same NHTSA endpoint, do the division by hand, and land on our number. If they cannot, that is a bug and we want to hear about it. If they land on our number and think the division is the wrong division, they can say so with specifics — which is a better argument than either of us guessing.

Related: [DATA-SOURCES.md](DATA-SOURCES.md), [RATING.md](RATING.md), [INTEGRATIONS.md](INTEGRATIONS.md).
