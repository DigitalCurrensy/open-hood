"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EXPERT_NAV } from "@/config/nav/expert";

export function ExpertBoard() {
  const pathname = usePathname();

  return (
    <nav aria-label="Expert playbooks" className="no-print">
      <ul className="flex flex-wrap gap-1.5">
        {EXPERT_NAV.map((item) => {
          const current =
            item.href === "/expert"
              ? pathname === "/expert"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
