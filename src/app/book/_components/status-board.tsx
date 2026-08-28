import { BOOK_DISPATCH_LINE, BOOK_JOBS, BOOK_VENUES, BOOK_WINDOWS, type BookBoardRow } from "@/lib/book/types";

export function StatusBoard({
  rows,
  onForget,
  onClear,
}: {
  rows: BookBoardRow[];
  onForget: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="book-void rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="book-void-stamp">Not dispatched</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Status board · this phone</p>
      <h2 className="mt-1 max-w-[16ch] font-display text-2xl uppercase tracking-wide">Sent. Not rolling.</h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">{BOOK_DISPATCH_LINE}</p>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-aluminum">No visit notes on this device yet. The carbon is empty.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((row) => {
            const job = BOOK_JOBS.find((item) => item.id === row.job)?.label ?? row.job;
            const venue = BOOK_VENUES.find((item) => item.id === row.venue)?.label ?? row.venue;
            const window = BOOK_WINDOWS.find((item) => item.id === row.window)?.label ?? row.window;
            return (
              <li key={row.id} className="rounded-sm border border-white/10 px-3 py-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ticket">
                      Sent · {row.delivery === "email" ? "emailed" : "jsonl"} · not dispatched
                    </p>
                    <p className="mt-1 font-display text-xl uppercase leading-none">
                      {job} · {row.zip}
                    </p>
                    <p className="mt-1.5 font-mono text-[11px] text-aluminum">
                      {venue} · {window}
                      {row.vehicle ? ` · ${row.vehicle}` : ""}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-aluminum-dim">{row.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onForget(row.id)}
                    className="rounded-sm border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
                  >
                    Drop
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rows.length ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum hover:text-ticket"
        >
          Clear this phone&apos;s board
        </button>
      ) : null}
    </section>
  );
}
