"use client";

import { useState } from "react";

export function SayTicket({
  kicker,
  title,
  lines,
  footnote,
}: {
  kicker?: string;
  title: string;
  lines: string[];
  footnote?: string;
}) {
  const [copied, setCopied] = useState(false);
  const spoken = lines.map((line) => line.trim()).filter(Boolean);
  const text = spoken.map((line, index) => `${index + 1}. ${line}`).join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className="ticket-paper rounded-sm p-5 text-ticket-ink">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em]">{kicker ?? "Say this at the window"}</p>
      <h2 className="mt-1 font-display text-3xl uppercase leading-none">{title}</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
        {spoken.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
      {footnote ? <p className="mt-4 text-sm leading-6">{footnote}</p> : null}
      <button
        type="button"
        onClick={() => void copy()}
        className="no-print mt-4 rounded-sm bg-bay px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-fluorescent"
      >
        {copied ? "Copied to the notes" : "Copy the script"}
      </button>
    </aside>
  );
}
