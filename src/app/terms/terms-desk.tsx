import { BayLink } from "@/components/bay-link";
import type { ReactNode } from "react";
import { COUNSEL_REVIEW_LINE, LEGAL_EFFECTIVE, PRIVACY_ROUTE } from "@/config/nav/legal";
import "./legal.css";

interface Clause {
  n: string;
  title: string;
  body: ReactNode[];
}

const MONO = "font-mono text-[12px] text-fluorescent";

const CLAUSES: Clause[] = [
  {
    n: "01",
    title: "The deal",
    body: [
      <>
        These terms took effect {LEGAL_EFFECTIVE}. Reading a spec card, pasting a quote, or searching a ZIP here
        means you accept them. If you do not accept them, close the tab. There is no account to cancel and no
        invoice to settle.
      </>,
    ],
  },
  {
    n: "02",
    title: "What this bay does",
    body: [
      <>
        We decode a VIN, print the factory fluid and spec card, translate recall campaigns and trouble codes, mark
        up a quote you paste or photograph, and hand you a few sentences to say at the counter. That is the whole
        job. Open Hood works for the owner.
      </>,
    ],
  },
  {
    n: "03",
    title: "What this bay does not do",
    body: [
      <>
        We do not book a bay. We do not write, sign, or sell the dealer repair order. We take no cut of your
        repair, and no shop pays us for your name. There is no lead auction and no &ldquo;partners in your
        area.&rdquo;
      </>,
    ],
  },
  {
    n: "04",
    title: "Not an inspection, not a tech, not a lawyer",
    body: [
      <>
        Open Hood is not a licensed vehicle inspection, not a diagnosis, and not legal advice. We have never had
        your car on a lift. Nothing here replaces a technician with hands on the vehicle, and nothing here
        replaces a lawyer if a repair turns into a claim.
      </>,
    ],
  },
  {
    n: "05",
    title: "Numbers are estimates",
    body: [
      <>
        Prices, labor bands, and service intervals are estimates built from public data and our own price book. We
        do not carry Motor labor times, Carfax files, or TecDoc part numbers, and we will not print a number as if
        we do. Treat every figure as a question to ask at the window, not a fact to sign.
      </>,
    ],
  },
  {
    n: "06",
    title: "The demo VIN",
    body: [
      <>
        <span className={MONO}>1HGCM82633A004352</span> is a sample Honda we use so the bay is not empty on the
        first visit. It is an example. It is not your car. Read the VIN off your own dash or door jamb before you
        act on anything.
      </>,
    ],
  },
  {
    n: "07",
    title: "You still decide at the window",
    body: [
      <>
        Measurements beat adjectives. Ask for the failed part, the reading that condemned it, and the out-the-door
        number in writing. If the shop disagrees with our sheet, that is a conversation, not a verdict — and the
        signature on the ticket is yours, not ours.
      </>,
    ],
  },
  {
    n: "08",
    title: "Fair use of the bay",
    body: [
      <>
        Use it for your own vehicles, or the vehicle in front of you. Do not scrape this bay to stock someone
        else&apos;s shop system, resell our output as a paid inspection or a title report, or pass it off as your
        own product.
      </>,
      <>
        Do not hammer our routes to pull NHTSA, the EPA, or OpenStreetMap in bulk. Those sources are public — go
        to them directly and follow their terms. Do not upload documents or photos you have no right to send, and
        do not use the RO window to send us anything unlawful.
      </>,
    ],
  },
  {
    n: "09",
    title: "What you send us",
    body: [
      <>
        A photo is resized and compressed on your own phone before anything moves. When you send a quote or a
        message through the RO window, you are telling us we may read it in order to answer you. We do not sell
        it, list it, or hand it to a shop network.
      </>,
      <>
        Do not send a Social Security number, a card number, or anything you would not read out loud at the
        counter. What we do with the rest is written out on the{" "}
        <BayLink href={PRIVACY_ROUTE} className="text-ticket hover:text-fluorescent">
          privacy page
        </BayLink>
        .
      </>,
    ],
  },
  {
    n: "10",
    title: "Names and data that belong to others",
    body: [
      <>
        Recall text, complaints, and safety ratings come from NHTSA. Mileage comes from the EPA. Rooftops come
        from OpenStreetMap contributors. Manufacturer, part, and shop names belong to those companies. We use them
        to identify a car or a part — not to claim we are them, speak for them, or represent them.
      </>,
    ],
  },
  {
    n: "11",
    title: "No warranty",
    body: [
      <>
        The bay is provided as it sits, without warranty of any kind. Public feeds go down, map records go stale,
        and a decoder can miss a trim. We work to keep it honest, and we would rather print &ldquo;we do not
        know&rdquo; than a confident wrong answer — but we cannot promise the bay is complete, current, or right
        for your specific car.
      </>,
    ],
  },
  {
    n: "12",
    title: "Limitation of liability",
    body: [
      <>
        To the fullest extent the law allows, Open Hood is not liable for repair costs, downtime, a decision a
        shop or a writer made, or any loss that follows from something you read here. This bay is free and takes
        no card, so our total liability for any claim is capped at what you paid us — nothing — or the smallest
        amount the law will allow.
      </>,
      <>
        Some states do not permit these limits. Where that is true, they apply only as far as that state allows,
        and nothing here waives a right you cannot legally waive.
      </>,
    ],
  },
  {
    n: "13",
    title: "Changes, and the door",
    body: [
      <>
        We may update these terms. The effective date at the top moves when we do, and a material change gets its
        own line on this page. We may also close a desk or the whole bay. Because nothing of yours is stored on
        our side, there is nothing of yours to lose when we do.
      </>,
    ],
  },
  {
    n: "14",
    title: "Disputes — write first",
    body: [
      <>
        Write to us before anything else. Most complaints here are a wrong spec or a bad number, and those get
        fixed the same week. We have not named a court or an arbitration forum, and we will not invent one: when
        Open Hood has a registered entity and counsel signs off on a venue, it gets posted on this page before it
        applies to you.
      </>,
    ],
  },
];

