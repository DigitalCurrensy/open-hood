import Link from "next/link";
import { BayRecoveryNav } from "@/components/bay-recovery-nav";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-2 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">Missing term</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">Not on the ticket</h1>
      <p className="max-w-md text-sm text-aluminum">That RO slug is not in the glossary. The slang desk is still open.</p>
      <Link href="/jobs/ro-terms" className="font-mono text-sm uppercase tracking-wide text-ticket">
        Back to RO terms
      </Link>
      <BayRecoveryNav />
    </div>
  );
}
