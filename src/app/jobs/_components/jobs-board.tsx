"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JOB_NAV } from "@/config/nav/jobs";

export function JobsBoard() {
  const pathname = usePathname();

  return (
    <nav aria-label="Job-role desks" className="no-print">
      <ul className="flex flex-wrap gap-1.5">
        {JOB_NAV.map((item) => {
          const current = item.href === "/jobs" ? pathname === "/jobs" : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
