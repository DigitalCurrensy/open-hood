import { detectFlush, extractZip, flushProxyLine } from "@/lib/agent/detect";
import { lookupRoTerm, searchParts, searchPlaybooks } from "@/lib/agent/tools";
import type {
  AgentDeskHref,
  AgentFnCall,
  AgentFnName,
  AgentInvocation,
  AgentVehicleContext,
} from "@/lib/agent/types";
import { searchDirectory } from "@/lib/directory/search";
import { fetchEpaMpg } from "@/lib/directory/epa";
import { lookupDtc } from "@/lib/dtc";
import { buildFluidSpecSheet } from "@/lib/fluids";
import { filterGuides } from "@/lib/guides/glossary";
import { decodeVin, fetchRecalls } from "@/lib/nhtsa";
import { analyzeQuoteText } from "@/lib/quote";
import { diagnoseSymptoms } from "@/lib/symptoms";
import type { SymptomNoise, SymptomWhen } from "@/lib/types";
import { specsFromContext } from "@/lib/agent/vehicle";
import { isValidVin, normalizeVin } from "@/lib/vin";

export interface AgentToolResult {
  invocation: AgentInvocation;
  fact: string;
  desks: AgentDeskHref[];
  data: Record<string, unknown>;
  vehiclePatch?: AgentVehicleContext;
}

export interface ToolRunContext {
  vehicle?: AgentVehicleContext;
  userText: string;
}

const NOISE: SymptomNoise[] = ["squeal", "grinding", "thumping", "clicking", "rumble", "hiss", "none"];
const WHEN: SymptomWhen[] = ["braking", "turning", "accelerating", "idling", "highway", "cold-start", "always"];

function str(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  return typeof value === "string" ? value.trim() : "";
}

function bool(args: Record<string, unknown>, key: string): boolean {
  return args[key] === true || args[key] === "true";
}

function fail(name: AgentFnName, summary: string, desks: AgentDeskHref[] = []): AgentToolResult {
  return {
    invocation: { name, ok: false, summary },
    fact: summary,
    desks,
    data: { error: summary },
  };
}

async function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function invokeAgentTool(
  name: AgentFnName,
  args: Record<string, unknown>,
  ctx: ToolRunContext,
): Promise<AgentToolResult> {
  try {
    switch (name) {
      case "decode_vin":
        return await runDecodeVin(args, ctx);
      case "lookup_dtc":
        return runLookupDtc(args, ctx);
      case "analyze_quote_text":
        return runAnalyzeQuote(args, ctx);
      case "diagnose_symptoms":
        return runDiagnoseSymptoms(args, ctx);
      case "get_fluids_for_vehicle":
        return runFluids(ctx);
      case "search_guides":
        return runSearchGuides(args, ctx);
      case "search_directory":
        return await runSearchDirectory(args);
      case "get_recalls":
        return await runRecalls(ctx);
      case "get_epa_mpg":
        return await runEpaMpg(ctx);
      case "search_playbooks":
        return runSearchPlaybooks(args, ctx);
      case "lookup_ro_term":
        return runLookupRoTerm(args, ctx);
      case "search_parts":
        return runSearchParts(args, ctx);
      default:
        return fail(name, `Unknown tool: ${name}`);
    }
  } catch (error) {
    return fail(name, error instanceof Error ? error.message : "Tool failed.");
  }
}

