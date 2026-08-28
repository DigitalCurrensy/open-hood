"use client";

export function CheatPrint() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
    >
      Print this card
    </button>
  );
}
