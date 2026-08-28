"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  applyUnlockIfRequested,
  canShareBay,
  escapeOfflineShellIfOnline,
  rescueFirstVisitToLiveBay,
  isAndroidDevice,
  isIosDevice,
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

function subscribeInstallDismiss(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function installHintBlocked(): boolean {
  if (isStandaloneDisplay()) return true;
  try {
    if (window.sessionStorage.getItem(PWA_INSTALL_DISMISS_KEY) === "1") return true;
  } catch {
    /* private mode */
  }
  return false;
}

function iosHintSnapshot(): boolean {
  if (installHintBlocked()) return false;
  return isIosDevice();
}

function androidManualSnapshot(): boolean {
  if (installHintBlocked()) return false;
  if (isIosDevice()) return false;
  return isAndroidDevice();
}

function dismissInstallHint(): void {
  try {
    window.sessionStorage.setItem(PWA_INSTALL_DISMISS_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function PwaBoot() {
  const [install, setInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [androidHint, setAndroidHint] = useState(false);
  const [androidManual, setAndroidManual] = useState(false);
  const [iosDismissed, setIosDismissed] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const iosEligible = useSyncExternalStore(subscribeInstallDismiss, iosHintSnapshot, () => false);
  const androidEligible = useSyncExternalStore(subscribeInstallDismiss, androidManualSnapshot, () => false);
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
      setAndroidHint(true);
      setAndroidManual(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  useEffect(() => {
    if (!androidEligible || install) return;
    const timer = window.setTimeout(() => {
      if (installHintBlocked()) return;
      setAndroidManual(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [androidEligible, install]);

  async function onShare() {
    const result = await shareBay();
    if (result === "copied") {
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2000);
    }
  }

  if (iosEligible && !iosDismissed) {
    return (
      <div
        className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-ticket/40 bg-bay-2/95 px-4 py-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-fluorescent">
            Pin this website — Share → Add to Home Screen. Same bay, not an App Store app. Safari has no
            Web Bluetooth — type the code, or use TestFlight native when invited.
          </p>
          <div className="flex flex-wrap gap-2">
            {canShareBay() ? (
              <button
                type="button"
                className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
                onClick={() => void onShare()}
              >
                {shareState === "copied" ? "Link copied" : "Share → Add to Home Screen"}
              </button>
            ) : (
              <button
                type="button"
                className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
                onClick={() => void onShare()}
              >
                {shareState === "copied" ? "Link copied" : "Copy bay link"}
              </button>
            )}
            <button
              type="button"
              className="min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
              onClick={() => {
                dismissInstallHint();
                setIosDismissed(true);
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (androidHint && install) {
    return (
      <div
        className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-ticket/40 bg-bay-2/95 px-4 py-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-fluorescent">
            Pin this bay to the home screen. Same website — not a Play Store app. Chrome on Android can pair a
            BLE ELM327; iPhone still types the code.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
              onClick={() => {
                void install.prompt();
                setAndroidHint(false);
                setInstall(null);
              }}
            >
              Add to home screen
            </button>
            <button
              type="button"
              className="min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
              onClick={() => {
                dismissInstallHint();
                setAndroidHint(false);
              }}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!androidManual) return null;

  return (
    <div
      className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-ticket/40 bg-bay-2/95 px-4 py-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-fluorescent">
          Pin this website — Chrome menu → Add to Home screen. Same bay, not a Play Store app.
        </p>
        <div className="flex flex-wrap gap-2">
          {canShareBay() ? (
            <button
              type="button"
              className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
              onClick={() => void onShare()}
            >
              {shareState === "copied" ? "Link copied" : "Share this bay"}
            </button>
          ) : null}
          <button
            type="button"
            className="min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
            onClick={() => {
              dismissInstallHint();
              setAndroidManual(false);
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
