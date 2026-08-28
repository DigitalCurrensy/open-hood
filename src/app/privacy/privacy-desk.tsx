import { BayLink } from "@/components/bay-link";
import type { ReactNode } from "react";
import { COUNSEL_REVIEW_LINE, LEGAL_EFFECTIVE, TERMS_ROUTE } from "@/config/nav/legal";
import "../terms/legal.css";

interface Clause {
  n: string;
  title: string;
  body: ReactNode[];
  lines?: string[];
}

const MONO = "font-mono text-[12px] text-fluorescent";

const STAYS = [
  "The vehicle you identified — VIN, year, make, model, mileage.",
  "The ZIP or city you searched for rooftops.",
  "Your last quote and the quote history behind it.",
  "Your service log, build notes, and trust checklist.",
];

const LEAVES = [
  "VIN, or year / make / model → NHTSA vPIC and NHTSA SaferCar, for the decode, recalls, complaints, and crash ratings.",
  "Year / make / model → EPA FuelEconomy.gov, for the mileage numbers.",
  "ZIP or city → OpenStreetMap Nominatim to become coordinates, then Overpass to find nearby rooftops.",
];

const CLAUSES: Clause[] = [
  {
    n: "01",
    title: "No accounts",
    body: [
      <>
        There is no sign-up, no password, and no profile. We cannot look you up, because there is nothing on our
        side to look up. Every desk in this bay opens cold.
      </>,
    ],
  },
  {
    n: "02",
    title: "What stays in this browser",
    body: [
      <>
        These are written by your own browser under keys that start with <span className={MONO}>openhood.</span>{" "}
        — that is your device&apos;s storage, not a server of ours:
      </>,
    ],
    lines: STAYS,
  },
  {
    n: "03",
    title: "What leaves this browser",
    body: [
      <>
        To print a real spec card we have to ask the agencies that hold the data. Three requests leave, and only
        these three:
      </>,
      <>
        Those are public government and volunteer services. Each one sees the request and, like any web server,
        the network address it came from. We do not attach your name — we do not have your name.
      </>,
    ],
    lines: LEAVES,
  },
  {
    n: "04",
    title: "Photos",
    body: [
      <>
        A VIN plate or estimate photo is resized and compressed by your own phone first, before anything moves.
        Reading it on the device stays on the device.
      </>,
      <>
        Cloud photo reading exists only if the operator running this bay turned on the optional photo connection.
        With that connection on, one compressed image goes to OpenAI to be read and the page tells you which path
        it took. Without it, nothing uploads and the page says so instead of pretending it read the photo.
      </>,
    ],
  },
  {
    n: "05",
    title: "The RO window",
    body: [
      <>
        If you send the contact form, we get what you typed: a name, a phone or an email, the ticket, and any
        photo you attached. We use it to answer you. We do not sell it, list it, or route it to a shop.
      </>,
      <>
        Where the operator set mail keys, that ticket goes to a desk mailbox. Where they did not, it is written to
        a file on the machine running this bay and the page stamps it &ldquo;local&rdquo; instead of claiming an
        email went out.
      </>,
    ],
  },
  {
    n: "06",
    title: "We do not sell personal information",
    body: [
      <>
        We have never sold, rented, or traded personal information, and we are not building toward it. There is no
        shop network to sell you into, no lead auction, and no cut of a repair coming back to us.
      </>,
      <>
        There are no advertising pixels and no sale of personal information. We do not build a shop-lead profile of
        your car or your ZIP.
      </>,
      <>
        Optional Google Analytics 4 loads only when the operator set{" "}
        <span className={MONO}>NEXT_PUBLIC_GA_ID</span> to a real <span className={MONO}>G-</span> property. Unset
        means no analytics script. This page does not invent a measurement ID.
      </>,
    ],
  },
  {
    n: "07",
    title: "The offline cache",
    body: [
      <>
        If your browser installs our service worker, it stores an offline card, the icons, and the app manifest so
        the bay still opens in a dead parking garage. It does not copy your vehicle, your quote, or your log
        anywhere.
      </>,
    ],
  },
  {
    n: "08",
    title: "Children",
    body: [
      <>
        This bay is built for people buying, owning, and fixing cars. It is not directed at children under 13, and
        we do not knowingly collect anything from them.
      </>,
    ],
  },
  {
    n: "09",
    title: "Your rights, in plain English",
    body: [
      <>
        California calls these CCPA rights. We give the same answer to everyone, in every state:
      </>,
      <>
        <strong className="text-fluorescent">Know what we hold.</strong> For nearly everyone: nothing. Your
        vehicle, ZIP, quote, and log are in your browser, not our records.
      </>,
      <>
        <strong className="text-fluorescent">Get a copy.</strong> It is already on your device. The service log
        and findings desks export it as a file you keep.
      </>,
      <>
        <strong className="text-fluorescent">Delete it.</strong> Clear this site&apos;s data in your browser
        settings and it is gone. If you sent something through the RO window, write to us and we delete that
        ticket.
      </>,
      <>
        <strong className="text-fluorescent">Opt out of a sale.</strong> There is nothing to opt out of. We do not
        sell or share personal information for money or for advertising.
      </>,
      <>
        <strong className="text-fluorescent">No retaliation.</strong> Every desk here is free whether you write to
        us or never do.
      </>,
    ],
  },
  {
    n: "10",
    title: "Who else is in the loop",
    body: [
      <>
        NHTSA, the EPA, and OpenStreetMap (Nominatim and Overpass) on every visit that needs them. OpenAI only
        when a photo key is set. A mail provider only when the RO window has mail keys. Each of those has its own
        privacy terms.
      </>,
      <>
        Optional keys for paid data — extra rooftops, plate lookups, listings — sit dark unless the operator turns
        them on, and the desk stamps when a key is off. Google Analytics is the same rule: no{" "}
        <span className={MONO}>NEXT_PUBLIC_GA_ID</span>, no tracker. We do not run live plate-to-VIN, escrow, or a
        store app here.
      </>,
    ],
  },
  {
    n: "11",
    title: "Changes to this page",
    body: [
      <>
        The effective date at the top moves when this page changes, and a material change gets its own line. There
        is no mailing list to notify you, so check the date.
      </>,
    ],
  },
];

const SHORT_VERSION = [
  "No account, no password, no profile.",
  "Your vehicle, ZIP, quote, and log live in this browser — not on our server.",
  "A VIN goes to NHTSA and the EPA. A ZIP goes to OpenStreetMap. That is how the specs and rooftops arrive.",
  "A photo compresses on the phone and stays there unless a cloud reading key is set.",
  "We do not sell personal information. We do not sell the repair order.",
  "Clear this site's data and your copy is gone.",
  "Google Analytics loads only if NEXT_PUBLIC_GA_ID is set. No fake property.",
];

export function PrivacyDesk() {
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
          Effective {LEGAL_EFFECTIVE} · the clauses below are the whole notice
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
                {clause.n} · Privacy
              </p>
              <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
                {clause.title}
              </h3>
              <div className="mt-2 max-w-3xl space-y-3 text-sm leading-6 text-aluminum">
                {clause.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {clause.lines ? (
                  <ul className="list-disc space-y-1.5 pl-5">
                    {clause.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ol>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Reach the desk</p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
          Ask what we hold, or ask us to delete it
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          The RO window is the way in. Tell us what you want to know or want deleted and we answer with the
          truth — usually that it never left your phone.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          <BayLink href="/contact" className="text-ticket hover:text-fluorescent">
            Talk to Open Hood
          </BayLink>
          {" · "}
          <BayLink href={TERMS_ROUTE} className="hover:text-ticket">
            Terms
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
