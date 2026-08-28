"use client";

import { BayRecoveryNav } from "@/components/bay-recovery-nav";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-2 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">Paperwork fault</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">Terms did not print</h1>
      <p className="max-w-md text-aluminum">
        {error.message || "The terms page hit an unexpected error. The rules still stand — retry the print."}
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
