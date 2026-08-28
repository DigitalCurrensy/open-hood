import { analyzeQuoteText, type QuoteDefenseResult } from "@/lib/quote";
import type { VehicleSpecs } from "@/lib/types";

export const COMPARE_SLOTS = [
  { id: "a", stamp: "RO A", shop: "Shop A" },
  { id: "b", stamp: "RO B", shop: "Shop B" },
  { id: "c", stamp: "RO C", shop: "Shop C" },
] as const;

export type CompareSlotId = (typeof COMPARE_SLOTS)[number]["id"];

export const COMPARE_DEMO: Record<CompareSlotId, string> = {
  a: "Cabin air filter $85\nCoolant flush $189\nShop supplies 8%",
  b: "Cabin air filter $28\nOil change $95",
  c: "Oil change $79\nCabin air filter $65\nFuel injector flush $149\nShop supplies 10%\nNitrogen fill $29",
};

export interface ComparedRo {
  id: CompareSlotId;
  stamp: string;
  shop: string;
  raw: string;
  result: QuoteDefenseResult | null;
  problemCount: number;
  packed: boolean;
}

export interface CompareSpread {
  low: number;
  high: number;
  delta: number;
}

export interface CompareBoard {
  rows: ComparedRo[];
  filled: ComparedRo[];
  holdUntil: string;
  spread: CompareSpread | null;
  heaviest: CompareSlotId | null;
}

function problemCount(result: QuoteDefenseResult): number {
  return result.flaggedItems.filter((item) => item.category !== "ok").length + (result.bundle?.packed ? 1 : 0);
}

export function holdUntilLine(rows: ComparedRo[]): string {
  const live = rows.filter((row) => row.result);
  if (!live.length) return "Do not approve until three tickets are on this board — or one ticket is marked and you can say the script.";
  if (live.some((row) => row.packed)) {
    return "Do not approve until the packed menu is named or declined on paper.";
  }
  if (live.some((row) => row.problemCount > 0)) {
    return "Do not approve until hours, OEM numbers, and an out-the-door ceiling are written on the RO.";
  }
  return "Do not approve until you can say the three-line script at the window.";
}

export function compareThreeRos(
  pastes: Record<CompareSlotId, string>,
  specs: VehicleSpecs,
  zip: string,
): CompareBoard {
  const rows: ComparedRo[] = COMPARE_SLOTS.map((slot) => {
    const raw = pastes[slot.id].trim();
    const result = raw ? analyzeQuoteText(raw, specs, zip) : null;
    return {
      id: slot.id,
      stamp: slot.stamp,
      shop: slot.shop,
      raw,
      result,
      problemCount: result ? problemCount(result) : 0,
      packed: Boolean(result?.bundle?.packed),
    };
  });
  const filled = rows.filter((row) => row.result);
  const totals = filled
    .map((row) => row.result?.totalQuoted)
    .filter((total): total is number => total != null);
  const spread =
    totals.length >= 2
      ? {
          low: Math.min(...totals),
          high: Math.max(...totals),
          delta: Math.max(...totals) - Math.min(...totals),
        }
      : null;
  let heaviest: CompareSlotId | null = null;
  let worst = -1;
  for (const row of filled) {
    const weight = row.problemCount * 1000 + (row.result?.totalQuoted ?? 0);
    if (weight > worst) {
      worst = weight;
      heaviest = row.id;
    }
  }
  return {
    rows,
    filled,
    holdUntil: holdUntilLine(rows),
    spread,
    heaviest,
  };
}