export async function invokeToolPlan(calls: AgentFnCall[], ctx: ToolRunContext): Promise<AgentToolResult[]> {
  const results: AgentToolResult[] = [];
  let vehicle = { ...ctx.vehicle };
  const seen = new Set<string>();

  for (const call of calls) {
    const key = `${call.name}:${JSON.stringify(call.args)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const result = await invokeAgentTool(call.name, call.args, { ...ctx, vehicle });
    results.push(result);
    if (result.vehiclePatch) {
      vehicle = { ...vehicle, ...result.vehiclePatch };
    }
  }

  return results;
}

async function runDecodeVin(args: Record<string, unknown>, ctx: ToolRunContext): Promise<AgentToolResult> {
  const vin = normalizeVin(str(args, "vin") || ctx.vehicle?.vin || "");
  if (!isValidVin(vin)) {
    return fail("decode_vin", "Need a 17-character VIN. Letters I, O, and Q are never used.", ["/garage"]);
  }
  const specs = await withTimeout(decodeVin(vin), 12_000, "decode_vin");
  const label = [specs.year, specs.make, specs.model].filter(Boolean).join(" ");
  const fact = label
    ? `NHTSA vPIC decoded ${vin} as ${label}${specs.engineDisplacement ? ` · ${specs.engineDisplacement}` : ""}${specs.fuelType ? ` · ${specs.fuelType}` : ""}. Confirm that string on the RO and the door jamb.`
    : `NHTSA returned a decode for ${vin} without a clean year/make/model. Treat the door jamb as the source of truth.`;
  return {
    invocation: { name: "decode_vin", ok: true, summary: label ? `${vin} → ${label}` : `Decoded ${vin}` },
    fact,
    desks: ["/garage", "/recalls", "/expert"],
    data: {
      vin,
      year: specs.year,
      make: specs.make,
      model: specs.model,
      trim: specs.trim,
      engineDisplacement: specs.engineDisplacement,
      fuelType: specs.fuelType,
      driveType: specs.driveType,
    },
    vehiclePatch: {
      vin,
      year: specs.year || undefined,
      make: specs.make || undefined,
      model: specs.model || undefined,
    },
  };
}

function runLookupDtc(args: Record<string, unknown>, ctx: ToolRunContext): AgentToolResult {
  const code = (str(args, "code") || "").toUpperCase();
  if (!code) return fail("lookup_dtc", "Type a five-character scanner code such as P0420.", ["/obd"]);
  const hit = lookupDtc(code);
  if (!hit.valid) {
    return fail("lookup_dtc", hit.error || `${code} is not a standard five-character OBD layout.`, ["/obd"]);
  }
  if (hit.entry) {
    const fact = [
      `${hit.entry.code} — ${hit.entry.title}.`,
      hit.entry.plainEnglish,
      `Typical first looks: ${hit.entry.typicalCause}. Shop band if the test actually fails: ${hit.entry.costBand}.`,
      hit.entry.askTheShop,
    ].join(" ");
    return {
      invocation: { name: "lookup_dtc", ok: true, summary: `${hit.entry.code} · ${hit.entry.title}` },
      fact,
      desks: ["/obd", "/symptoms", "/quote", "/expert"],
      data: {
        code: hit.entry.code,
        title: hit.entry.title,
        costBand: hit.entry.costBand,
        severity: hit.entry.severity,
        askTheShop: hit.entry.askTheShop,
        typicalCause: hit.entry.typicalCause,
      },
    };
  }
  const generic = hit.generic;
  const fact = `${code} is a real ${generic?.system ?? "module"} code (${generic?.subsystem ?? "unspecified"}). ${generic?.hint ?? ""} Ask the shop to print the factory title and the freeze-frame (RPM, load, coolant temp when it set) before you approve parts.`;
  return {
    invocation: { name: "lookup_dtc", ok: true, summary: `${code} · generic layout` },
    fact,
    desks: ["/obd", "/symptoms", "/expert"],
    data: { code, generic },
    vehiclePatch: ctx.vehicle,
  };
}

function runAnalyzeQuote(args: Record<string, unknown>, ctx: ToolRunContext): AgentToolResult {
  const text = str(args, "text") || ctx.userText;
  const flush = detectFlush(text);
  const proxy = flush && !/\$\s*\d/.test(text) ? `${text}\n${flushProxyLine(flush)}` : text;
  if (!proxy.trim()) {
    return fail("analyze_quote_text", "Paste the line items (part + price) or say what they quoted.", ["/quote"]);
  }
  const specs = specsFromContext(ctx.vehicle);
  const zip = str(args, "zip") || extractZip(proxy) || extractZip(ctx.userText);
  const analysis = analyzeQuoteText(proxy, specs, zip);
  const mapped = analysis.flaggedItems.filter((item) => item.item !== "Unparsed estimate");
  const problems = mapped.filter((item) => item.category !== "ok");
  const lines = (problems.length ? problems : mapped).slice(0, 4).map((item) => {
    const price = item.quotedPrice != null ? ` at $${item.quotedPrice.toFixed(2)}` : "";
    return `${item.item}${price} — ${item.warning} Typical band: ${item.fairPriceRange}.`;
  });
  const fact = [analysis.summary, ...lines].filter(Boolean).join(" ");
  return {
    invocation: {
      name: "analyze_quote_text",
      ok: true,
      summary: problems.length ? `${problems.length} flagged line${problems.length === 1 ? "" : "s"}` : "Quote mapped",
    },
    fact: fact || "I could not map those words to a known job. Paste each line as part + price.",
    desks: ["/quote", "/guides", "/directory"],
    data: {
      summary: analysis.summary,
      totalQuoted: analysis.totalQuoted,
      flagged: mapped.slice(0, 6),
      scripts: analysis.mechanicScript.slice(0, 4),
    },
  };
}

function runDiagnoseSymptoms(args: Record<string, unknown>, ctx: ToolRunContext): AgentToolResult {
  const noiseRaw = str(args, "noise");
  const whenRaw = str(args, "when");
  const noise = NOISE.includes(noiseRaw as SymptomNoise) ? (noiseRaw as SymptomNoise) : null;
  const when = WHEN.includes(whenRaw as SymptomWhen) ? (whenRaw as SymptomWhen) : "always";
  if (!noise) {
    return fail("diagnose_symptoms", "Name the sound and when it happens (example: squeal when braking).", ["/symptoms"]);
  }
  const specs = specsFromContext(ctx.vehicle);
  const findings = diagnoseSymptoms(
    noise,
    when,
    {
      warningLight: bool(args, "warningLight"),
      leak: bool(args, "leak"),
      pull: bool(args, "pull"),
    },
    specs,
  );
  const body = findings
    .slice(0, 4)
    .map((finding) => {
      const odds = finding.likelihood === "likely" ? "Likely" : finding.likelihood === "possible" ? "Possible" : "Needs a test";
      return `${odds}: ${finding.title}. ${finding.plainEnglish} ${finding.askTheShop}`;
    })
    .join(" ");
  return {
    invocation: {
      name: "diagnose_symptoms",
      ok: true,
      summary: `${noise} · ${when}${findings[0] ? ` · ${findings[0].title}` : ""}`,
    },
    fact: body || `Mapped ${noise} / ${when}. I need more detail (when, leak, light) before I name a test.`,
    desks: ["/symptoms", "/obd", "/quote"],
    data: {
      noise,
      when,
      findings: findings.slice(0, 4).map((finding) => ({
        title: finding.title,
        likelihood: finding.likelihood,
        askTheShop: finding.askTheShop,
      })),
    },
  };
}

function runFluids(ctx: ToolRunContext): AgentToolResult {
  const specs = specsFromContext(ctx.vehicle);
  if (!specs.year || !specs.make) {
    return fail("get_fluids_for_vehicle", "Stamp a VIN or year / make / model before I read oil and PSI.", ["/garage"]);
  }
  const sheet = buildFluidSpecSheet(specs);
  const fact = [
    `Fluids card for ${[specs.year, specs.make, specs.model].filter(Boolean).join(" ")} (${sheet.source}).`,
    `Oil ${sheet.oilViscosity} · ${sheet.oilSpec} · ${sheet.oilCapacityQt}.`,
    `Coolant ${sheet.coolant}. Transmission ${sheet.transmissionFluid}. Brake ${sheet.brakeFluid}.`,
    `Tire PSI door-jamb starting point: ${sheet.tirePsiFront} front / ${sheet.tirePsiRear} rear.`,
    `Filters: oil ${sheet.oilFilterSku}; air ${sheet.airFilterSku}; cabin ${sheet.cabinFilterSku}.`,
    sheet.caveats[0] ?? "Confirm viscosity and PSI on the under-hood label and the door jamb.",
  ].join(" ");
  return {
    invocation: { name: "get_fluids_for_vehicle", ok: true, summary: `${sheet.oilViscosity} · ${sheet.source}` },
    fact,
    desks: ["/garage", "/catalog", "/guides"],
    data: { ...sheet },
  };
}

function runSearchGuides(args: Record<string, unknown>, ctx: ToolRunContext): AgentToolResult {
  const q = str(args, "q") || ctx.userText.slice(0, 80);
  const guides = filterGuides({ q }).slice(0, 5);
  if (!guides.length) {
    return {
      invocation: { name: "search_guides", ok: true, summary: "No guide matched those words" },
      fact: `No owner guide matched “${q}”. Open /guides and search the job name (flush, pads, cabin filter).`,
      desks: ["/guides"],
      data: { q, guides: [] },
    };
  }
  const fact = guides
    .map((guide) => `${guide.title} — ${guide.plainEnglish} Say: ${guide.askAtTheShop}`)
    .join(" ");
  return {
    invocation: { name: "search_guides", ok: true, summary: `${guides.length} guide${guides.length === 1 ? "" : "s"}` },
    fact,
    desks: ["/guides", "/quote", "/expert"],
    data: {
      q,
      guides: guides.map((guide) => ({
        id: guide.id,
        title: guide.title,
        href: `/guides/${guide.id}`,
        askAtTheShop: guide.askAtTheShop,
        diySafe: guide.diySafe,
      })),
    },
  };
}

async function runSearchDirectory(args: Record<string, unknown>): Promise<AgentToolResult> {
  const zip = str(args, "zip") || str(args, "query");
  const type = str(args, "type") || "repair";
  if (!zip) {
    return fail("search_directory", "Need a ZIP or city to search rooftops. We do not book a bay.", ["/directory"]);
  }
  const result = await withTimeout(searchDirectory({ query: zip, type }), 12_000, "search_directory");
  const places = result.places.slice(0, 5);
  const fact = places.length
    ? `Directory around ${result.geocode?.label ?? zip} (${result.source}): ${places
        .map((place) => `${place.name} · ${place.type}${place.miles != null ? ` · ${place.miles} mi` : ""}`)
        .join("; ")}. We do not certify shops or take a cut.`
    : result.message || `No rooftops returned for ${zip}. Try another ZIP on /directory.`;
  return {
    invocation: {
      name: "search_directory",
      ok: true,
      summary: places.length ? `${places.length} rooftops near ${zip}` : `No rooftops for ${zip}`,
    },
    fact,
    desks: ["/directory"],
    data: {
      query: zip,
      type,
      source: result.source,
      places: places.map((place) => ({
        name: place.name,
        type: place.type,
        address: place.address,
        miles: place.miles,
      })),
    },
  };
}

async function runRecalls(ctx: ToolRunContext): Promise<AgentToolResult> {
  const specs = specsFromContext(ctx.vehicle);
  if (!specs.year || !specs.make || !specs.model) {
    return fail("get_recalls", "Need year, make, and model (or a decoded VIN) to pull NHTSA campaigns.", ["/recalls"]);
  }
  const recalls = await withTimeout(fetchRecalls(specs), 12_000, "get_recalls");
  const top = recalls.slice(0, 5);
  const fact = top.length
    ? `NHTSA lists ${recalls.length} campaign${recalls.length === 1 ? "" : "s"} for ${specs.year} ${specs.make} ${specs.model}. Top: ${top
        .map((row) => `${row.campaignNumber || "unnumbered"} · ${row.component}`)
        .join("; ")}. Open/closed is VIN-specific at the dealer — this list is year/make/model, not a live VIN campaign check.`
    : `NHTSA returned no year/make/model campaigns for ${specs.year} ${specs.make} ${specs.model}. Still ask the dealer to run the VIN.`;
  return {
    invocation: {
      name: "get_recalls",
      ok: true,
      summary: `${recalls.length} campaign${recalls.length === 1 ? "" : "s"}`,
    },
    fact,
    desks: ["/recalls", "/expert", "/directory"],
    data: {
      count: recalls.length,
      campaigns: top.map((row) => ({
        campaignNumber: row.campaignNumber,
        component: row.component,
        summary: row.summary.slice(0, 220),
      })),
    },
  };
}

async function runEpaMpg(ctx: ToolRunContext): Promise<AgentToolResult> {
  const specs = specsFromContext(ctx.vehicle);
  if (!specs.year || !specs.make || !specs.model) {
    return fail("get_epa_mpg", "Need year, make, and model for official EPA MPG.", ["/garage"]);
  }
  const rows = await withTimeout(fetchEpaMpg(specs.year, specs.make, specs.model), 12_000, "get_epa_mpg");
  const top = rows.slice(0, 4);
  const fact = top.length
    ? `EPA FuelEconomy.gov for ${specs.year} ${specs.make} ${specs.model}: ${top
        .map((row) => {
          const mpg = [row.cityMpg, row.highwayMpg, row.combinedMpg]
            .map((n) => (n == null ? "—" : String(n)))
            .join("/");
          return `${row.label} · city/hwy/comb ${mpg}`;
        })
        .join("; ")}. This is the official number, not a Facebook ad.`
    : `EPA returned no rows for ${specs.year} ${specs.make} ${specs.model}. Use fueleconomy.gov Find-a-Car.`;
  return {
    invocation: { name: "get_epa_mpg", ok: true, summary: top.length ? `${top.length} EPA row${top.length === 1 ? "" : "s"}` : "No EPA rows" },
    fact,
    desks: ["/garage", "/expert"],
    data: { rows: top },
  };
}

function runSearchPlaybooks(args: Record<string, unknown>, ctx: ToolRunContext): AgentToolResult {
  const q = str(args, "q") || ctx.userText.slice(0, 80);
  const result = searchPlaybooks(q);
  const fact = result.hits.length
    ? result.hits.map((hit) => `${hit.title} — ${hit.plainEnglish} Open ${hit.href}.`).join(" ")
    : result.note;
  return {
    invocation: {
      name: "search_playbooks",
      ok: true,
      summary: result.hits.length ? `${result.hits.length} playbook${result.hits.length === 1 ? "" : "s"}` : "No playbook match",
    },
    fact: `${fact} ${result.note}`,
    desks: ["/expert", "/guides"],
    data: { ...result, scripts: result.hits.flatMap((hit) => hit.script) },
  };
}

function runLookupRoTerm(args: Record<string, unknown>, ctx: ToolRunContext): AgentToolResult {
  const q = str(args, "q") || str(args, "term") || ctx.userText.slice(0, 80);
  const result = lookupRoTerm(q);
  const fact = result.hits.length
    ? result.hits
        .map((hit) => `${hit.term}: ${hit.means} Trap: ${hit.trap} Say: ${hit.sayToOwner}`)
        .join(" ")
    : result.note;
  return {
    invocation: {
      name: "lookup_ro_term",
      ok: true,
      summary: result.hits.length ? result.hits.map((hit) => hit.term).join(", ") : "No RO term",
    },
    fact: `${fact} ${result.note}`,
    desks: ["/quote", "/expert"],
    data: { ...result, scripts: result.hits.map((hit) => hit.sayToOwner) },
  };
}

function runSearchParts(args: Record<string, unknown>, ctx: ToolRunContext): AgentToolResult {
  const part = str(args, "part") || str(args, "q") || ctx.userText.slice(0, 80);
  const result = searchParts(part, ctx.vehicle);
  const fact = `Parts search for ${result.query}: RockAuto ${result.rockauto} · AutoZone ${result.autozone} · Amazon ${result.amazon} · eBay Motors ${result.ebayMotors}. ${result.note}`;
  return {
    invocation: { name: "search_parts", ok: true, summary: result.query || "Parts search URLs" },
    fact,
    desks: ["/guides", "/quote"],
    data: { query: result.query, year: result.year, make: result.make, model: result.model, note: result.note },
  };
}

export function compactToolPayload(results: AgentToolResult[]): string {
  return JSON.stringify(
    results.map((row) => ({
      tool: row.invocation.name,
      ok: row.invocation.ok,
      summary: row.invocation.summary,
      fact: row.fact,
      data: row.data,
    })),
  );
}
