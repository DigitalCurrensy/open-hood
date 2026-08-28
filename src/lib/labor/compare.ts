import { formatMoney } from "@/lib/labor/money";
import type { JobEstimate, QuoteCompare, QuoteVerdict } from "@/lib/labor/types";

export function parseQuotedTotal(text: string): number | null {
  const raw = text.trim();
  if (!raw) return null;

  const asNumber = Number.parseFloat(raw.replace(/[$,\s]/g, ""));
  if (/^\s*\$?\s*\d{1,5}(?:,\d{3})*(?:\.\d{1,2})?\s*$/.test(raw) && Number.isFinite(asNumber) && asNumber >= 8) {
    return asNumber;
  }

  const amounts = [...raw.matchAll(/\$?\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)]
    .map((match) => Number.parseFloat(match[1].replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value >= 20);

  if (!amounts.length) return null;

  const totalLine = raw.split(/\r?\n/).find((line) => /total|otd|out.?the.?door|grand/i.test(line));
  if (totalLine) {
    const inLine = [...totalLine.matchAll(/\$?\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)]
      .map((match) => Number.parseFloat(match[1].replace(/,/g, "")))
      .filter((value) => Number.isFinite(value) && value >= 20);
    if (inLine.length) return inLine.at(-1) ?? null;
  }

  return Math.max(...amounts);
}

export function compareQuote(quoted: number, estimate: JobEstimate): QuoteCompare {
  const indieHigh = estimate.total.indie.high;
  const dealerHigh = estimate.total.dealer.high;
  let verdict: QuoteVerdict = "within-indie";
  if (quoted < estimate.total.indie.low) verdict = "below";
  else if (quoted > dealerHigh) verdict = "above-dealer";
  else if (quoted > indieHigh) verdict = "above-indie";

  return {
    quoted: Math.round(quoted * 100) / 100,
    versusIndieHigh: Math.round((quoted - indieHigh) * 100) / 100,
    versusDealerHigh: Math.round((quoted - dealerHigh) * 100) / 100,
    verdict,
    say: sayFor(verdict, quoted, indieHigh, dealerHigh),
  };
}

function sayFor(verdict: QuoteVerdict, quoted: number, indieHigh: number, dealerHigh: number): string {
  const q = formatMoney(quoted);
  const indie = formatMoney(indieHigh);
  const dealer = formatMoney(dealerHigh);
  if (verdict === "below") {
    return `${q} sits under the independent low. Still ask for hours and the old part. A cheap number that hides rotors or shop supplies is not a favor.`;
  }
  if (verdict === "within-indie") {
    return `${q} is inside the independent band (high ${indie}). Ask them to write hours × the posted door rate anyway.`;
  }
  if (verdict === "above-indie") {
    return `${q} is above the independent high of ${indie}. Ask for hours and the door rate on the RO. If they cannot land inside ${indie}, get a second quote before you authorize. Dealer high in this ZIP is ${dealer}.`;
  }
  return `${q} is above even the dealer high of ${dealer} for this ZIP. Do not authorize. Ask them to write hours × rate, then walk it to a second roof.`;
}
