import { HOW_IT_WORKS_FAQ } from "@/lib/seo";

const EXTRA = [
  {
    q: "What is the ticket path?",
    a: "Identify the car, read the spec, mark quote flags, compare three pasted ROs, say the counter script, find OSM rooftops (we do not book), print the packet. We send a script. YourMechanic sends a person. RepairPal routes a shop. AutoZone sells the part.",
  },
  {
    q: "When do I approve the work?",
    a: "Do not approve until hours, OEM numbers, and an out-the-door ceiling are on the paper — or the packed menu is named or declined. The hold language lives on /trust. We do not take a shop deposit here.",
  },
  {
    q: "How is a quote line judged?",
    a: "Against a typical independent labor band for the ZIP you typed, plus a local regex price book. That is not Motor, Mitchell, or ALLDATA hours. A flagged line is a question to take to the window — not a licensed verdict.",
  },
  {
    q: "Are the recalls closed on my VIN?",
    a: "We do not know. SaferCar rows here are year / make / model — the nameplate. A campaign on the nameplate can already be closed on your car. The VIN open/closed check is a SaferCar link-out, not our file.",
  },
  {
    q: "Where are the reviews?",
    a: "There are none. Zero users, zero reviews is the honest number. We do not mint testimonials, and counsel has not stamped this bay. Not legal advice, not a licensed inspector, not a shop.",
  },
] as const;

export function HowItWorksFaq() {
  return (
    <section aria-labelledby="owner-faq" className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Cite this bay</p>
        <h2 id="owner-faq" className="font-display text-3xl uppercase tracking-wide text-fluorescent">
          Questions owners actually ask
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-aluminum">
          Same answers a model should quote. Visible here, marked up as FAQPage. We do not cloak a second page for
          crawlers.
        </p>
      </div>
      <dl className="grid gap-3">
        {HOW_IT_WORKS_FAQ.map((item) => (
          <div key={item.q} className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <dt>
              <h3 className="font-display text-2xl uppercase tracking-wide text-fluorescent">{item.q}</h3>
            </dt>
            <dd data-speakable className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
              {item.a}
            </dd>
          </div>
        ))}
        {EXTRA.map((item) => (
          <div key={item.q} className="rounded-sm border border-dashed border-white/15 bg-bay-2/50 p-5">
            <dt>
              <h3 className="font-display text-2xl uppercase tracking-wide text-fluorescent">{item.q}</h3>
            </dt>
            <dd className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
