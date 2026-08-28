import Link from "next/link";
import { BayRecoveryNav } from "@/components/bay-recovery-nav";

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">Empty stall</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">No playbook on that hook</h1>
      <p className="max-w-md text-sm leading-6 text-aluminum">
        That slug is not in the book. The owner jobs live on the board.
      </p>
      <Link
        href="/expert"
        className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
      >
        Back to playbooks
      </Link>
      <BayRecoveryNav />
    </div>
  );
}
