"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-2 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">Auction desk fault</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">Lane seized</h1>
      <p className="max-w-md text-aluminum">{error.message || "The auction desk hit an unexpected error."}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-sm bg-ticket px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wide text-ticket-ink"
      >
        Retry
      </button>
    </div>
  );
}
