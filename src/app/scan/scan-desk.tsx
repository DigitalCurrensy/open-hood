"use client";

import { ScanPanels } from "@/app/scan/scan-panels";
import { useReadingLevel } from "@/components/reading-level";
import { isPlausibleDtc, lookupDtc, normalizeDtc, SAMPLE_DTCS } from "@/lib/dtc";
import {
  bluetoothGateServerSnapshot,
  bluetoothGateSnapshot,
  celsiusToFahrenheit,
  coreObdHref,
  demoSnapshot,
  Elm327Error,
  Elm327Session,
  emptySnapshot,
  hasWebBluetooth,
  jobsObdHref,
  kphToMph,
  PIDS_SUPPORTED,
  subscribeBluetoothGate,
  type LiveSnapshot,
} from "@/lib/obd";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import "./scan.css";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-lg uppercase tracking-[0.2em] text-fluorescent placeholder:text-aluminum/40";

type ScanPhase = "idle" | "pairing" | "live" | "demo";

export function ScanDesk({ initialCode = "" }: { initialCode?: string }) {
  const [level] = useReadingLevel();
  const expert = level === "expert";
  const gate = useSyncExternalStore(subscribeBluetoothGate, bluetoothGateSnapshot, bluetoothGateServerSnapshot);
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<LiveSnapshot>(() => emptySnapshot());
  const [note, setNote] = useState("");
  const [typed, setTyped] = useState(initialCode.toUpperCase());
  const sessionRef = useRef<Elm327Session | null>(null);
  const stopPoll = useRef(false);

  useEffect(() => {
    return () => {
      stopPoll.current = true;
      sessionRef.current?.disconnect();
      sessionRef.current = null;
    };
  }, []);

  const preview = useMemo(() => (typed ? lookupDtc(typed) : null), [typed]);
  const canConnect = gate === "ble" && !busy && phase !== "pairing";

  function dropSession() {
    stopPoll.current = true;
    sessionRef.current?.disconnect();
    sessionRef.current = null;
  }

  async function onConnect() {
    if (!hasWebBluetooth()) {
      setNote("Web Bluetooth is missing. Use Chrome on Android or a USB adapter.");
      return;
    }
    setBusy(true);
    setPhase("pairing");
    setNote("Picker is open. Park first. Do not pair while driving.");
    try {
      const session = await Elm327Session.request();
      sessionRef.current = session;
      await session.init();
      const snap = await session.snapshot();
      setLive(snap);
      setPhase("live");
      setNote(snap.fault ?? "Bus is up. Engine running for live PIDs. Stay parked.");
      stopPoll.current = false;
      void poll(session);
    } catch (error) {
      dropSession();
      setPhase("idle");
      setNote(error instanceof Elm327Error || error instanceof Error ? error.message : "Pairing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function poll(session: Elm327Session) {
    while (!stopPoll.current && sessionRef.current === session) {
      try {
        const pids = await session.readPids();
        if (stopPoll.current) return;
        setLive((current) => ({
          ...current,
          source: "live",
          rpm: pids.rpm,
          speedKph: pids.speedKph,
          coolantC: pids.coolantC,
          raw: { ...current.raw, ...pids.raw },
          fault: pids.fault,
          deviceName: session.deviceName,
        }));
        await wait(900);
      } catch (error) {
        if (stopPoll.current) return;
        setNote(error instanceof Error ? error.message : "Poll stopped.");
        dropSession();
        setPhase("idle");
        return;
      }
    }
  }

  async function onReadCodes() {
    const session = sessionRef.current;
    if (!session) return;
    setBusy(true);
    try {
      const codes = await session.readDtcs();
      setLive((current) => ({
        ...current,
        dtcs: codes.dtcs,
        raw: { ...current.raw, "03": codes.raw },
        fault: codes.fault,
      }));
      setNote(codes.fault ?? (codes.dtcs.length ? "Stored codes from Mode 03." : "Mode 03 returned no stored codes."));
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Mode 03 failed.");
    } finally {
      setBusy(false);
    }
  }

  function onDemo() {
    dropSession();
    const snap = demoSnapshot();
    setLive(snap);
    setPhase("demo");
    setNote("Demo PIDs. Same parser as a dongle. Not a live bus.");
  }

  function onDisconnect() {
    dropSession();
    setLive(emptySnapshot());
    setPhase("idle");
    setNote("Disconnected. Park before you pair again.");
  }

  function onType(event: FormEvent<HTMLFormElement>) {
    const code = normalizeDtc(typed);
    if (!isPlausibleDtc(code)) {
      event.preventDefault();
      setNote(lookupDtc(typed).error ?? "Use the 5-character form from the scanner.");
    }
  }

  const mph = live.speedKph === null ? null : Math.round(kphToMph(live.speedKph));
  const ectF = live.coolantC === null ? null : Math.round(celsiusToFahrenheit(live.coolantC));

  return (
    <div className="space-y-4">
      <aside className="overflow-hidden rounded-sm border border-cone/50 bg-bay-2/80">
        <div className="scan-safety" aria-hidden="true" />
        <div className="px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Park first</p>
          <p className="mt-1 text-sm leading-6 text-aluminum">
            Set the brake. Do not pair, poll, or watch this screen while the car is moving. Live RPM and coolant need
            the engine running. Speed should stay 0 — you are parked. Stored codes work key-on, engine off.
          </p>
        </div>
      </aside>

      <div className="grid gap-4 md:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4">
          <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
              {expert ? "ATZ · ATE0 · BLE UART" : "Dongle or demo"}
            </p>
            <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">
              {gate === "ios"
                ? "No Web Bluetooth on iPhone"
                : gate === "insecure"
                  ? "Bluetooth needs HTTPS"
                  : gate === "missing"
                    ? "This browser has no Bluetooth"
                    : "ELM327 over Web Bluetooth"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-aluminum">
              {gate === "ios"
                ? "Safari has no Web Bluetooth — type the code from any $20 scanner. A native BLE path is paper (TestFlight), not an App Store listing."
                : gate === "insecure"
                  ? "This tab is not a secure context. Open the bay on https or localhost, then Connect — or type the code."
                  : gate === "missing"
                    ? "Use Chrome on Android or a USB adapter. Firefox, desktop Safari, and most iOS browsers will not open a dongle. Type the code either way."
                    : expert
                      ? "Connect asks for a BLE UART (Nordic / FFE0 / FFF0). ATZ then ATE0. Mode 01 PID 0C / 0D / 05. Mode 03 stored DTCs. Classic SPP pucks stay in Car Scanner or Torque."
                      : "Chrome on Android can pair a BLE ELM327. A $15 Classic Bluetooth puck will not show up here — use Car Scanner or Torque, then type the code."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!canConnect}
                onClick={() => void onConnect()}
                className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:cursor-not-allowed disabled:bg-steel disabled:text-aluminum"
              >
                {phase === "pairing" ? "Pairing…" : "Connect ELM327"}
              </button>
              <button
                type="button"
                onClick={onDemo}
                className="rounded-sm border border-ticket/60 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket"
              >
                Load demo PIDs
              </button>
              {phase === "live" ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onReadCodes()}
                    className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
                  >
                    Read stored codes
                  </button>
                  <button
                    type="button"
                    onClick={onDisconnect}
                    className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum"
                  >
                    Disconnect
                  </button>
                </>
              ) : null}
            </div>

            {gate === "ios" || gate === "insecure" || gate === "missing" ? (
              <p className="mt-4 border-l-2 border-cone pl-3 text-sm leading-6 text-fluorescent">
                {gate === "ios"
                  ? "No Web Bluetooth — type the code."
                  : gate === "insecure"
                    ? "HTTPS or localhost first. Then Chrome on Android, or type the code."
                    : "Chrome on Android is the dongle path. Type the code on this desk either way."}
              </p>
            ) : (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
                Connect is gated on navigator.bluetooth
              </p>
            )}
            {note ? <p className="mt-3 text-sm leading-6 text-fluorescent">{note}</p> : null}
          </section>

          <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <h2 className="font-display text-2xl uppercase tracking-wide">Type the code</h2>
            <p className="mt-1 text-sm leading-6 text-aluminum">
              Same book as{" "}
              <Link href="/obd" className="text-ticket">
                /obd
              </Link>
              . The jobs dictionary is the larger pamphlet.
            </p>
            <form action="/obd" method="get" onSubmit={onType}>
              <label className="mt-4 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">DTC from any scanner</span>
                <input
                  name="code"
                  value={typed}
                  onChange={(event) => setTyped(event.target.value.toUpperCase())}
                  spellCheck={false}
                  autoCapitalize="characters"
                  autoComplete="off"
                  placeholder="P0420"
                  maxLength={8}
                  className={FIELD}
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
                >
                  Open /obd
                </button>
                <Link
                  href={jobsObdHref(typed)}
                  className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
                >
                  Jobs dictionary
                </Link>
              </div>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLE_DTCS.map((code) => (
                <Link
                  key={code}
                  href={coreObdHref(code)}
                  className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[11px] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
                >
                  {code}
                </Link>
              ))}
            </div>
            {preview?.error ? (
              <p className="mt-3 text-sm leading-6 text-cone">{preview.error}</p>
            ) : preview?.valid ? (
              <p className="mt-3 text-sm leading-6 text-aluminum">
                <span className="font-mono text-ticket">{preview.code}</span>{" "}
                {preview.entry?.title ?? preview.generic?.system ?? "in the book layout"}
              </p>
            ) : null}
          </section>
        </div>

        <ScanLcd live={live} mph={mph} ectF={ectF} expert={expert} />
      </div>

      <ScanPanels />
    </div>
  );
}

