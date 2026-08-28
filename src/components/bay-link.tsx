"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { hardOpenHref } from "@/lib/pwa";

/**
 * Header stamps are real `<a href>`s. Soft App Router nav can sit on
 * `loading.tsx` ("Opening bay…") forever; a leftover worker can also keep
 * WI-FI DROPPED painted. Full document loads leave both traps.
 */
export function BayLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const dest = typeof href === "string" ? href : href.pathname ?? "/";

  return (
    <Link
      href={href}
      {...props}
      prefetch={false}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        hardOpenHref(dest);
      }}
    />
  );
}
