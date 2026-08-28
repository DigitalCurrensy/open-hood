import type { FinderJob } from "@/lib/finder/types";

const SPLIT: Record<FinderJob["split"], string> = {
  diy: "Driveway job",
  shop: "Shop diagnosis / install",
  either: "Driveway or shop — your tools decide",
};

export function JobSplit({ job }: { job: FinderJob }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">DIY</p>
        <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">
          {job.diy.can ? "You can do this" : "Look, then stop"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">{job.diy.why}</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-aluminum">
          {job.diy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {job.diy.tools.length ? (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
            Tools: {job.diy.tools.join(" · ")}
          </p>
        ) : null}
      </section>

      <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Shop / counter</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none">{SPLIT[job.split]}</h2>
        <p className="mt-3 text-sm leading-6">{job.shop.why}</p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em]">Say this</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
          {job.shop.say.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em]">{job.minutes}</p>
      </aside>
    </div>
  );
}
