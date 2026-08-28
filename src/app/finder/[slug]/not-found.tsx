import Link from "next/link";
import { BayRecoveryNav } from "@/components/bay-recovery-nav";

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">Empty hook</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">No job on that aisle</h1>
      <p className="max-w-md text-sm leading-6 text-aluminum">
        That slug is not in the Fix Finder book. Type a code or a symptom on the counter ticket.
      </p>
      <Link
        href="/finder"
        className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
      >
        Back to the aisle
      </Link>
      <BayRecoveryNav />
    </div>
  );
}
