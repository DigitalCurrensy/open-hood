import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-2 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">404</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">Bay not found</h1>
      <p className="max-w-md text-sm text-aluminum">That stamp is not on the board. The service bay is still open.</p>
      <Link href="/" className="font-mono text-sm uppercase tracking-wide text-ticket">
        Back to the service bay
      </Link>
    </div>
  );
}
