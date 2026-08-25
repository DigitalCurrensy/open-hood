import partTypes from "@/data/part-types.json";
import type { PartSearchLinks } from "@/lib/directory/types";

export interface PartType {
  id: string;
  label: string;
  query: string;
}

export function listPartTypes(): PartType[] {
  return partTypes as PartType[];
}

export function partSearchLinks(year: string, make: string, model: string, partQuery: string): PartSearchLinks {
  const query = [year, make, model, partQuery].filter(Boolean).join(" ").trim();
  const encoded = encodeURIComponent(query);
  return {
    query,
    rockauto: `https://www.rockauto.com/en/partsearch/?partnum=${encoded}`,
    autozone: `https://www.autozone.com/searchresult?searchText=${encoded}`,
    amazon: `https://www.amazon.com/s?k=${encoded}`,
    ebayMotors: `https://www.ebay.com/sch/6000/i.html?_nkw=${encoded}`,
  };
}
