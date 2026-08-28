"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { BayLink } from "@/components/bay-link";
import { BayPath } from "@/components/bay-path";
import { ReadingLevel } from "@/components/reading-level";
import { BOARD_NAV, isCurrentHref } from "@/config/nav/consumer";
import { BRAND } from "@/lib/brand";
import { PWA_UNLOCK_HREF } from "@/lib/pwa";
import { DEMO_VIN, DEMO_VIN_LABEL } from "@/lib/seo";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function SiteNav() {
  const pathname = usePathname();
  const [vehicle] = useIdentifiedVehicle();
  const chip = vehicle
    ? [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ")
    : null;

  return (
    <header className="no-print border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cone">
              {BRAND.kicker}
            </p>
            <BayLink href="/" className="inline-flex items-center gap-3 text-fluorescent">
              <Image
                src="/icons/icon-192.png"
                alt=""
                width={48}
                height={48}
                priority
                className="size-12 rounded-sm border border-white/10"
              />
              <span className="font-display text-4xl uppercase leading-none tracking-wide sm:text-5xl">{BRAND.short}</span>
            </BayLink>
            <div className="mt-3">
              <ReadingLevel />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="max-w-sm text-sm leading-6 text-aluminum">
              {BRAND.tagline} Factory specs in plain English. Don&apos;t authorize until you can say this at the
              counter.
            </p>
            <BayLink
              href="/"
              className="bay-stamp inline-flex min-h-11 items-center rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
            >
              {chip ? chip : "No car in the bay"}
            </BayLink>
            {chip ? null : (
              <BayLink
                href={`/?vin=${DEMO_VIN}`}
                title={DEMO_VIN}
                className="bay-stamp inline-flex min-h-11 items-center rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket-ink"
              >
                Demo · {DEMO_VIN_LABEL}
              </BayLink>
            )}
            <a
              href={PWA_UNLOCK_HREF}
              className="bay-stamp inline-flex min-h-11 items-center rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
            >
              Unlock leftover worker
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <nav aria-label="Main bays">
            <BayPath pathname={pathname} />
          </nav>
          <a
            href="#bay-board"
            className="bay-stamp inline-flex min-h-11 items-center rounded-sm border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent hover:border-ticket/50"
          >
            More bays
          </a>
        </div>

        <nav id="bay-board" aria-label="Full bay board">
          <ul className="flex flex-wrap gap-1.5">
            {BOARD_NAV.map((item) => {
              const current = isCurrentHref(pathname, item.href);
              return (
                <li key={item.href}>
                  <BayLink
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    title={item.blurb}
                    className={`bay-stamp inline-flex min-h-11 items-center rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${
                      current
                        ? "bg-ticket text-ticket-ink"
                        : "border border-white/10 text-aluminum hover:border-ticket/50 hover:text-fluorescent"
                    }`}
                  >
                    {item.stamp}
                  </BayLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
