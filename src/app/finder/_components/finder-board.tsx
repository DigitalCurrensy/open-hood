"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FINDER_NAV } from "@/config/nav/finder";

export function FinderBoard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const here = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <nav aria-label="Fix Finder aisle" className="no-print">
      <ul className="flex flex-wrap gap-1.5">
        {FINDER_NAV.map((item) => {
          const current =
            item.href === "/finder"
              ? pathname === "/finder" && !searchParams.toString()
              : here === item.href || pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
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
  );
}
