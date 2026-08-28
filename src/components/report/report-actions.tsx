"use client";

import {
  downloadFindingsJson,
  downloadFindingsText,
  printFindings,
  tryDownloadJsonFromApi,
} from "@/components/report/submit";
import type { ReportPacket } from "@/lib/report/packet";
import { useState } from "react";

export function ReportActions({ packet }: { packet: ReportPacket }) {
  const [busy, setBusy] = useState<"print" | "json" | "text" | "">("");
  const [note, setNote] = useState("");

  async function onPrint() {
    setBusy("print");
    setNote("");
    try {
      const how = await printFindings(packet);
      setNote(how === "html" ? "Opened the shop copy." : "Use the browser dialog — Save as PDF if you need a file.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not open print.");
    } finally {
      setBusy("");
    }
  }

  async function onJson() {
    setBusy("json");
    setNote("");
    try {
      const fromApi = await tryDownloadJsonFromApi(packet);
      if (!fromApi) downloadFindingsJson(packet);
    } finally {
      setBusy("");
    }
  }

  function onText() {
    setBusy("text");
    setNote("");
    try {
      downloadFindingsText(packet);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="no-print space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void onPrint()}
          className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
        >
          {busy === "print" ? "Opening print…" : "Print"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void onJson()}
          className="rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
        >
          {busy === "json" ? "Saving…" : "Download JSON"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={onText}
          className="rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
        >
          {busy === "text" ? "Saving…" : "Download text"}
        </button>
      </div>
      {note ? <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">{note}</p> : null}
    </div>
  );
}
