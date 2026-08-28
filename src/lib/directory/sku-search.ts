import skuFile from "@/data/sku-crossref.json";
import skuSearchFile from "@/data/sku-search.json";
import partTypes from "@/data/part-types.json";

export interface SkuRetailer {
  id: string;
  name: string;
  hrefTemplate: string;
}

export interface SkuSearchHref {
  id: string;
  name: string;
  href: string;
}

export interface SkuSearchRow {
  id: string;
  label: string;
  query: string;
  hrefs: SkuSearchHref[];
}

interface SkuSearchFile {
  disclaimer: string;
  retailers: { id: string; name: string; href: string }[];
  extraQueries: { id: string; label: string; q: string }[];
}

interface SkuCrossrefFile {
  rows: { oem?: string; fram?: string; wix?: string; purolator?: string }[];
}

const SEARCH = skuSearchFile as SkuSearchFile;
const CROSSREF = skuFile as SkuCrossrefFile;

export const SKU_SEARCH_DISCLAIMER = SEARCH.disclaimer;
export const SKU_SEARCH_EXTRAS = SEARCH.extraQueries;

export const SKU_RETAILERS: SkuRetailer[] = SEARCH.retailers.map((row) => ({
  id: row.id,
  name: row.name,
  hrefTemplate: row.href,
}));

function enc(value: string): string {
  return encodeURIComponent(value.trim());
}

function partTokens(raw: string): string[] {
  return raw
    .split("/")
    .map((part) => part.replace(/[—–]/g, "").trim())
    .filter((part) => part.length >= 3 && part !== "-");
}

export function retailerSearchHrefs(query: string): SkuSearchHref[] {
  const q = query.trim();
  if (!q) return [];
  return SKU_RETAILERS.map((store) => ({
    id: store.id,
    name: store.name,
    href: store.hrefTemplate.replaceAll("{q}", enc(q)),
  }));
}

function uniquePartNumbers(): string[] {
  const found = new Set<string>();
  for (const row of CROSSREF.rows) {
    for (const field of [row.oem, row.fram, row.wix, row.purolator]) {
      if (!field) continue;
      for (const token of partTokens(field)) found.add(token);
    }
  }
  return [...found];
}

export function skuSearchRows(): SkuSearchRow[] {
  const rows: SkuSearchRow[] = [];
  const seen = new Set<string>();

  function push(id: string, label: string, query: string) {
    const key = query.toLowerCase();
    if (!query || seen.has(key)) return;
    seen.add(key);
    const hrefs = retailerSearchHrefs(query);
    if (!hrefs.length) return;
    rows.push({ id, label, query, hrefs });
  }

  for (const row of CROSSREF.rows) {
    const oem = row.oem?.trim();
    if (oem) push(`oem-${oem}`, oem, oem);
  }

  for (const token of uniquePartNumbers()) {
    push(`pn-${token}`, token, token);
  }

  for (const extra of SEARCH.extraQueries) {
    push(extra.id, extra.label, extra.q);
  }

  for (const type of partTypes as { id: string; label: string; query: string }[]) {
    push(`type-${type.id}`, type.label, type.query);
  }

  return rows;
}

const SKU_SEARCH_TABLE = skuSearchRows();

export const SKU_SEARCH_ROW_COUNT = SKU_SEARCH_TABLE.length;
export const SKU_SEARCH_HREF_COUNT = SKU_SEARCH_TABLE.reduce((sum, row) => sum + row.hrefs.length, 0);

export function skuSearchTable(): SkuSearchRow[] {
  return SKU_SEARCH_TABLE;
}

export function skuSearchForQuery(query: string): SkuSearchRow | null {
  const q = query.trim();
  if (!q) return null;
  const hrefs = retailerSearchHrefs(q);
  if (!hrefs.length) return null;
  return { id: "q", label: q, query: q, hrefs };
}
