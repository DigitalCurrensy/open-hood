"use client";

import { useState } from "react";

export function CopyScript({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false);
  const text = lines.map((line, index) => `${index + 1}. ${line}`).join("\n");

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
    <button
      type="button"
      onClick={copy}
      className="no-print rounded-sm bg-bay px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-fluorescent"
    >
      {copied ? "Copied to the notes" : "Copy the three lines"}
    </button>
  );
}
