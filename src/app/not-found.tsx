import Link from "next/link";
import { BayRecoveryNav } from "@/components/bay-recovery-nav";
import { PWA_UNLOCK_PARAM } from "@/lib/pwa-unlock-script";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-2 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-cone">404</p>
      <h1 className="font-display text-4xl uppercase text-fluorescent">Bay not found</h1>
      <p className="max-w-md text-sm text-aluminum">That stamp is not on the board. The service bay is still open.</p>
      <p className="max-w-md text-sm text-aluminum">
        Missing stamp — not an offline hijack. If every desk looks dropped,{" "}
        <Link href={`/?${PWA_UNLOCK_PARAM}=1`} className="text-ticket">
          unlock
        </Link>
        .
      </p>
      <Link href="/" className="font-mono text-sm uppercase tracking-wide text-ticket">
        Back to the service bay
      </Link>
      <BayRecoveryNav />
    </div>
  );
}
