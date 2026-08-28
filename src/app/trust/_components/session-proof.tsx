"use client";

import { useLastQuote } from "@/lib/vehicle-session";

/** Non-ok lines on the last quote in this browser. Zero until a quote exists. */
export function quotesFlaggedThisSession(quote: { flaggedItems: { category: string }[] } | null): number {
  if (!quote) return 0;
  return quote.flaggedItems.filter((item) => item.category !== "ok").length;
}

export function SessionProof() {
  const [quote] = useLastQuote();
  const flagged = quotesFlaggedThisSession(quote);

  return (
    <div className="trust-stamp rounded-sm border border-white/12 bg-bay/70 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">Quotes flagged</p>
      <p className="mt-1 font-display text-4xl uppercase leading-none text-fluorescent">{flagged}</p>
      <p className="mt-2 text-sm leading-5 text-aluminum">
        Non-ok lines on the last quote in this browser. Not a star. Not a review.
      </p>
    </div>
  );
}
