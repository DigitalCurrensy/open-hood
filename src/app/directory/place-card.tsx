import { appleMapsLink, mapsLink, osmLink, telHref, typeLabel, websiteHref } from "@/lib/directory/filters";
import { EXTERNAL_REL } from "@/lib/directory/vehicle-links";
import type { DirectoryPlace } from "@/lib/directory/types";

export function PlaceCard({ place }: { place: DirectoryPlace }) {
  const tel = telHref(place.phone);
  const google = mapsLink(place);
  const apple = appleMapsLink(place);
  const osm = osmLink(place.lat, place.lon);
  const website = websiteHref(place.website);

  return (
    <article className="flex flex-col rounded-sm border border-white/10 bg-bay-2/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">{typeLabel(place.type)}</p>
        {place.miles != null ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum">{place.miles} mi</p>
        ) : null}
      </div>
      <h3 className="mt-2 font-display text-2xl uppercase leading-none tracking-wide text-fluorescent">{place.name}</h3>
      {place.address ? <p className="mt-2 text-sm leading-6 text-aluminum">{place.address}</p> : null}
      {place.hours ? (
        <p className="mt-1 font-mono text-[11px] text-aluminum-dim">{place.hours}</p>
      ) : (
        <p className="mt-1 font-mono text-[11px] text-aluminum-dim">Hours not on the map yet</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
        {tel ? (
          <a href={tel} className="rounded-sm bg-ticket px-2.5 py-1.5 text-ticket-ink">
            {place.phone}
          </a>
        ) : (
          <span className="rounded-sm border border-white/10 px-2.5 py-1.5 text-aluminum-dim">No phone on OSM</span>
        )}
        {website ? (
          <a
            href={website}
            target="_blank"
            rel={EXTERNAL_REL}
            className="rounded-sm border border-white/15 px-2.5 py-1.5 text-fluorescent hover:border-ticket/50"
          >
            Website
          </a>
        ) : null}
        <a
          href={google}
          target="_blank"
          rel={EXTERNAL_REL}
          className="rounded-sm border border-white/15 px-2.5 py-1.5 text-fluorescent hover:border-ticket/50"
        >
          Google
        </a>
        <a
          href={apple}
          target="_blank"
          rel={EXTERNAL_REL}
          className="rounded-sm border border-white/15 px-2.5 py-1.5 text-fluorescent hover:border-ticket/50"
        >
          Apple
        </a>
        <a
          href={osm}
          target="_blank"
          rel={EXTERNAL_REL}
          className="rounded-sm border border-white/15 px-2.5 py-1.5 text-aluminum hover:text-fluorescent"
        >
          OSM
        </a>
      </div>
    </article>
  );
}
