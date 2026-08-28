import { mapsLink, telHref, typeLabel } from "@/lib/directory/filters";
import { EXTERNAL_REL } from "@/lib/directory/vehicle-links";
import type { ShopShortlist } from "@/lib/book/directory";
import Link from "next/link";

export function ShopShortlistPanel({
  zip,
  shortlist,
  busy,
}: {
  zip: string;
  shortlist: ShopShortlist;
  busy: boolean;
}) {
  const href = shortlist.kind === "idle" ? (zip ? `/directory/${zip}` : "/directory") : shortlist.href;

  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Shop shortlist</p>
      <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">Rooftops near the ZIP</h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        OSM pins if the directory line is on this bay. We do not book a stall. You call.
      </p>

      {busy ? (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Pulling rooftops…</p>
      ) : null}

      {shortlist.kind === "idle" ? (
        <p className="mt-4 text-sm leading-6 text-aluminum">
          Five-digit ZIP unlocks the shortlist. We will not drop 90210 on an empty box. This is a visit shortlist —
          not a checkout.
        </p>
      ) : null}

      {shortlist.kind === "missing-api" ? (
        <p className="mt-4 text-sm leading-6 text-aluminum">
          Directory search is not on this bay. Open the ZIP desk.
        </p>
      ) : null}

      {shortlist.kind === "error" ? (
        <p role="alert" className="mt-4 text-sm leading-6 text-cone">
          {shortlist.message}
        </p>
      ) : null}

      {shortlist.kind === "empty" ? (
        <p className="mt-4 text-sm leading-6 text-aluminum">{shortlist.message}</p>
      ) : null}

      {shortlist.kind === "ready" ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {shortlist.places.map((place) => {
            const tel = telHref(place.phone);
            const maps = mapsLink(place);
            return (
              <li key={place.id} className="rounded-sm border border-white/10 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cone">
                  {typeLabel(place.type)}
                  {place.miles != null ? ` · ${place.miles} mi` : ""}
                </p>
                <h3 className="mt-1 font-display text-xl uppercase leading-none">{place.name}</h3>
                {place.address ? <p className="mt-2 text-sm leading-5 text-aluminum">{place.address}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                  {tel ? (
                    <a href={tel} className="rounded-sm bg-ticket px-2 py-1 text-ticket-ink">
                      {place.phone}
                    </a>
                  ) : (
                    <span className="rounded-sm border border-white/10 px-2 py-1 text-aluminum-dim">No phone</span>
                  )}
                  <a
                    href={maps}
                    target="_blank"
                    rel={EXTERNAL_REL}
                    className="rounded-sm border border-white/15 px-2 py-1 text-fluorescent hover:border-ticket/50"
                  >
                    Maps
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {shortlist.kind === "ready" ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-aluminum-dim">
          {shortlist.source} · {shortlist.attribution}
        </p>
      ) : null}

      {zip.length === 5 ? (
        <Link
          href={href}
          className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket hover:text-fluorescent"
        >
          Full directory · {href}
        </Link>
      ) : null}
    </section>
  );
}
