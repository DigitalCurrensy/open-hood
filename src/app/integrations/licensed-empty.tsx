import type { KeyRow, LicensedCatalogRow } from "@/app/integrations/bay-types";

export function LicensedEmpty({
  catalog,
  paper,
}: {
  catalog: LicensedCatalogRow | null;
  paper: KeyRow[];
}) {
  return (
    <section className="int-bin rounded-sm p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Licensed catalog · empty bay</p>
      <div className="int-bin-empty mt-3 flex flex-col items-start justify-center gap-2 px-4 py-5">
        <p className="int-grease text-4xl uppercase">No SKU</p>
        <p className="max-w-xl text-sm leading-6">
          {catalog?.note ??
            "TecDoc / TecAlliance (TecAlliance catalog license), MOTOR / Identifix (Hearst Aftermarket shop license), PartsTech / Nexpart / Worldpac (shop parts book), Chrome Data, Mitchell, and ALLDATA stay on ROADMAP until a signed license. This bin is empty on purpose. OSM remains the shop map. We do not invent interchange, labor hours, or a Chrome build sheet."}
        </p>
        <p className="font-mono text-xs">
          skus: {JSON.stringify(catalog?.skus ?? [])} · hours: {JSON.stringify(catalog?.hours ?? [])} · tecdoc:false ·
          motor:false · chrome:false · partstech:false
        </p>
      </div>
      {paper.length ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {paper.map((row) => (
            <li key={row.env} className="border border-black/10 bg-paper/70 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
                {row.env} · configured:{String(row.configured)}
              </p>
              <p className="font-display text-xl uppercase leading-none">{row.label}</p>
              <p className="mt-1 text-xs leading-5">{row.unlocks}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
