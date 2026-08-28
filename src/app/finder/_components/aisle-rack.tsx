import { RetailerStamps } from "@/app/finder/_components/retailer-stamps";
import type { FinderAisleAnswer, FinderPartTicket, FinderYmm } from "@/lib/finder/types";
import { ymmHasVehicle, ymmLabel } from "@/lib/finder/ymm";

export function AisleQuestions({ answers }: { answers: FinderAisleAnswer[] }) {
  if (!answers.length) return null;
  return (
    <section className="finder-stripe rounded-sm p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">In the aisle</p>
      <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">What they will ask</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-aluminum">
        The parts person does not start with a SKU. They start with the engine and whether it is 2WD or 4WD. Answer
        from the bay ticket when we have it.
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {answers.map(({ question, answer, source }) => (
          <li key={question.id} className="rounded-sm border border-white/10 bg-bay/60 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{question.ask}</p>
            <p className="mt-2 font-display text-2xl uppercase leading-none text-fluorescent">
              {answer || "They will ask — not on the hook yet"}
            </p>
            <p className="mt-2 text-sm leading-6 text-aluminum">{question.why}</p>
            {source === "session" ? (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cone">From the bay ticket</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AisleRack({
  tickets,
  ymm,
}: {
  tickets: FinderPartTicket[];
  ymm: FinderYmm;
}) {
  const vehicle = ymmHasVehicle(ymm) ? ymmLabel(ymm) : "year / make / model not on the hook";
  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Parts aisle</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">Boxes on the hook</h2>
        </div>
        <p className="max-w-md font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          Search for {vehicle}. Not stock. Not TecDoc.
        </p>
      </div>
      <div className="finder-rail mt-5 grid gap-4 md:grid-cols-2">
        {tickets.map(({ part, query, retailers }) => (
          <article
            key={part.id}
            className={`finder-bin rounded-sm p-5 pt-6 ${part.hold ? "finder-bin-hold" : ""}`}
          >
            {part.hold ? <p className="finder-hold-stamp">Hold</p> : null}
            <p className="font-mono text-[10px] uppercase tracking-[0.28em]">
              {part.aisle} · bin {part.bin}
            </p>
            <h3 className="mt-2 font-display text-3xl uppercase leading-none">{part.label}</h3>
            <p className="mt-3 max-w-sm text-sm leading-6">{part.note}</p>
            <p className="mt-3 font-mono text-[11px]">Query: {query}</p>
            <div className="mt-4">
              <RetailerStamps retailers={retailers} hold={part.hold} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
