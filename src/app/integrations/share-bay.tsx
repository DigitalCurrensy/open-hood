"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";

export function ShareBay() {
  const [note, setNote] = useState("");

  async function share() {
    const url = window.location.href;
    const payload = {
      title: `${BRAND.short} — ${BRAND.tagline}`,
      text: BRAND.shareText,
      url,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        setNote("Handed to the phone share sheet.");
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNote("Link copied — this browser has no share sheet.");
    } catch {
      setNote("Copy failed. Use Print, or copy the address bar.");
    }
  }

  return (
    <div className="no-print flex flex-col gap-2 sm:items-end">
      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cone">Share this bay</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void share()}
          className="rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent hover:border-ticket/50"
        >
          Print
        </button>
      </div>
      {note ? <p className="text-xs text-aluminum">{note}</p> : null}
    </div>
  );
}
