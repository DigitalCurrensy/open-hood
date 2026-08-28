import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BleManager } from "react-native-ble-plx";
import { jobsObdHref, postStoredDtc, quoteHref, type BayDtcResult } from "../api/dtc";
import { ElmNativeError, NativeElm327 } from "../ble/session";
import { requestBlePermissions } from "../permissions";
import { BAY } from "../theme";

type Phase = "idle" | "scanning" | "live";

const DEFAULT_ORIGIN = process.env.EXPO_PUBLIC_BAY_ORIGIN?.trim() || "http://localhost:3000";

export function BayScreen() {
  const managerRef = useRef<BleManager | null>(null);
  const sessionRef = useRef<NativeElm327 | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  const [typed, setTyped] = useState("");
  const [device, setDevice] = useState<string | null>(null);
  const [note, setNote] = useState("Park first. This is TestFlight / Play internal — not an App Store listing.");
  const [codes, setCodes] = useState<string[]>([]);
  const [lookup, setLookup] = useState<BayDtcResult | null>(null);

  useEffect(() => {
    managerRef.current = new BleManager();
    return () => {
      sessionRef.current?.disconnect();
      sessionRef.current = null;
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, []);

  function dropSession() {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
  }

  async function translate(code: string) {
    const stamp = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!stamp) return;
    setTyped(stamp);
    setBusy(true);
    try {
      const result = await postStoredDtc(origin, stamp);
      setLookup(result);
      setNote(result.entry?.title ?? result.generic?.hint ?? "Posted to the same Next dictionary.");
    } catch (error) {
      setLookup(null);
      setNote(error instanceof Error ? error.message : "POST failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onScan() {
    const manager = managerRef.current;
    if (!manager) return;
    setBusy(true);
    setPhase("scanning");
    setNote("Scanning BLE UART. Park. Do not pair while driving. Expo Go cannot do this — need a dev build.");
    try {
      await requestBlePermissions();
      dropSession();
      const session = await NativeElm327.scanAndConnect(manager);
      sessionRef.current = session;
      await session.init();
      const pulled = await session.readDtcs();
      setDevice(session.deviceName);
      setCodes(pulled.dtcs);
      setPhase("live");
      setNote(
        pulled.fault && pulled.dtcs.length === 0
          ? pulled.fault
          : pulled.dtcs.length
            ? "Mode 03 stored codes. Tap one to POST /api/jobs/dtc — same book as the website."
            : "Mode 03 returned no stored codes. Type one if the tool printed it.",
      );
      if (pulled.dtcs[0]) await translate(pulled.dtcs[0]);
    } catch (error) {
      dropSession();
      setPhase("idle");
      setDevice(null);
      setCodes([]);
      setNote(error instanceof ElmNativeError || error instanceof Error ? error.message : "Scan failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onRead() {
    const session = sessionRef.current;
    if (!session) return;
    setBusy(true);
    try {
      const pulled = await session.readDtcs();
      setCodes(pulled.dtcs);
      setNote(pulled.fault ?? (pulled.dtcs.length ? "Stored codes from Mode 03." : "Mode 03 returned no stored codes."));
      if (pulled.dtcs[0]) await translate(pulled.dtcs[0]);
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>Native bay · Mode 03</Text>
          <Text style={styles.title}>ELM327 over Core Bluetooth</Text>
          <Text style={styles.body}>
            iOS Safari has no Web Bluetooth — type the code there, or use this TestFlight build. Android Chrome already
            pairs in the website. This binary is not on the App Store.
          </Text>

          <View style={styles.ticket}>
            <Text style={styles.ticketKicker}>Store path · paper</Text>
            <Text style={styles.ticketTitle}>Not available on the App Store</Text>
            <Text style={styles.ticketBody}>
              Apple Developer + TestFlight internals. Play Console internal track. Pin the website with Add to Home
              Screen until a listing exists. Never claim Safari BLE.
            </Text>
          </View>

          <Text style={styles.label}>Next bay origin</Text>
          <TextInput
            value={origin}
            onChangeText={setOrigin}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="http://192.168.1.10:3000"
            placeholderTextColor={BAY.aluminum}
            style={styles.input}
          />

          <View style={styles.row}>
            <Pressable disabled={busy} onPress={() => void onScan()} style={[styles.primary, busy && styles.disabled]}>
              <Text style={styles.primaryLabel}>{phase === "scanning" ? "Scanning…" : "Scan BLE ELM327"}</Text>
            </Pressable>
            {phase === "live" ? (
              <>
                <Pressable disabled={busy} onPress={() => void onRead()} style={styles.ghost}>
                  <Text style={styles.ghostLabel}>Read stored codes</Text>
                </Pressable>
                <Pressable onPress={onDisconnect} style={styles.ghost}>
                  <Text style={styles.ghostMuted}>Disconnect</Text>
                </Pressable>
              </>
            ) : null}
          </View>

          {device ? <Text style={styles.device}>{device}</Text> : null}
          <Text style={styles.note}>{note}</Text>

          {codes.length > 0 ? (
            <View style={styles.row}>
              {codes.map((code) => (
                <Pressable key={code} onPress={() => void translate(code)} style={styles.codeChip}>
                  <Text style={styles.codeChipLabel}>{code}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text style={styles.label}>Type the code</Text>
          <TextInput
            value={typed}
            onChangeText={(value) => setTyped(value.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            placeholder="P0420"
            placeholderTextColor={BAY.aluminum}
            style={styles.input}
          />
          <View style={styles.row}>
            <Pressable disabled={busy} onPress={() => void translate(typed)} style={[styles.primary, busy && styles.disabled]}>
              <Text style={styles.primaryLabel}>POST /api/jobs/dtc</Text>
            </Pressable>
            {typed ? (
              <Pressable onPress={() => void Linking.openURL(quoteHref(origin, typed))} style={styles.ghost}>
                <Text style={styles.ghostLabel}>Type to quote</Text>
              </Pressable>
            ) : null}
          </View>

          {lookup ? (
            <View style={styles.card}>
              <Text style={styles.kicker}>{lookup.code}</Text>
              <Text style={styles.cardTitle}>{lookup.entry?.title ?? "Family still applies"}</Text>
              {lookup.entry ? (
                <>
                  <Text style={styles.body}>{lookup.entry.layperson}</Text>
                  <Text style={styles.warn}>{lookup.entry.doNotThrowParts}</Text>
                  <Text style={styles.body}>{lookup.entry.firstLook}</Text>
                </>
              ) : null}
              {lookup.generic ? <Text style={styles.body}>{lookup.generic.hint}</Text> : null}
              {lookup.error ? <Text style={styles.warn}>{lookup.error}</Text> : null}
              <Pressable onPress={() => void Linking.openURL(jobsObdHref(origin, lookup.code))} style={styles.ghost}>
                <Text style={styles.ghostLabel}>Open /jobs/obd</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BAY.oil },
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 12, paddingBottom: 48 },
  kicker: {
    color: BAY.cone,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  title: {
    color: BAY.fluorescent,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  body: { color: BAY.aluminum, fontSize: 15, lineHeight: 22 },
  ticket: { backgroundColor: BAY.ticket, padding: 16, gap: 6 },
  ticketKicker: {
    color: BAY.ticketInk,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.6,
    textTransform: "uppercase",
  },
  ticketTitle: { color: BAY.ticketInk, fontSize: 22, fontWeight: "800", textTransform: "uppercase" },
  ticketBody: { color: BAY.ticketInk, fontSize: 14, lineHeight: 20 },
  label: {
    color: BAY.aluminum,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 8,
  },
  input: {
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    backgroundColor: BAY.oil,
    color: BAY.fluorescent,
    fontSize: 16,
    letterSpacing: 1.4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  primary: { backgroundColor: BAY.ticket, minHeight: 44, paddingHorizontal: 16, justifyContent: "center" },
  primaryLabel: { color: BAY.ticketInk, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase", fontSize: 12 },
  ghost: {
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  ghostLabel: { color: BAY.fluorescent, letterSpacing: 1.4, textTransform: "uppercase", fontSize: 12 },
  ghostMuted: { color: BAY.aluminum, letterSpacing: 1.4, textTransform: "uppercase", fontSize: 12 },
  disabled: { opacity: 0.45 },
  device: { color: BAY.ticket, letterSpacing: 1.6, textTransform: "uppercase", fontSize: 11 },
  note: { color: BAY.fluorescent, fontSize: 15, lineHeight: 22 },
  codeChip: { borderColor: "rgba(243,211,107,0.5)", borderWidth: 1, minHeight: 44, paddingHorizontal: 12, justifyContent: "center" },
  codeChipLabel: { color: BAY.ticket, letterSpacing: 1.6, fontSize: 14 },
  card: { backgroundColor: BAY.bay2, borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, padding: 16, gap: 8 },
  cardTitle: { color: BAY.fluorescent, fontSize: 24, fontWeight: "800", textTransform: "uppercase" },
  warn: { color: BAY.fluorescent, borderLeftColor: BAY.grease, borderLeftWidth: 2, paddingLeft: 10, lineHeight: 22 },
});
