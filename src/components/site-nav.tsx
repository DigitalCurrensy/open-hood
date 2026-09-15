"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { BayLink } from "@/components/bay-link";
import { BayPath } from "@/components/bay-path";
import { isCurrentHref, LAB_NAV, OWNER_TOOLS } from "@/config/nav/consumer";
import { BRAND } from "@/lib/brand";
import { PWA_UNLOCK_HREF } from "@/lib/pwa";
import { DEMO_VIN, DEMO_VIN_LABEL } from "@/lib/seo";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

function showUnlockControl(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

function subscribeNoop() {
  return () => undefined;
}

export function SiteNav() {
  const pathname = usePathname();
  const [vehicle] = useIdentifiedVehicle();
  const devHost = useSyncExternalStore(subscribeNoop, showUnlockControl, () => false);
  const chip = vehicle
    ? [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ")
    : null;

  return (
    <header className="no-print border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cone">{BRAND.kicker}</p>
            <BayLink href="/" className="inline-flex items-center gap-3 text-fluorescent">
              <Image src="/icons/icon-192.png" alt="" width={48} height={48} priority className="size-12 rounded-sm border border-white/10" />
              <span className="font-display text-4xl uppercase leading-none tracking-wide sm:text-5xl">{BRAND.short}</span>
            </BayLink>
            <p className="mt-2 max-w-md text-sm leading-6 text-aluminum">{BRAND.oneLiner}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BayLink href="/" className="bay-stamp inline-flex min-h-11 items-center rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent">
              {chip ? chip : "No car yet"}
            </BayLink>
            {chip ? null : (
              <BayLink href={`/?vin=${DEMO_VIN}#ask`} title={DEMO_VIN} className="bay-stamp inline-flex min-h-11 items-center rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket-ink">
                Try the demo · {DEMO_VIN_LABEL}
              </BayLink>
            )}
            {devHost ? (
              <a href={PWA_UNLOCK_HREF} className="bay-stamp inline-flex min-h-11 items-center rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent">
                Fix stuck tab
              </a>
            ) : null}
          </div>
        </div>
        <nav aria-label="Main">
          <BayPath pathname={pathname} />
        </nav>
        <details className="rounded-sm border border-white/10 bg-bay-2/40">
          <summary className="cursor-pointer list-none px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-aluminum hover:text-fluorescent">
            <span className="inline-flex min-h-11 items-center">Owner tools</span>
          </summary>
          <nav aria-label="Owner tools" className="border-t border-white/10 px-3 py-3">
            <ul className="flex flex-wrap gap-1.5">
              {OWNER_TOOLS.map((item) => {
                const current = isCurrentHref(pathname, item.href);
                return (
                  <li key={item.href}>
                    <BayLink href={item.href} aria-current={current ? "page" : undefined} title={item.blurb} className={`bay-stamp inline-flex min-h-11 items-center rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${current ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum hover:border-ticket/50 hover:text-fluorescent"}`}>
                      {item.stamp}
                    </BayLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </details>
        {LAB_NAV.length ? (
          <details className="rounded-sm border border-white/10 bg-bay-2/20">
            <summary className="cursor-pointer list-none px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-aluminum/80 hover:text-fluorescent">
              <span className="inline-flex min-h-11 items-center">Lab desks</span>
            </summary>
            <nav aria-label="Lab desks" className="border-t border-white/10 px-3 py-3">
              <ul className="flex flex-wrap gap-1.5">
                {LAB_NAV.map((item) => {
                  const current = isCurrentHref(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <BayLink href={item.href} aria-current={current ? "page" : undefined} title={item.blurb} className={`bay-stamp inline-flex min-h-11 items-center rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${current ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum hover:border-ticket/50 hover:text-fluorescent"}`}>
                        {item.stamp}
                      </BayLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </details>
        ) : null}
      </div>
    </header>
  );
}
