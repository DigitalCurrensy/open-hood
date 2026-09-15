"use client";

import { useEffect, useState } from "react";
import {
  applyUnlockIfRequested,
  canShareBay,
  escapeOfflineShellIfOnline,
  rescueFirstVisitToLiveBay,
  isStandaloneDisplay,
  PWA_INSTALL_DISMISS_KEY,
  registerPwa,
  releaseCrossSessionGuard,
  shareBay,
  syncBaySnapshot,
} from "@/lib/pwa";
import { useIdentifiedVehicle, useLastQuote } from "@/lib/vehicle-session";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function installHintBlocked(): boolean {
  if (isStandaloneDisplay()) return true;
  try {
    if (window.localStorage.getItem(PWA_INSTALL_DISMISS_KEY) === "1") return true;
    if (window.sessionStorage.getItem(PWA_INSTALL_DISMISS_KEY) === "1") return true;
  } catch {
    /* private mode */
  }
  return false;
}

function dismissInstallHint(): void {
  try {
    window.localStorage.setItem(PWA_INSTALL_DISMISS_KEY, "1");
    window.sessionStorage.setItem(PWA_INSTALL_DISMISS_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function PwaBoot() {
  const [install, setInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [vehicle] = useIdentifiedVehicle();
  const [quote] = useLastQuote();

  useEffect(() => {
    if (applyUnlockIfRequested()) return;
    if (rescueFirstVisitToLiveBay()) return;
    releaseCrossSessionGuard();
    registerPwa();
    void escapeOfflineShellIfOnline();
  }, []);

  useEffect(() => {
    syncBaySnapshot();
  }, [vehicle, quote]);

  useEffect(() => {
    if (installHintBlocked()) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function onShare() {
    const result = await shareBay();
    if (result === "copied") {
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2000);
    }
  }

  if (!install || installHintBlocked()) return null;

  return (
    <div
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-bay-2/95 px-4 py-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-aluminum">Optional: pin this site. Not an app store listing.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
            onClick={() => {
              void install.prompt();
              setInstall(null);
            }}
          >
            Add to home screen
          </button>
          {canShareBay() ? (
            <button type="button" className="min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent" onClick={() => void onShare()}>
              {shareState === "copied" ? "Copied" : "Share"}
            </button>
          ) : null}
          <button
            type="button"
            className="min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
            onClick={() => {
              dismissInstallHint();
              setInstall(null);
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
