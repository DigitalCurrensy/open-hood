import type { Metadata } from "next";
import { BayLink } from "@/components/bay-link";
import { OfflineEscape } from "@/components/offline-escape";
import { PageHeader } from "@/components/page-header";
import { pageMeta } from "@/lib/seo";
import { OfflineDesk } from "./offline-desk";

export const metadata: Metadata = pageMeta({
  title: "Offline",
  description:
    "Waiting-room Wi-Fi dropped. Last car and last script stay on the phone. Identify and Quote need a connection. Pin via Share → Add to Home Screen. Not available on the App Store.",
  path: "/offline",
  index: false,
});

const DESKS = [
  {
    href: "/",
    stamp: "Identify",
    body: "VIN or year / make / model. Needs a connection — the decode comes from NHTSA.",
  },
  {
    href: "/quote",
    stamp: "Quote",
    body: "Paste the RO. Needs a connection — the markup check reads the price book.",
  },
] as const;

export default function Page() {
  return (
    <div className="space-y-6" data-offline-desk="">
      <PageHeader kicker="Window · no signal" title="Wi-Fi dropped">
        The waiting-room signal died. This fallback is cached on your phone with your last car and last
        script. We did not invent a store app.
      </PageHeader>

      <OfflineEscape />

      <OfflineDesk />

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">What still works</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-aluminum">
          This page, your last car, your last script, and the home-screen pin. Everything else in the bay — VIN
          decode, quote markup, recalls — talks to the network. Both desks below need a connection.
        </p>
        <div className="desk-tap mt-4 grid gap-3 sm:grid-cols-2">
          {DESKS.map((desk) => (
            <BayLink
              key={desk.href}
              href={desk.href}
              className="desk-tap-hit flex min-h-11 flex-col justify-center rounded-sm border border-white/15 px-4 py-3 hover:border-ticket/50"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ticket">{desk.stamp}</span>
              <span className="mt-1 text-sm leading-6 text-aluminum">{desk.body}</span>
            </BayLink>
          ))}
        </div>
      </section>

      <section className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Pin this bay · iOS A2HS</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none">Same website. Not a store app.</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
          <li>iPhone / iPad: Safari Share → Add to Home Screen → Add. That pins this website. It is not an App Store download.</li>
          <li>Safari still has no Web Bluetooth — type the code, or use TestFlight native if we invited you.</li>
          <li>Android: Chrome menu → Install or Add to Home screen. Chrome can pair a BLE ELM327.</li>
          <li>Not available on the App Store or Play Store. Store listing is paper.</li>
        </ul>
      </section>
    </div>
  );
}
