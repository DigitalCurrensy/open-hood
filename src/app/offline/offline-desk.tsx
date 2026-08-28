"use client";

import { useEffect, useState } from "react";
import { type BaySnapshot, PWA_UNLOCK_HREF, readBaySnapshot, readCachedBaySnapshot } from "@/lib/pwa";

/** localStorage first — it survives offline. The SW cache is the backup when the tab has no bay state. */
async function loadSnapshot(): Promise<BaySnapshot | null> {
  return readBaySnapshot() ?? (await readCachedBaySnapshot());
}

export function OfflineDesk() {
  const [snapshot, setSnapshot] = useState<BaySnapshot | null>(null);
  const [read, setRead] = useState(false);

  useEffect(() => {
    let active = true;

    const apply = (next: BaySnapshot | null, markRead: boolean) => {
      if (!active) return;
      if (next) setSnapshot(next);
      if (markRead) setRead(true);
    };

    void loadSnapshot().then((next) => apply(next, true));

    const retry = () => {
      void loadSnapshot().then((next) => apply(next, Boolean(next)));
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", retry);
      void navigator.serviceWorker.ready.then(retry);
    }

    return () => {
      active = false;
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", retry);
      }
    };
  }, []);

  const packet = snapshot?.packet ?? null;
  const specs = snapshot?.vehicle?.specs ?? null;
  const plate = [
    packet?.headline,
    [packet?.year || snapshot?.year, packet?.make || snapshot?.make, packet?.model || snapshot?.model]
      .filter(Boolean)
      .join(" ")
      .trim(),
  ]
    .find((line) => Boolean(line && line.trim()))
    ?.trim() ?? "";
  const vin = packet?.vin || specs?.vin || "";
  const engine = packet?.engine || specs?.engineDisplacement || "";
  const oil = packet?.oil || "";
  const script = snapshot?.script ?? [];

  return (
    <div className="space-y-4">
      <section className="rounded-sm border-2 border-ticket-ink bg-ticket p-6 text-ticket-ink sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em]">Rescue · leftover worker</p>
        <h2 className="mt-2 font-display text-5xl uppercase leading-[0.88] sm:text-7xl">
          Leftover SW or dead :3100
        </h2>
        <p className="mt-4 font-display text-2xl uppercase leading-none sm:text-4xl">Live bay is :3000</p>
        <p className="mt-4 max-w-2xl text-sm leading-6 sm:text-base">
          This is leftover service-worker paint, or a dead <span className="font-mono">localhost:3100</span> tab from an
          old <span className="font-mono">next start</span>. The live Next server is{" "}
          <a href="http://localhost:3000/" className="underline decoration-ticket-ink/40 underline-offset-2">
            http://localhost:3000
          </a>
          . This waiting-room page is honest. It is not the quote desk, the directory, or the recalls file.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          Auto-rescue wipes the worker and opens the live bay when <span className="font-mono">/</span> is up. Unlock
          is a backup if that miss — use it on :3000, not :3100.
        </p>
        <a
          href={PWA_UNLOCK_HREF}
          className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-ticket-ink px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket"
        >
          Unlock the live bay · /?unlock=1
        </a>
      </section>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Still on the lift</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-white/15 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ticket">Last car</p>
            {!read ? (
              <p className="mt-2 text-sm leading-6 text-aluminum">Reading the phone…</p>
            ) : plate ? (
              <>
                <p className="mt-1 font-display text-2xl uppercase leading-tight text-fluorescent">{plate}</p>
                {vin ? (
                  <p className="mt-1 break-all font-mono text-xs uppercase tracking-[0.12em] text-aluminum">
                    VIN {vin}
                  </p>
                ) : null}
                {engine ? <p className="mt-1 font-mono text-xs text-aluminum">{engine}</p> : null}
                {oil ? (
                  <p className="mt-1 text-sm leading-6 text-aluminum">
                    Oil {oil}
                    {packet?.oilSource === "heuristic" ? " — typical, confirm the cap" : null}
                  </p>
                ) : null}
                {packet && packet.campaignCount > 0 ? (
                  <p className="mt-1 font-mono text-xs text-aluminum">
                    {packet.campaignCount} nameplate campaign{packet.campaignCount === 1 ? "" : "s"} on the last pull
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-aluminum">No car in the bay.</p>
            )}
          </div>

          <div className="rounded-sm border border-white/15 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ticket">Last mechanic script</p>
            {!read ? (
              <p className="mt-2 text-sm leading-6 text-aluminum">Reading the phone…</p>
            ) : script.length > 0 ? (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-aluminum">
                {script.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-aluminum">No ticket marked yet.</p>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-aluminum">
          Read those lines to the service writer. Nothing here re-checks the price book — that needs the live bay on
          :3000.
        </p>
      </section>
    </div>
  );
}
