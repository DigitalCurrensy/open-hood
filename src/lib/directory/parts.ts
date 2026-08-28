import partTypes from "@/data/part-types.json";
import { retailerSearchHrefs } from "@/lib/directory/sku-search";
import type { PartSearchLinks } from "@/lib/directory/types";

export interface PartType {
  id: string;
  label: string;
  query: string;
}

export function listPartTypes(): PartType[] {
  return partTypes as PartType[];
}

function rockautoCatalog(year: string, make: string, model: string): string {
  const y = year.trim();
  const mk = make.trim().toLowerCase().replace(/\s+/g, "+");
  const md = model.trim().toLowerCase().replace(/\s+/g, "+");
  if (y && mk && md) {
    return `https://www.rockauto.com/en/catalog/${mk},${y},${md}`;
  }
  return "https://www.rockauto.com/en/catalog/";
}

export function partSearchLinks(year: string, make: string, model: string, partQuery: string): PartSearchLinks {
  const query = [year, make, model, partQuery].filter(Boolean).join(" ").trim();
  const encoded = encodeURIComponent(query);
  const stamps = retailerSearchHrefs(query || partQuery);
  const byId = Object.fromEntries(stamps.map((row) => [row.id, row.href]));
  return {
    query,
    rockauto: year.trim() && make.trim() && model.trim() ? rockautoCatalog(year, make, model) : (byId.rockauto ?? rockautoCatalog(year, make, model)),
    autozone: byId.autozone ?? `https://www.autozone.com/searchresult?searchText=${encoded}`,
    oreilly: byId.oreilly ?? `https://www.oreillyauto.com/search?q=${encoded}`,
    napa: byId.napa ?? `https://www.napaonline.com/en/search?text=${encoded}`,
    amazon: `https://www.amazon.com/s?k=${encoded}`,
    ebayMotors: `https://www.ebay.com/sch/6000/i.html?_nkw=${encoded}`,
  };
}
