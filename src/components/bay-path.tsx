"use client";

import { BayLink } from "@/components/bay-link";
import { CONSUMER_PATH, isCurrentHref } from "@/config/nav/consumer";

interface BayPathProps {
  pathname: string;
  onNavigate?: () => void;
}

/** The three primary stamps. Canary ticket on the bay you are standing in, aluminum otherwise. */
export function BayPath({ pathname, onNavigate }: BayPathProps) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {CONSUMER_PATH.map((stamp) => {
        const current = isCurrentHref(pathname, stamp.href);
        return (
          <li key={stamp.href}>
            <BayLink
              href={stamp.href}
              aria-current={current ? "page" : undefined}
              title={stamp.blurb}
              onClick={onNavigate}
              className={`bay-stamp flex min-h-11 flex-col justify-center gap-0.5 rounded-sm px-3 py-1.5 ${
                current
                  ? "bg-ticket text-ticket-ink"
                  : "border border-white/15 text-aluminum hover:border-ticket/50 hover:text-fluorescent"
              }`}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{stamp.stamp}</span>
              <span
                className={`text-[10px] leading-3 ${current ? "text-ticket-ink/75" : "text-aluminum-dim"}`}
              >
                {stamp.label}
              </span>
            </BayLink>
          </li>
        );
      })}
    </ul>
  );
}
