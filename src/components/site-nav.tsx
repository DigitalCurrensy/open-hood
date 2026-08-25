"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function SiteNav() {
  const pathname = usePathname();
  const [vehicle] = useIdentifiedVehicle();
  const [open, setOpen] = useState(false);
  const chip = vehicle
    ? [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ")
    : null;

  return (
    <header className="no-print border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cone">
              Service bay 01 · consumer defense
            </p>
            <Link href="/" className="font-display text-4xl uppercase leading-none tracking-wide text-fluorescent sm:text-5xl">
              AutoShield
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="max-w-sm text-sm leading-6 text-aluminum">
              Factory specs in plain English. Don&apos;t authorize until you can say this at the counter.
            </p>
            <Link
              href="/"
              className="rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
            >
              {chip ? chip : "No car in the bay"}
            </Link>
            <button
              type="button"
              className="rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent md:hidden"
              aria-expanded={open}
              aria-controls="bay-board"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Close board" : "Bay menu"}
            </button>
          </div>
        </div>

        <nav id="bay-board" aria-label="Service bays" className={`${open ? "block" : "hidden"} md:block`}>
          <ul className="flex flex-wrap gap-1.5">
            {NAV_ITEMS.map((item) => {
              const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`inline-block rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${
                      current
                        ? "bg-ticket text-ticket-ink"
                        : "border border-white/10 text-aluminum hover:border-ticket/50 hover:text-fluorescent"
                    }`}
                  >
                    {item.stamp}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
