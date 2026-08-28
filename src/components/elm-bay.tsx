"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  bluetoothGateServerSnapshot,
  bluetoothGateSnapshot,
  Elm327Error,
  Elm327Session,
  hasWebBluetooth,
  subscribeBluetoothGate,
} from "@/lib/obd";

type ElmPhase = "idle" | "pairing" | "live";

const COPY: Record<Exclude<ReturnType<typeof bluetoothGateSnapshot>, "pending">, { title: string; body: string }> = {
  ios: {
    title: "No Web Bluetooth on iPhone",
    body: "Safari has no Web Bluetooth — type the code from any $20 scanner, or use TestFlight native. Not an App Store listing. We never claim Safari BLE.",
  },
  insecure: {
    title: "Bluetooth needs HTTPS",
    body: "This tab is not a secure context. Open the bay on https or localhost, then Connect — or type the code.",
  },
  missing: {
    title: "This browser has no Bluetooth",
    body: "Use Chrome on Android. Firefox, desktop Safari, and most iOS browsers will not open a dongle. Type the code either way.",
  },
  ble: {
    title: "ELM327 over Web Bluetooth",
    body: "Chrome on Android can pair a BLE ELM327 and read stored codes. Classic Bluetooth pucks stay in Car Scanner or Torque — then type what they printed.",
  },
};

export function ElmBay({ onCodes }: { onCodes: (codes: string[]) => void }) {
  const gate = useSyncExternalStore(subscribeBluetoothGate, bluetoothGateSnapshot, bluetoothGateServerSnapshot);
  const [phase, setPhase] = useState<ElmPhase>("idle");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [device, setDevice] = useState<string | null>(null);
  const [pulled, setPulled] = useState<string[]>([]);
  const sessionRef = useRef<Elm327Session | null>(null);

  useEffect(() => {
    return () => {
      sessionRef.current?.disconnect();
      sessionRef.current = null;
    };
  }, []);

  const copy =
    gate === "pending"
      ? { title: "ELM327", body: "Checking whether this browser can open Web Bluetooth." }
      : COPY[gate];
  const canConnect = gate === "ble" && !busy && phase !== "pairing";

  function dropSession() {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
  }

  async function onConnect() {
    if (!hasWebBluetooth()) {
      setNote("Web Bluetooth is missing. Use Chrome on Android — or type the code.");
      return;
    }
    setBusy(true);
    setPhase("pairing");
    setNote("Picker is open. Park first. Do not pair while driving.");
    try {
      const session = await Elm327Session.request();
      sessionRef.current = session;
      await session.init();
      const codes = await session.readDtcs();
      setDevice(session.deviceName);
      setPulled(codes.dtcs);
      setPhase("live");
      setNote(
        codes.fault ??
          (codes.dtcs.length
            ? "Stored codes from Mode 03. Pick one to translate, then take it to quote defense."
            : "Mode 03 returned no stored codes. Type one if the tool printed it."),
      );
      if (codes.dtcs.length) onCodes(codes.dtcs);
    } catch (error) {
      dropSession();
      setPhase("idle");
      setDevice(null);
      setPulled([]);
      setNote(error instanceof Elm327Error || error instanceof Error ? error.message : "Pairing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onReadCodes() {
    const session = sessionRef.current;
    if (!session) return;
    setBusy(true);
    try {
      const codes = await session.readDtcs();
      setPulled(codes.dtcs);
      setNote(codes.fault ?? (codes.dtcs.length ? "Stored codes from Mode 03." : "Mode 03 returned no stored codes."));
      if (codes.dtcs.length) onCodes(codes.dtcs);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Mode 03 failed.");
    } finally {
      setBusy(false);
    }
  }

  function onDisconnect() {
    dropSession();
    setPhase("idle");
    setDevice(null);
    setNote("Disconnected. Park before you pair again.");
  }

  return (
    <section className="desk-tap overflow-hidden rounded-sm border border-white/10 bg-bay-2/80">
      <div className="border-l-4 border-cone px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Park first · Mode 03</p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">{copy.body}</p>

        {gate === "ble" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canConnect}
              onClick={() => void onConnect()}
              className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:cursor-not-allowed disabled:bg-steel disabled:text-aluminum"
            >
              {phase === "pairing" ? "Pairing…" : "Connect ELM327"}
            </button>
            {phase === "live" ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onReadCodes()}
                  className="min-h-11 rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent"
                >
                  Read stored codes
                </button>
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="min-h-11 rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum"
                >
                  Disconnect
                </button>
              </>
            ) : null}
          </div>
        ) : gate === "ios" || gate === "missing" || gate === "insecure" ? (
          <p className="mt-4 border-l-2 border-cone pl-3 text-sm leading-6 text-fluorescent">
            {gate === "ios"
              ? "No Web Bluetooth — type the code or use TestFlight native."
              : gate === "insecure"
                ? "HTTPS or localhost first. Then Chrome on Android, or type the code."
                : "Chrome on Android is the dongle path. Type the code on this desk either way."}
          </p>
        ) : null}

        {device ? (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">{device}</p>
        ) : null}
        {note ? <p className="mt-3 text-sm leading-6 text-fluorescent">{note}</p> : null}

        {pulled.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {pulled.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onCodes([code])}
                className="min-h-11 rounded-sm border border-ticket/50 px-3 py-1.5 font-mono text-sm uppercase tracking-[0.14em] text-ticket"
              >
                {code}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
