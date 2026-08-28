import type { Metadata } from "next";
import { CheatPrint } from "@/app/expert/_components/cheat-print";
import { ExpertShell } from "@/app/expert/_components/expert-shell";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import { CHEAT_ASK, CHEAT_DONT, CHEAT_ROWS } from "@/lib/expert/cheatsheet";

const EXTRA_CHEAT = [
  {
    id: "oil-cap",
    label: "Oil cap",
    unit: "visc / spec",
    meaning: "Cap and emissions label beat a HEURISTIC card. Not Motor. Not OEM TIS. 0W-16 is not 5W-20.",
  },
  {
    id: "atf",
    label: "ATF / CVT",
    unit: "OEM name",
    meaning: "HCF-2, DW-1, WS, NS-3, ULV — write the jug. Universal ATF is how those boxes die.",
  },
  {
    id: "history",
    label: "History",
    unit: "SaferCar + out",
    meaning: "Campaigns on nhtsa.gov/recalls. Carfax / NMVTIS are a purchase we do not own.",
  },
];

const EXTRA_ASK = ["What OEM fluid name is going in this VIN — not “ATF”?"] as const;
const EXTRA_DONT = ["A heuristic fluids card is not a pour authorization."] as const;

export const metadata: Metadata = {
  title: "Counter card",
  description: "Printable millimeters, 32nds, PSI, volts, and freeze-frame questions for the service window.",
};

export default function Page() {
  return (
    <ExpertShell>
      <PageBrief href="/expert/cheatsheet" />
      <PageHeader kicker="Print · counter card" title="Say the number">
        A one-sheet for the window. Measurements beat adjectives. This is not a factory service manual.
      </PageHeader>
      <div className="no-print">
        <CheatPrint />
      </div>
      <article className="print-ticket ticket-paper rounded-sm p-6 text-ticket-ink sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em]">Open Hood · customer copy</p>
        <h2 className="mt-2 font-display text-4xl uppercase leading-none">Counter card</h2>
        <p className="mt-2 max-w-xl text-sm leading-6">
          Don&apos;t authorize until you can say this. We do not book shops. We do not take a cut.
        </p>
        <table className="mt-5 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-[0.2em]">
              <th className="border-b border-ticket-ink/20 py-2 pr-3">What</th>
              <th className="border-b border-ticket-ink/20 py-2 pr-3">Unit</th>
              <th className="border-b border-ticket-ink/20 py-2">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {[...CHEAT_ROWS, ...EXTRA_CHEAT].map((row) => (
              <tr key={row.id}>
                <td className="border-b border-ticket-ink/10 py-2 pr-3 font-semibold">{row.label}</td>
                <td className="border-b border-ticket-ink/10 py-2 pr-3 font-mono text-xs">{row.unit}</td>
                <td className="border-b border-ticket-ink/10 py-2 leading-6">{row.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em]">Ask</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
              {[...CHEAT_ASK, ...EXTRA_ASK].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em]">Refuse</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
              {[...CHEAT_DONT, ...EXTRA_DONT].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em]">
          SaferCar VIN · nhtsa.gov/recalls · /expert · /obd · /quote · /jobs
        </p>
      </article>
    </ExpertShell>
  );
}