function ScanLcd({
  live,
  mph,
  ectF,
  expert,
}: {
  live: LiveSnapshot;
  mph: number | null;
  ectF: number | null;
  expert: boolean;
}) {
  const stamp = live.source === "live" ? "Live" : live.source === "demo" ? "Demo" : "No bus";

  return (
    <section className="scan-lcd rounded-sm p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-aluminum">
            ELM327 · Mode 01 / 03
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-fluorescent">Handheld copy</h2>
        </div>
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-aluminum">
          <span className="scan-live-dot" data-on={live.source} />
          {stamp}
        </p>
      </div>
      <p className="mt-1 font-mono text-[11px] text-aluminum">{live.deviceName ?? "No adapter"}</p>

      <dl className="mt-5">
        <LcdRow label="RPM" unit="rpm" value={formatPid(live.rpm, (n) => Math.round(n))} />
        <LcdRow
          label="Speed"
          unit={expert ? "km/h" : "mph"}
          value={
            expert
              ? formatPid(live.speedKph, (n) => Math.round(n))
              : formatPid(mph, (n) => n)
          }
        />
        <LcdRow
          label="ECT"
          unit={expert ? "°C" : "°F"}
          value={
            expert
              ? formatPid(live.coolantC, (n) => Math.round(n))
              : formatPid(ectF, (n) => n)
          }
        />
      </dl>

      <div className="scan-cell mt-2 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">Mode 03 · stored</p>
        {live.dtcs.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {live.source === "idle" ? "No codes yet. Demo or Connect, or type one." : "No stored codes on this read."}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {live.dtcs.map((code) => {
              const hit = lookupDtc(code);
              return (
                <li key={code} className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="scan-digit font-mono text-lg text-fluorescent">{code}</span>
                  <span className="text-sm text-aluminum">{hit.entry?.title ?? hit.generic?.subsystem ?? "translate"}</span>
                  <span className="flex gap-2 font-mono text-[11px]">
                    <Link href={coreObdHref(code)} className="text-ticket">
                      /obd
                    </Link>
                    <Link href={jobsObdHref(code)} className="text-ticket">
                      /jobs/obd
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {expert ? (
        <ul className="mt-4 space-y-1 font-mono text-[11px] text-aluminum">
          {PIDS_SUPPORTED.map((pid) => (
            <li key={pid.request}>
              {pid.request} · {pid.formula}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-aluminum">
        Generic SAE only. Not Snap-on. Not Autel.
      </p>
    </section>
  );
}

function LcdRow({ label, unit, value }: { label: string; unit: string; value: string }) {
  return (
    <div className="scan-cell flex items-end justify-between gap-3 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">{label}</dt>
      <dd className="scan-digit font-mono text-4xl leading-none text-fluorescent sm:text-5xl">
        {value}
        <span className="ml-2 font-mono text-sm text-aluminum"> {unit}</span>
      </dd>
    </div>
  );
}

function formatPid(value: number | null, show: (n: number) => number): string {
  if (value === null || Number.isNaN(value)) return "—";
  return String(show(value));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
