const ANSWERS = [
  { key: "for" as const, beginner: "Who", expert: "Audience" },
  { key: "click" as const, beginner: "Click", expert: "Control" },
  { key: "say" as const, beginner: "Say", expert: "Counter" },
];

const BRIEF = {
  eyebrow: "Service log",
  dummy: {
    job: "Write the date, the odometer, and what they did. Stamp the line.",
    for: "Anyone keeping a book the shop does not own.",
    click: "The three fields. Then Stamp the line.",
    say: "Here is the date and the miles. What did you do?",
  },
  genius: {
    job: "Same book. Optional OEM RO# and parts SKUs. Shop, cost, and notes when you have them. Export is JSON. Findings is /report — this desk does not write that packet.",
    for: "Owners who want the RO number and SKUs on the line.",
    click: "Expert extras, then stamp. Export when you need a file.",
    say: "RO number on the ticket. SKUs on the line. Miles at drop-off.",
  },
};

export function LogBrief() {
  return (
    <section aria-label="Page brief" className="rounded-sm border border-white/10 bg-bay-2/80">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/10 px-4 py-2.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">{BRIEF.eyebrow}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">
          <span data-label-dummy>Beginner · three fields</span>
          <span data-label-shop>Expert · RO · SKU · cost</span>
        </p>
      </div>

      <div className="page-brief-altitudes flex flex-col gap-2 px-3 pt-3">
        <p data-altitude="dummy" className="ticket-paper rounded-sm px-4 py-3 text-sm leading-6 text-ticket-ink">
          {BRIEF.dummy.job}
        </p>
        <p
          data-altitude="genius"
          className="rounded-sm border border-white/10 px-4 py-3 font-mono text-xs leading-6 text-fluorescent"
        >
          {BRIEF.genius.job}
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
              <span data-altitude="dummy">{BRIEF.dummy[answer.key]}</span>
              <span data-altitude="genius">{BRIEF.genius[answer.key]}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
