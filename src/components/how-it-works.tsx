import Link from "next/link";

export function HowItWorks() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["1 · Identify", "VIN is best. No VIN? Year, make, and model. A photo is read on your phone. A plate is a note, not a DMV lookup."],
          ["2 · Translate", "Paste the RO, the noise, or the scanner code. We mark it up in plain English."],
          ["3 · Say it", "Do not authorize until you can read the three-line script at the counter."],
        ].map(([title, body]) => (
          <article key={title} className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <h2 className="font-display text-2xl uppercase tracking-wide text-fluorescent">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-aluminum">{body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="ticket-paper rounded-sm p-6 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">What&apos;s free</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">This bay is free</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
            <li>VIN decode, fluids card, and NHTSA recalls.</li>
            <li>Quote markup from pasted line items (local price book).</li>
            <li>Symptom map, OBD translator, parts search URLs, counter script, build log.</li>
            <li>Photo VIN and quote photos work without a key (compress + Tesseract on your device).</li>
          </ul>
          <p className="mt-4 text-sm leading-6">
            No account. No booking fee. We are not paid by shops.
          </p>
        </article>
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cone">What we are not</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Not another marketplace</h2>
          <p className="mt-3 text-sm leading-6 text-aluminum">
            RepairPal, Openbay, YourMechanic, and dealer apps exist to route you into a shop. Carfax stores history.
            FIXD and Torque sell a dongle. RockAuto sells parts. ShopAdvisor is for the shop, not you.
          </p>
          <p className="mt-3 text-sm leading-6 text-aluminum">
            AutoShield is the person standing next to you at the service writer&apos;s window: factory specs, a grease
            pencil on the ticket, and the sentences to use before you sign.
          </p>
        </article>
      </section>

      <section className="rounded-sm border border-white/10 p-6">
        <h2 className="font-display text-3xl uppercase text-fluorescent">Coming later — not fake buttons</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-aluminum">
          Escrow for a repair, TecDoc / OEM labor times, and live dealer inventory are Phase 2. We will not ship a
          broken &quot;Pay shop&quot; or &quot;In stock at your dealer&quot; control. When those exist, they will work.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          <Link href="/" className="text-ticket">
            Back to the bay
          </Link>
          {" · "}
          <Link href="/mechanic-mode" className="hover:text-ticket">
            Counter script
          </Link>
        </p>
      </section>
    </div>
  );
}