const SHORT_VERSION = [
  "Free. No account. Nothing to cancel.",
  "We do not book the bay, write the dealer RO, or take a cut of the repair.",
  "We are not your inspector, your technician, or your lawyer.",
  "Every number here is an estimate you take to the counter as a question.",
  "Measurements beat adjectives — you still decide at the window.",
];

export function TermsDesk() {
  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] uppercase leading-5 tracking-[0.12em] text-ticket">{COUNSEL_REVIEW_LINE}</p>
      <section className="ticket-paper rounded-sm p-6 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Customer copy</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none">The short version</h2>
        <div className="legal-perforation my-4 opacity-40" />
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
          {SHORT_VERSION.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em]">
          Effective {LEGAL_EFFECTIVE} · the clauses below are the whole agreement
        </p>
      </section>

      <ol className="space-y-3">
        {CLAUSES.map((clause) => (
          <li key={clause.n}>
            <article
              id={`clause-${clause.n}`}
              className="legal-clause legal-carbon rounded-sm border border-white/10 p-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
                {clause.n} · Terms
              </p>
              <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
                {clause.title}
              </h3>
              <div className="mt-2 max-w-3xl space-y-3 text-sm leading-6 text-aluminum">
                {clause.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ol>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Reach the desk</p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
          Something here is wrong? Say so
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          A bad spec, a stale recall, a number that does not match your ticket — send it through the RO window and
          we fix the bay. That window is also how you ask us to delete a ticket you already sent.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          <BayLink href="/contact" className="text-ticket hover:text-fluorescent">
            Talk to Open Hood
          </BayLink>
          {" · "}
          <BayLink href={PRIVACY_ROUTE} className="hover:text-ticket">
            Privacy
          </BayLink>
          {" · "}
          <BayLink href="/how-it-works" className="hover:text-ticket">
            How it works
          </BayLink>
        </p>
      </section>
    </div>
  );
}
