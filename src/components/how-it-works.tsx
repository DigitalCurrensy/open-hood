import Link from "next/link";
import { TicketPath } from "@/app/_components/ticket-path";

const VERSUS = [
  ["RepairPal / Openbay", "Route you into a shop. We send a script."],
  ["YourMechanic / Wrench", "Send a person and take a cut. We send a script."],
  ["AutoZone", "Sell the SKU. We name the job."],
  ["Carfax", "Sell a paid history jacket. We link out."],
  ["Motor / TecDoc", "License the hours we do not pretend to own."],
] as const;

export function HowItWorks() {
  return (
    <div className="space-y-8">
      <TicketPath />

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
          <p className="mt-4 text-sm leading-6">
            No account. No booking fee. We are not paid by shops. The product is the ticket path — the advocate OS.
            A cart would erase it. Do not approve until hours and OEM numbers are on the paper.
          </p>
        </article>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">What we are not</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Not another marketplace</h2>
          <ul className="mt-3 space-y-2">
            {VERSUS.map(([name, body]) => (
              <li key={name} className="text-sm leading-6 text-aluminum">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ticket">{name}</span>
                <span className="mt-0.5 block">{body}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-aluminum">
            Open Hood is the person standing next to you at the service writer&apos;s window: factory specs, a grease
            pencil on the ticket, and the sentences to use before you sign.
          </p>
        </article>
      </section>

      <section className="rounded-sm border border-white/10 p-6">
        <h2 className="font-display text-3xl uppercase text-fluorescent">Try a live desk</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-aluminum">
          Every stamp below is an open bay. No hash, no empty stub. Live origin is localhost:3000 — not :3100. If a
          leftover worker painted WI-FI DROPPED, open{" "}
          <Link href="/?unlock=1" className="text-ticket hover:text-fluorescent">
            /?unlock=1
          </Link>
          .
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["/?vin=1HGCM82633A004352", "Demo VIN"],
              ["/directory/90210", "90210 rooftops"],
              ["/guides/oil-change", "Oil change"],
              ["/guides/cabin-filter", "Cabin filter"],
              ["/obd/P0420", "P0420"],
              ["/agent", "Ask the advocate"],
              ["/quote#compare-3", "Compare 3 ROs"],
              ["/mechanic-mode", "Counter script"],
              ["/trust#hold", "Do not approve"],
              ["/report", "Print packet"],
            ] as const
          ).map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-block rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ticket hover:border-ticket/50 hover:text-fluorescent"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-sm border border-white/10 p-6">
        <h2 className="font-display text-3xl uppercase text-fluorescent">Coming later — not fake buttons</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-aluminum">
          Escrow for a repair, TecDoc / OEM labor times, and live dealer inventory are Phase 2. We will not ship a
          broken &quot;Pay shop&quot; or &quot;In stock at your dealer&quot; control. When those exist, they will work.
          They will still not be a marketplace.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          <Link href="/" className="text-ticket">
            Back to the bay
          </Link>
          {" · "}
          <Link href="/directory" className="hover:text-ticket">
            OSM rooftops
          </Link>
          {" · "}
          <Link href="/guides" className="hover:text-ticket">
            Guides
          </Link>
          {" · "}
          <Link href="/agent" className="hover:text-ticket">
            Advocate
          </Link>
        </p>
      </section>
    </div>
  );
}
