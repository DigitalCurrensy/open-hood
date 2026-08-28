import { HISTORY_BRIEF } from "@/config/nav/history";

const ANSWERS = [
  { key: "for" as const, beginner: "Who", expert: "Audience" },
  { key: "click" as const, beginner: "Click", expert: "Control" },
  { key: "say" as const, beginner: "Say", expert: "Counter" },
];

export function HistoryBrief() {
  return (
    <section aria-label="Page brief" className="rounded-sm border border-white/10 bg-bay-2/80">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/10 px-4 py-2.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">{HISTORY_BRIEF.eyebrow}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">
          <span data-label-dummy>Beginner · the 17</span>
          <span data-label-shop>Expert · vPIC · NMVTIS · brand</span>
        </p>
      </div>

      <div className="page-brief-altitudes flex flex-col gap-2 px-3 pt-3">
        <p data-altitude="dummy" className="ticket-paper rounded-sm px-4 py-3 text-sm leading-6 text-ticket-ink">
          {HISTORY_BRIEF.dummy.job}
        </p>
        <p
          data-altitude="genius"
          className="rounded-sm border border-white/10 px-4 py-3 font-mono text-xs leading-6 text-fluorescent"
        >
          {HISTORY_BRIEF.genius.job}
        </p>
      </div>

      <dl className="grid gap-3 px-4 py-4 sm:grid-cols-3">
        {ANSWERS.map((answer) => (
          <div key={answer.key} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">
              <span data-label-dummy>{answer.beginner}</span>
              <span data-label-shop>{answer.expert}</span>
            </dt>
            <dd className="page-brief-answer mt-1 text-sm leading-6 text-aluminum">
              <span data-altitude="dummy">{HISTORY_BRIEF.dummy[answer.key]}</span>
              <span data-altitude="genius">{HISTORY_BRIEF.genius[answer.key]}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
