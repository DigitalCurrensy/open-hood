import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-2 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">Missing job</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">Not in the book</h1>
      <p className="max-w-md text-sm text-aluminum">
        That slug is not a how-to job. The glossary is still on the board.
      </p>
      <Link href="/guides" className="font-mono text-sm uppercase tracking-wide text-ticket">
        Back to how-to
      </Link>
    </div>
  );
}
