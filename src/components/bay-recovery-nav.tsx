"use client";

import { BayLink } from "@/components/bay-link";

/** Thin strip only. A full-page spinner was “Opening bay…” forever on slow desks. */
export function BayTicketBar() {
  return (
    <div className="h-0.5 w-full overflow-hidden bg-white/10" aria-live="polite" aria-label="Opening bay">
      <div className="h-full w-1/3 bg-ticket" />
    </div>
  );
}

export const BAY_RECOVERY = [
  { href: "/", label: "Bay" },
  { href: "/quote", label: "Ticket" },
  { href: "/directory", label: "Directory" },
  { href: "/guides", label: "Guides" },
  { href: "/agent", label: "Advocate" },
  { href: "/jobs", label: "Jobs" },
  { href: "/expert", label: "Expert" },
  { href: "/contact", label: "Contact" },
] as const;

/** Hard-nav stamps. Soft App Router from an error boundary can sit forever. */
export function BayRecoveryNav() {
  return (
    <nav
      aria-label="Open bays"
      className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum"
    >
      {BAY_RECOVERY.map((item) => (
        <BayLink key={item.href} href={item.href} className="hover:text-ticket">
          {item.label}
        </BayLink>
      ))}
    </nav>
  );
}
