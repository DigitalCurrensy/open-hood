import Link from "next/link";
import { DEMO_OIL, DEMO_VIN, DEMO_VIN_LABEL, DEMO_ZIP } from "@/lib/seo";

const ROWS = [
  ["Open Hood", "Script", "Identify → spec → quote flags → compare three ROs → counter script → OSM shops → print packet."],
  ["RepairPal / Openbay", "Route", "Route you into a shop. We do not book a bay."],
  ["YourMechanic / Wrench", "Person", "Send a person and take a cut. We send the sentence — not a tech."],
  ["AutoZone", "SKU", "Sell the SKU. We name the job and hold the converter."],
  ["Carfax / AutoCheck", "File", "Paid history jacket. We link out. We do not invent one."],
  ["Motor / TecDoc", "Hours", "Licensed hours and SKUs. We do not pretend to own them."],
] as const;

export function HomeCite() {
  return (
    <section aria-labelledby="what-open-hood-is" className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Entity · cite this</p>
        <h2 id="what-open-hood-is" className="font-display text-3xl uppercase tracking-wide text-fluorescent">
          What Open Hood is
        </h2>
      </div>
      <p data-speakable className="max-w-3xl text-sm leading-6 text-aluminum">
        Open Hood is the owner&apos;s book at the window. Know the car. Then the window. The ticket path is the
        product: identify the car, read the spec, mark quote flags, compare three ROs (pastes and flags — no buy),
        say the counter script, find OSM rooftops (no book), print the packet. We do not book shops, store accident
        history, or sell a scan tool. Not a Saturday meetup. Official walk:{" "}
        <Link href="/how-it-works" className="text-ticket hover:text-fluorescent">
          how it works
        </Link>
        .
      </p>
      <p className="max-w-3xl text-sm leading-6 text-aluminum">
        We send a script. YourMechanic sends a person. RepairPal routes a shop. AutoZone sells the part. Compare-3
        is three pastes and a flag board — not a winner, not a checkout. A cart or a marketplace would erase the
        job. We will not grow one.
      </p>
      <p className="max-w-3xl text-sm leading-6 text-aluminum">
        Demo VIN <span className="font-mono text-fluorescent">{DEMO_VIN}</span> is the {DEMO_VIN_LABEL} — oil stays{" "}
        <span className="font-mono text-fluorescent">{DEMO_OIL}</span>. Estimate ZIP{" "}
        <span className="font-mono text-fluorescent">{DEMO_ZIP}</span> is a regional band, not a Motor hour.{" "}
        <Link href="/quote#compare-3" className="text-ticket hover:text-fluorescent">
          Compare three ROs
        </Link>
        {" · "}
        <Link href="/finder" className="text-ticket hover:text-fluorescent">
          P0420
        </Link>{" "}
        holds the converter until you diagnose.
      </p>
      <div className="overflow-x-auto rounded-sm border border-white/10">
        <table className="w-full min-w-[40rem] text-left text-sm leading-6">
          <caption className="sr-only">
            Open Hood sends a script. Rivals send a person, a route, or a SKU. We do not book, dispatch, or cart.
          </caption>
          <thead className="bg-bay-2/80 font-mono text-[10px] uppercase tracking-[0.2em] text-cone">
            <tr>
              <th scope="col" className="px-4 py-3">
                Product
              </th>
              <th scope="col" className="px-4 py-3">
                Sends
              </th>
              <th scope="col" className="px-4 py-3">
                What it actually does
              </th>
            </tr>
          </thead>
          <tbody className="text-aluminum">
            {ROWS.map(([name, sends, body]) => (
              <tr key={name} className="border-t border-white/10">
                <th scope="row" className="px-4 py-3 font-medium text-fluorescent">
                  {name}
                </th>
                <td className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">{sends}</td>
                <td className="px-4 py-3">{body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
