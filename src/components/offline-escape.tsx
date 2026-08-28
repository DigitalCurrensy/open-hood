"use client";

import { useEffect, useLayoutEffect } from "react";
import { escapeOfflineShellIfOnline, hardOpenHref, PWA_UNLOCK_HREF, shouldHardNavigate } from "@/lib/pwa";

function inAppHref(href: string | null): href is string {
  if (!href) return false;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      return new URL(href).origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return href.startsWith("/");
}

/** Visible way off the waiting-room fallback, plus a hard-nav net over every in-app link. */
export function OfflineEscape() {
  useLayoutEffect(() => {
    void escapeOfflineShellIfOnline();
    const retry = () => {
      void escapeOfflineShellIfOnline();
    };
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!inAppHref(href)) return;
      if (new URL(href, window.location.origin).searchParams.get("unlock") === "1") return;
      if (!shouldHardNavigate(window.location.pathname)) return;
      event.preventDefault();
      hardOpenHref(href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-ticket/50 bg-bay-2/80 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-6 text-fluorescent">
        Leftover worker or a dead :3100 tab can keep you here. Live Next is :3000. This desk leaves on its own when{" "}
        <span className="font-mono">/</span> is up. Unlock is visible, not required.
      </p>
      <a
        href={PWA_UNLOCK_HREF}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
      >
        Unlock the live bay · /?unlock=1
      </a>
    </div>
  );
}
