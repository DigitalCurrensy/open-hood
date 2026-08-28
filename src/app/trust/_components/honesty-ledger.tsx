import { SessionProof } from "@/app/trust/_components/session-proof";
import { TRUST_HONESTY, TRUST_LANE_CHIPS, TRUST_METHOD_LINES } from "@/app/trust/_components/honesty";
import { BayLink } from "@/components/bay-link";
import { SOURCE_LEGEND } from "@/components/report/methodology";
import type { ConsentedPublicQuote } from "@/lib/contact/types";
import "../trust.css";

export function HonestyLedger({
  ticketsOnThisBay,
  quotes,
}: {
  ticketsOnThisBay: number;
  quotes: readonly ConsentedPublicQuote[];
}) {
  return (
    <div className="space-y-4">
      <section aria-label="Honesty ledger" className="trust-carbon rounded-sm border border-white/10 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Ledger · this bay</p>
        <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-fluorescent">We do not mint testimonials</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          Zero users and zero reviews is the honest number. There is no review widget to grow into. A counsel hologram
          would be a lie — hire outside review. Nobody here signed plate-to-VIN, DPPA, live charges, or a courtroom
          venue. A checkbox is not a lawyer.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stamp label="Users" value={String(TRUST_HONESTY.users)} hint="No accounts. No headcount." />
          <Stamp label="Reviews" value={String(TRUST_HONESTY.reviews)} hint="No star wall. No invented quote." />
          <Stamp label="Counsel" value="No stamp" hint="Hire outside review. Not approved. No hologram." />
        </div>

        <p className="mt-4 border-l-2 border-cone pl-3 font-mono text-[12px] uppercase leading-5 tracking-[0.12em] text-fluorescent">
          Not legal advice. Not a licensed inspector. Not a shop.
        </p>
      </section>

      <section aria-label="Proof on this machine" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Proof · counted, not invented</p>
        <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-fluorescent">What this bay can prove</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          Tickets are lines in a gitignored jsonl on this machine. Flagged quotes live in this browser. The service
          worker kill switch is a real href. If the number is zero, we print zero.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stamp
            label="Tickets on this bay"
            value={String(ticketsOnThisBay)}
            hint={`Non-empty lines in ${TRUST_HONESTY.ticketsStore}. Emailed tickets are not in this file.`}
          />
          <SessionProof />
          <div className="trust-stamp rounded-sm border border-white/12 bg-bay/70 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">SW unlock</p>
            <p className="mt-1 font-display text-4xl uppercase leading-none text-fluorescent">Available</p>
            <p className="mt-2 text-sm leading-5 text-aluminum">
              Unregisters a leftover worker.{" "}
              <BayLink href={TRUST_HONESTY.unlockHref} className="text-ticket hover:text-fluorescent">
                {TRUST_HONESTY.unlockHref}
              </BayLink>
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Consented quotes" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Wall · consented names only</p>
        <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-fluorescent">First shops / first owners</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          Reply on{" "}
          <BayLink href="/contact" className="text-ticket hover:text-fluorescent">
            /contact
          </BayLink>{" "}
          and tick consent to be named. We print only jsonl rows with that box on. We will not invent a shop, an
          owner, or a quote. Reviews stay {TRUST_HONESTY.reviews} until a real review exists — these notes are not
          stars.
        </p>
        {quotes.length === 0 ? (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Named quotes · 0</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {quotes.map((row) => (
              <li key={row.id} className="rounded-sm border border-white/10 bg-bay/50 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">
                  {row.role} · {row.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-fluorescent">{row.quote}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Counsel" className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Counsel · hire outside review</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none">Awaiting outside review</h2>
        <p className="mt-3 text-sm leading-6">
          Hire outside counsel for DPPA, plate ToS, live charges, and a courtroom venue. A checkbox on /contact is
          not a lawyer. That is not “approved by counsel.” There is no hologram and no counsel-signed badge.
        </p>
        <p className="mt-3 text-sm leading-6">
          Read the paper we did print:{" "}
          <BayLink href={TRUST_HONESTY.termsHref} className="underline">
            /terms
          </BayLink>{" "}
          and{" "}
          <BayLink href={TRUST_HONESTY.privacyHref} className="underline">
            /privacy
          </BayLink>
          .
        </p>
      </section>

      <section aria-label="Thirty seconds at the window" className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">At the window · 30 seconds</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none">How to use this</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
          <li>Read the three-line script out loud. That is the product — not a booking.</li>
          <li>Point at a flagged line. Ask for millimeters, not &quot;due.&quot;</li>
          <li>If they price a part, name the job. We do not sell the SKU. OSM is a map, not a dispatch.</li>
        </ol>
        <p className="mt-4 text-sm leading-6">
          RepairPal would have routed this. YourMechanic would have sent a person. You walked in with a script.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">How a number is judged</p>
          <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">Method</h3>
          <ol className="mt-3 space-y-3">
            {TRUST_METHOD_LINES.map((row) => (
              <li key={row.stamp}>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{row.stamp}</p>
                <p className="mt-1 text-sm leading-6 text-aluminum">{row.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Service worker trap</p>
          <h3 className="mt-1 font-display text-3xl uppercase leading-none">:3000 is the live bay</h3>
          <p className="mt-3 text-sm leading-6">
            A leftover <span className="font-mono">next start</span> on{" "}
            <span className="font-mono">{TRUST_HONESTY.leftoverOrigin}</span> once painted WI-FI DROPPED onto every
            stamp. Do not stay on :3100.
          </p>
          <p className="mt-3 text-sm leading-6">
            Kill switch unregisters the worker and sends you home:{" "}
            <BayLink href={TRUST_HONESTY.unlockHref} className="underline">
              {TRUST_HONESTY.unlockHref}
            </BayLink>
            . Live desk is{" "}
            <a href={TRUST_HONESTY.liveOrigin} className="underline">
              {TRUST_HONESTY.liveOrigin}
            </a>
            .
          </p>
        </aside>
      </div>

      <section aria-label="Heuristic confidence" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Confidence · source lanes</p>
        <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">Catalog vs heuristic vs NHTSA vs regex</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          Every number on this bay wears one of these. Heuristic is allowed. Heuristic labeled catalog is a lie.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {TRUST_LANE_CHIPS.map((chip) => (
            <li
              key={chip.id}
              className={`trust-lane rounded-sm border border-white/12 bg-bay/60 px-3 py-3 ${chip.id === "heuristic" ? "trust-lane-warn" : ""}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{chip.stamp}</p>
              <p className="mt-1 text-sm leading-6 text-aluminum">{chip.meaning}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-4 space-y-1 text-xs leading-5 text-aluminum">
          {SOURCE_LEGEND.filter((chip) => !TRUST_LANE_CHIPS.some((lane) => lane.id === chip.id)).map((chip) => (
            <li key={chip.id}>
              <span className="font-mono uppercase tracking-wide text-ticket">{chip.stamp}</span>
              {" — "}
              {chip.meaning}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stamp({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="trust-stamp rounded-sm border border-white/12 bg-bay/70 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">{label}</p>
      <p className="mt-1 font-display text-4xl uppercase leading-none text-fluorescent">{value}</p>
      <p className="mt-2 text-sm leading-5 text-aluminum">{hint}</p>
    </div>
  );
}
