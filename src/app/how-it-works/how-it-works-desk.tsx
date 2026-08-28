import Link from "next/link";
import { GENIUS_EXTRAS } from "@/config/nav/ux";

const VERSUS = [
  ["RepairPal / Openbay", "Route you into a shop. We hand you the sentence and you call."],
  ["YourMechanic / Wrench", "Send a person and take a cut. We send a script. No driveway dispatch."],
  ["AutoZone", "Sell the SKU. We name the job and hold the converter until you diagnose."],
  ["Carfax", "Paid history jacket. We assemble NHTSA and link out. We do not invent wrecks."],
  ["Motor / TecDoc", "Licensed hours and interchange. We do not pretend to own the book."],
] as const;

export function HowItWorksDesk() {
  return (
    <div className="space-y-8">
      <section aria-label="What we are not" className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <article className="ticket-paper rounded-sm p-6 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">The job</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">Advocate at the window</h2>
          <p className="mt-4 text-sm leading-6">
            Factory specs in plain English. A grease pencil on the ticket. Three lines you can say before you sign.
            The yellow strip above is the operating path — not a brochure. Walk it, then print the packet.
          </p>
          <p className="mt-3 text-sm leading-6">
            A cart or a shop marketplace would make us RepairPal with a night-bay coat of paint. We will not grow
            one. OSM rooftops are a map, not a booking aisle. Compare-3 waits empty for three pastes, then flags —
            no buy — on{" "}
            <Link href="/quote#compare-3" className="underline">
              /quote#compare-3
            </Link>
            . Do not approve until you can say the hold line.
          </p>
        </article>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">They sell a transaction</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">We sell a sentence</h2>
          <ul className="mt-4 space-y-3">
            {VERSUS.map(([name, body]) => (
              <li key={name}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">{name}</p>
                <p className="mt-1 text-sm leading-6 text-aluminum">{body}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section aria-label="Expert extras" className="grid gap-3 md:grid-cols-3">
        {GENIUS_EXTRAS.map((extra) => (
          <article
            key={extra.stamp}
            data-walk="genius"
            className="rounded-sm border border-white/10 bg-bay-2/80 p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Expert path</p>
            <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
              {extra.stamp}
            </h3>
            <p className="mt-2 text-sm leading-6 text-aluminum">{extra.body}</p>
            <Link
              href={extra.href}
              className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket hover:text-fluorescent"
            >
              Open desk
            </Link>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="ticket-paper rounded-sm p-6 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">What&apos;s free</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">This bay is free</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
            <li>VIN decode, fluids card, and NHTSA recalls.</li>
            <li>Quote markup from pasted line items — and three ROs on one flag board. No buy button.</li>
            <li>Symptom map, OBD translator, parts search URLs, counter script, build log.</li>
            <li>Photo VIN and quote photos work on this device — we shrink the photo first.</li>
          </ul>
          <p className="mt-4 text-sm leading-6">No account. No booking fee. We are not paid by shops.</p>
        </article>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Method · not a verdict</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">How a line is judged</h2>
          <p className="mt-3 text-sm leading-6 text-aluminum">
            A quote flag is a typical independent band for the ZIP, plus a regex book. Not Motor. Recalls are
            SaferCar year / make / model — the nameplate — not a VIN closeout. Heuristic specs can be wrong. The
            door jamb wins.
          </p>
          <p className="mt-3 text-sm leading-6 text-aluminum">
            Live desk is{" "}
            <span className="font-mono text-fluorescent">localhost:3000</span>. A leftover worker on :3100 once
            painted WI-FI DROPPED onto every stamp. Kill switch:{" "}
            <Link href="/?unlock=1" className="text-ticket hover:text-fluorescent">
              /?unlock=1
            </Link>
            .
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="ticket-paper rounded-sm p-6 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Authorization hold</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">Do not approve until</h2>
          <p className="mt-4 text-sm leading-6">
            Hours and OEM numbers are on the RO. The packed menu is named or declined. You can say the three-line
            script at the window. A hold here is a sentence — not a shop deposit.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em]">
            <Link href="/trust#hold" className="underline">
              Open /trust · hold
            </Link>
            {" · "}
            <Link href="/quote#compare-3" className="underline">
              Compare three ROs
            </Link>
          </p>
        </article>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">Advocate OS · the MVP</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Script, not a cart</h2>
          <p className="mt-3 text-sm leading-6 text-aluminum">
            RepairPal routes. YourMechanic sends a person. AutoZone sells the SKU. Growing a cart, a book-this-shop
            button, or a dispatch cut would drop uniqueness to zero. The OS is the ticket path.
          </p>
        </article>
      </section>

      <section className="rounded-sm border border-white/10 p-6">
        <h2 className="font-display text-3xl uppercase text-fluorescent">Coming later — not fake buttons</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-aluminum">
          Escrow for a repair, TecDoc / OEM labor times, and live dealer inventory are Phase 2. We will not ship a
          broken &quot;Pay shop&quot; or &quot;In stock at your dealer&quot; control. When those exist, they will
          work. They will still not be a marketplace we take a cut from.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          <Link href="/" className="text-ticket">
            Back to the bay
          </Link>
          {" · "}
          <Link href="/mechanic-mode" className="hover:text-ticket">
            Counter script
          </Link>
          {" · "}
          <Link href="/directory" className="hover:text-ticket">
            OSM rooftops
          </Link>
          {" · "}
          <Link href="/trust#hold" className="hover:text-ticket">
            Do not approve until /trust
          </Link>
        </p>
      </section>
    </div>
  );
}
