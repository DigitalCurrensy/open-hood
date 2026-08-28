import {
  fluidsCatalogCounts,
  searchFluidsCatalog,
  searchSkuCrossref,
  type FluidsCatalogRow,
} from "@/lib/fluids";
import Link from "next/link";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

export function CatalogDesk({
  q,
  year,
  make,
  model,
}: {
  q: string;
  year: string;
  make: string;
  model: string;
}) {
  const counts = fluidsCatalogCounts();
  const hasQuery = Boolean(q || year || make || model);
  const hits = searchFluidsCatalog({ q, year, make, model });
  const shown = hasQuery ? hits : hits.slice(0, 24);
  const skuHits = q ? searchSkuCrossref(q).slice(0, 12) : [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form method="get" action="/catalog" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide">Search the book</h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          Year, make, model, or a viscosity / SKU scrap. This is a pamphlet, not a licensed hours book.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Year</span>
            <input name="year" defaultValue={year} inputMode="numeric" className={FIELD} placeholder="2003" />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Make</span>
            <input name="make" defaultValue={make} className={FIELD} placeholder="Honda" />
          </label>
          <label>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Model</span>
            <input name="model" defaultValue={model} className={FIELD} placeholder="Accord" />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Scrap</span>
          <input name="q" defaultValue={q} className={FIELD} placeholder="5W-20 · PH7317 · CR-V" />
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-sm bg-ticket px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wide text-ticket-ink"
          >
            Pull the card
          </button>
          <Link href="/catalog?year=2003&make=Honda&model=Accord" className="font-mono text-[11px] uppercase tracking-wide text-ticket">
            2003 Accord demo
          </Link>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-aluminum">
          {counts.fluidsCatalog} fluids · {counts.codeCatalog} code fallback · {counts.skuCrossref} filter cross-ref
        </p>
      </form>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">Hits</p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
          {hasQuery ? `${hits.length} in the book` : `First ${shown.length} of ${hits.length}`}
        </h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          Confirm the cap and the door jamb. A miss falls through to the heuristic on the garage card — this desk only
          shows catalog rows.
        </p>
        <ul className="mt-4 space-y-3">
          {shown.map((row) => (
            <li key={`${row.make}-${row.model}-${row.yearFrom}-${row.yearTo}`}>
              <CatalogTicket row={row} />
            </li>
          ))}
        </ul>
        {!shown.length ? (
          <p className="mt-4 text-sm text-aluminum">No row for that scrap. Try year / make / model, or a viscosity.</p>
        ) : null}
      </section>

      {skuHits.length ? (
        <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5 md:col-span-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">Filter cross-ref</p>
          <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">OEM · Fram · Wix · Purolator</h2>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            Common interchange, not a TecDoc dump. Confirm the application on the box.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm text-aluminum">
              <thead className="font-mono text-[10px] uppercase tracking-[0.2em] text-cone">
                <tr>
                  <th className="py-2 pr-3">Kind</th>
                  <th className="py-2 pr-3">OEM</th>
                  <th className="py-2 pr-3">Fram</th>
                  <th className="py-2 pr-3">Wix</th>
                  <th className="py-2">Purolator</th>
                </tr>
              </thead>
              <tbody>
                {skuHits.map((row) => (
                  <tr key={`${row.kind}-${row.oem}`} className="border-t border-white/10">
                    <td className="py-2 pr-3 font-mono text-xs uppercase text-ticket">{row.kind}</td>
                    <td className="py-2 pr-3 text-fluorescent">{row.oem}</td>
                    <td className="py-2 pr-3">{row.fram}</td>
                    <td className="py-2 pr-3">{row.wix}</td>
                    <td className="py-2">{row.purolator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CatalogTicket({ row }: { row: FluidsCatalogRow }) {
  const href = `/api/fluids?year=${encodeURIComponent(String(row.yearFrom))}&make=${encodeURIComponent(row.make)}&model=${encodeURIComponent(row.model)}`;
  return (
    <article className="ticket-paper rounded-sm px-4 py-3 text-ticket-ink">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em]">
        {row.yearFrom}–{row.yearTo} · {row.make} {row.model}
      </p>
      <p className="mt-1 font-display text-xl uppercase leading-none">{row.oilViscosity}</p>
      <p className="mt-2 text-sm leading-5">
        {row.oilCapacityQt} · {row.tirePsiFront} / {row.tirePsiRear}
      </p>
      <p className="mt-1 text-sm leading-5">
        {row.coolant} · {row.transmissionFluid} · {row.brakeFluid}
      </p>
      <p className="mt-1 font-mono text-[11px]">
        {row.oilFilterSku} · {row.airFilterSku} · {row.cabinFilterSku}
      </p>
      <p className="mt-2">
        <Link href={href} className="font-mono text-[11px] uppercase tracking-wide underline">
          API card
        </Link>
      </p>
    </article>
  );
}
