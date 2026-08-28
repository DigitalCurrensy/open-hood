"use client";

import { assembleClientPacket, persistPacket, type ClientReportInput } from "@/components/report/assemble-client";
import { submitFindings } from "@/components/report/submit";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PrintFindingsButton({
  extras,
  className,
}: {
  extras?: ClientReportInput;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setBusy(true);
    setError("");
    try {
      const result = await submitFindings(extras);
      persistPacket(result.packet);
      router.push("/report");
    } catch (err) {
      persistPacket(assembleClientPacket(extras));
      setError(err instanceof Error ? err.message : "Could not collate findings.");
      router.push("/report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => void onClick()}
        className={
          className ??
          "rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
        }
      >
        {busy ? "Collating…" : "Print findings"}
      </button>
      {error ? <span className="font-mono text-[10px] uppercase tracking-wide text-cone">{error}</span> : null}
    </span>
  );
}
