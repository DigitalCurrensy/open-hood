import { BayRecoveryNav } from "@/components/bay-recovery-nav";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-2 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">Bad 17</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">Not a VIN</h1>
      <p className="max-w-md text-sm leading-6 text-aluminum">
        Need 17 characters. Letters I, O, and Q are never used. We will not invent a car from a short string.
      </p>
      <Link
        href="/vin/1HGCM82633A004352"
        className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
      >
        Honda demo packet
      </Link>
      <BayRecoveryNav />
    </div>
  );
}
