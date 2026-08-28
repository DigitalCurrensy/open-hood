"use client";

import { BayRecoveryNav } from "@/components/bay-recovery-nav";
import { PWA_UNLOCK_HREF } from "@/lib/pwa";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-2 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">Bay fault</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">Something seized</h1>
      <p className="max-w-md text-aluminum">{error.message || "The workspace hit an unexpected error."}</p>
      <p className="max-w-md text-sm text-aluminum">
        This is a live desk fault — not a cached Wi-Fi-dropped paint. If a leftover worker trapped this tab,{" "}
        <a href={PWA_UNLOCK_HREF} className="text-ticket">
          unlock the bay
        </a>
        .
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-sm bg-ticket px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wide text-ticket-ink"
      >
        Retry
      </button>
      <BayRecoveryNav />
    </div>
  );
}
