import type { FinderPart, FinderPartTicket, FinderRetailerLink, FinderYmm } from "@/lib/finder/types";
import { ymmHasVehicle, ymmLabel } from "@/lib/finder/ymm";

export const EXTERNAL_REL = "noopener noreferrer";

function enc(value: string): string {
  return encodeURIComponent(value.trim());
}

function lowerSlug(value: string, joiner: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, joiner)
    .replace(new RegExp(`^\\${joiner}|\\${joiner}$`, "g"), "");
}

export function partsQuery(ymm: FinderYmm, partQuery: string): string {
  return [ymmLabel(ymm), partQuery.trim() || "filter"].filter(Boolean).join(" ").trim();
}

export function rockautoHref(ymm: FinderYmm, partQuery: string): string {
  const q = partsQuery(ymm, partQuery);
  if (ymmHasVehicle(ymm)) {
    const make = lowerSlug(ymm.make, "");
    const model = lowerSlug(ymm.model, "");
    if (make && model) {
      return `https://www.rockauto.com/en/catalog/${encodeURIComponent(make)},${enc(ymm.year)},${encodeURIComponent(model)}`;
    }
  }
  return q ? `https://www.rockauto.com/en/partsearch/?partnum=${enc(q)}` : "https://www.rockauto.com/en/catalog/";
}

export function retailerLinks(ymm: FinderYmm, partQuery: string): FinderRetailerLink[] {
  const q = partsQuery(ymm, partQuery);
  const encoded = enc(q);
  return [
    {
      id: "autozone",
      name: "AutoZone",
      href: `https://www.autozone.com/searchresult?searchText=${encoded}`,
      note: "Retail search. Still not a shelf-count.",
    },
    {
      id: "oreilly",
      name: "O’Reilly",
      href: `https://www.oreillyauto.com/search?q=${encoded}`,
      note: "Parts plus loaner tools. Confirm the application.",
    },
    {
      id: "advance",
      name: "Advance",
      href: `https://shop.advanceautoparts.com/web/SearchResults?searchTerm=${encoded}`,
      note: "Same query, different counter.",
    },
    {
      id: "napa",
      name: "NAPA",
      href: `https://www.napaonline.com/en/search?text=${encoded}`,
      note: "Store search. We do not know the back-room count.",
    },
    {
      id: "rockauto",
      name: "RockAuto",
      href: rockautoHref(ymm, partQuery),
      note: ymmHasVehicle(ymm)
        ? "Catalog for this year/make/model. Confirm the application before you click buy."
        : "Part search. Confirm fitment before you click buy.",
    },
    {
      id: "amazon",
      name: "Amazon",
      href: `https://www.amazon.com/s?k=${encoded}`,
      note: "Marketplace. Read the fitment notes.",
    },
    {
      id: "ebay",
      name: "eBay Motors",
      href: `https://www.ebay.com/sch/6000/i.html?_nkw=${encoded}`,
      note: "Used and aftermarket. Category 6000.",
    },
  ];
}

export function partTicket(part: FinderPart, ymm: FinderYmm): FinderPartTicket {
  const query = partsQuery(ymm, part.query);
  return { part, query, retailers: retailerLinks(ymm, part.query) };
}

export function aisleTickets(parts: FinderPart[], ymm: FinderYmm): FinderPartTicket[] {
  return [...parts].sort((a, b) => a.order - b.order).map((part) => partTicket(part, ymm));
}
