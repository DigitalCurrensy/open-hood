import { parseReadingLevel, READING_LEVEL_STORAGE_KEY } from "@/config/nav/ux";
import type { AgentUiMessage } from "@/lib/agent/thread";
import { readBayItem, writeBayItem } from "@/lib/bay-storage";
import {
  buildReportPacket,
  hasVehicleIdentity,
  type ReportMode,
  type ReportPacket,
  type ReportPacketInput,
  type ReportSymptom,
} from "@/lib/report/packet";
import { parseStoredLog } from "@/lib/service-log/parse";
import { SERVICE_LOG_STORAGE_KEY, type ServiceLogEntry } from "@/lib/service-log/types";
import type { IdentifiedVehicle, QuoteAnalysisResult } from "@/lib/types";

export const VEHICLE_SESSION_KEY = "openhood.vehicle";
export const QUOTE_SESSION_KEY = "openhood.quote";
export const FINDINGS_SESSION_KEY = "openhood.findings";
export const PACKET_SESSION_KEY = "openhood.report";

export interface ClientReportInput extends ReportPacketInput {
  scripts?: string[];
  facts?: string[];
}

export interface SessionFinds {
  findings?: ReportPacketInput["findings"];
  symptoms?: ReportPacketInput["symptoms"];
  codes?: ReportPacketInput["codes"];
  playbookTicks?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readRaw(key: string): string | null {
  return readBayItem(key);
}

function writeRaw(key: string, value: string | null) {
  writeBayItem(key, value);
}

export function readSessionJson(key: string): unknown {
  const raw = readRaw(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function readIdentifiedVehicle(): IdentifiedVehicle | null {
  const value = readSessionJson(VEHICLE_SESSION_KEY);
  return isRecord(value) && isRecord(value.specs) ? (value as unknown as IdentifiedVehicle) : null;
}

export function readLastQuote(): QuoteAnalysisResult | null {
  const value = readSessionJson(QUOTE_SESSION_KEY);
  return isRecord(value) && (Array.isArray(value.flaggedItems) || Array.isArray(value.mechanicScript))
    ? (value as unknown as QuoteAnalysisResult)
    : null;
}

export function readStoredPacket(): ReportPacket | null {
  const value = readSessionJson(PACKET_SESSION_KEY);
  if (!isRecord(value) || !isRecord(value.vehicle)) return null;
  try {
    return buildReportPacket({ packet: value as Partial<ReportPacket> });
  } catch {
    return null;
  }
}

export function persistPacket(packet: ReportPacket) {
  writeRaw(PACKET_SESSION_KEY, JSON.stringify(packet));
}

export function readReadingLevel(): ReportMode {
  try {
    const stored = window.localStorage.getItem(READING_LEVEL_STORAGE_KEY);
    const next = parseReadingLevel(stored) ?? "beginner";
    if (stored === "dummy" || stored === "shop-talk") {
      window.localStorage.setItem(READING_LEVEL_STORAGE_KEY, next);
    }
    return next;
  } catch {
    return "beginner";
  }
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const rows = value.filter((row): row is string => typeof row === "string" && row.trim().length > 0);
  return rows.length ? rows : undefined;
}

function asLooseArray(value: unknown): ReportPacketInput["findings"] | undefined {
  return Array.isArray(value) && value.length ? (value as ReportPacketInput["findings"]) : undefined;
}

/** Read openhood.findings whether it is an array or a bag of arrays. */
export function readFindingsBag(): SessionFinds {
  const value = readSessionJson(FINDINGS_SESSION_KEY);
  if (!value) return {};
  if (Array.isArray(value)) return { findings: value as ReportPacketInput["findings"] };
  if (!isRecord(value)) return {};
  return {
    findings: asLooseArray(value.findings),
    symptoms: asLooseArray(value.symptoms),
    codes: asLooseArray(value.codes),
    playbookTicks: asStringArray(value.playbookTicks),
  };
}

function vinOf(vehicle: IdentifiedVehicle | null, packet: ReportPacket | null): string {
  return (vehicle?.specs.vin || packet?.vehicle.vin || "").trim().toUpperCase();
}

function storedIfSameCar(vehicle: IdentifiedVehicle | null): ReportPacket | undefined {
  const stored = readStoredPacket();
  if (!stored) return undefined;
  const liveVin = vinOf(vehicle, null);
  const storedVin = (stored.vehicle.vin || "").trim().toUpperCase();
  if (liveVin && storedVin && liveVin !== storedVin) return undefined;
  return stored;
}

function codesFromFacts(facts: string[]): string[] {
  const codes: string[] = [];
  const seen = new Set<string>();
  for (const fact of facts) {
    for (const match of fact.matchAll(/\b[PCBU][0-9]{4}\b/gi)) {
      const code = match[0].toUpperCase();
      if (seen.has(code)) continue;
      seen.add(code);
      codes.push(code);
    }
  }
  return codes;
}

function scriptsAsSymptoms(scripts: string[]): ReportSymptom[] {
  return scripts
    .map((line) => line.trim())
    .filter(Boolean)
    .map((askTheShop) => ({ title: "Advocate brief", askTheShop }));
}

export function extrasFromAgent(opts: {
  vehicle: IdentifiedVehicle | null;
  mileage: string;
  messages: AgentUiMessage[];
}): ClientReportInput {
  const lastReply = [...opts.messages].reverse().find((row) => row.reply)?.reply;
  const lastUser = [...opts.messages].reverse().find((row) => row.role === "user" && row.content.trim());
  const scripts = lastReply?.scripts.filter((line) => line.trim()) ?? [];
  const facts = lastReply?.facts.filter((line) => line.trim()) ?? [];
  const extras: ClientReportInput = {};

  const mileage = opts.mileage.trim() || opts.vehicle?.specs.mileage;
  const concern = opts.vehicle?.specs.concern?.trim() || lastUser?.content.trim().slice(0, 160);
  if (opts.vehicle) {
    extras.vehicle = {
      specs: {
        ...opts.vehicle.specs,
        mileage: mileage || opts.vehicle.specs.mileage,
        concern: concern || opts.vehicle.specs.concern,
      },
      fluids: opts.vehicle.fluids,
    };
  } else if (mileage || concern) {
    extras.vehicle = {
      mileage: mileage || undefined,
      concern: concern || undefined,
    };
  }
  if (scripts.length) extras.scripts = scripts;
  if (facts.length) extras.facts = facts;
  const codes = codesFromFacts(facts);
  if (codes.length) extras.codes = codes;
  return extras;
}

/**
 * Read the owner notebook from localStorage `openhood.service-log`.
 * POST /api/report must receive these rows — the server never opens localStorage.
 */
export function readServiceLog(): ServiceLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return parseStoredLog(window.localStorage.getItem(SERVICE_LOG_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function collectSessionInput(): ClientReportInput {
  const vehicle = readIdentifiedVehicle();
  const quote = readLastQuote();
  const bag = readFindingsBag();
  const stored = storedIfSameCar(vehicle);
  const serviceLog = readServiceLog();
  return {
    mode: readReadingLevel(),
    packet: stored,
    vehicle: vehicle ?? undefined,
    fluids: vehicle?.fluids,
    quote: quote ?? undefined,
    findings: bag.findings,
    symptoms: bag.symptoms,
    codes: bag.codes,
    playbookTicks: bag.playbookTicks,
    serviceLog: serviceLog.length ? serviceLog : undefined,
  };
}

/** Assemble a packet from session keys plus optional extras. Does not invent rows. */
export function assembleClientPacket(input: ClientReportInput = {}): ReportPacket {
  const session = typeof window === "undefined" ? {} : collectSessionInput();
  const scripts = [...(input.scripts ?? [])];
  const facts = [...(input.facts ?? [])];
  const fromScripts = scriptsAsSymptoms(scripts);
  const fromFacts = codesFromFacts(facts);

  return buildReportPacket({
    generatedAt: input.generatedAt ?? session.generatedAt,
    mode: input.mode ?? session.mode,
    packet: input.packet ?? session.packet,
    vehicle: input.vehicle ?? session.vehicle,
    specs: input.specs ?? session.specs,
    fluids: input.fluids ?? session.fluids,
    quote: input.quote ?? session.quote,
    symptoms: [...(session.symptoms ?? []), ...(input.symptoms ?? []), ...fromScripts],
    findings: [...(session.findings ?? []), ...(input.findings ?? [])],
    codes: [...(session.codes ?? []), ...(input.codes ?? []), ...fromFacts],
    playbookTicks: input.playbookTicks ?? session.playbookTicks,
    serviceLog: [...(session.serviceLog ?? []), ...(input.serviceLog ?? [])],
    nextDesks: input.nextDesks ?? session.nextDesks,
  });
}

export function hasBayWork(packet: ReportPacket): boolean {
  return Boolean(
    packet.quote ||
      (packet.symptoms && packet.symptoms.length) ||
      (packet.codes && packet.codes.length) ||
      (packet.playbookTicks && packet.playbookTicks.length) ||
      (packet.serviceLog && packet.serviceLog.length),
  );
}

export function packetIsEmpty(packet: ReportPacket): boolean {
  return !hasVehicleIdentity(packet.vehicle) && !hasBayWork(packet) && !packet.fluids;
}
