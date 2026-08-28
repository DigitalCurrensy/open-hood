import { hasBayWork } from "@/components/report/assemble-client";
import { PACKET_METHOD_LINES, SOURCE_LEGEND } from "@/components/report/methodology";
import { hasVehicleIdentity, vehicleHeadline, type ReportPacket } from "@/lib/report/packet";
import { entryToFinding } from "@/lib/service-log/export";

function money(value: number | null | undefined): string {
  return value == null ? "—" : `$${value.toFixed(2)}`;
}

export function formatFindingsDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function sayHeading(mode: ReportPacket["mode"]): string {
  return mode === "expert" ? "Measurements / codes" : "What to say";
}

/** Plain-text customer copy. Empty sections are omitted. */
export function packetToText(packet: ReportPacket): string {
  const lines: string[] = ["Open Hood findings", formatFindingsDate(packet.generatedAt)];
  const title = vehicleHeadline(packet.vehicle);
  if (title) lines.push(title);
  if (packet.vehicle.vin) lines.push(`VIN ${packet.vehicle.vin}`);
  if (packet.vehicle.engine) lines.push(packet.vehicle.engine);
  if (packet.vehicle.mileage) lines.push(`Miles ${packet.vehicle.mileage}`);
  if (packet.vehicle.plate) {
    lines.push(`Plate ${packet.vehicle.plate}${packet.vehicle.state ? ` ${packet.vehicle.state}` : ""}`);
  }
  if (packet.vehicle.concern) lines.push(`Concern ${packet.vehicle.concern}`);

  if (packet.fluids) {
    lines.push("", "Fluids");
    const fluids = packet.fluids;
    if (fluids.viscosity) lines.push(`Oil ${fluids.viscosity}${fluids.capacity ? ` · ${fluids.capacity}` : ""}`);
    if (fluids.tirePsiFront || fluids.tirePsiRear) {
      lines.push(`Tire PSI ${fluids.tirePsiFront ?? "—"} front / ${fluids.tirePsiRear ?? "—"} rear`);
    }
    if (fluids.oilFilterSku) lines.push(`Oil filter ${fluids.oilFilterSku}`);
    if (fluids.airFilterSku) lines.push(`Air filter ${fluids.airFilterSku}`);
    if (fluids.cabinFilterSku) lines.push(`Cabin filter ${fluids.cabinFilterSku}`);
  }

  if (packet.quote) {
    lines.push("", packet.quote.isQuoteFair ? "Quote · mostly fair" : "Quote · do not authorize yet");
    if (packet.quote.summary) lines.push(packet.quote.summary);
    for (const item of packet.quote.flaggedItems) {
      lines.push(`- ${item.item} ${money(item.quotedPrice)} · fair ${item.fairPriceRange}`);
      if (item.warning) lines.push(`  ${item.warning}`);
    }
  }

  const say: string[] = [];
  if (packet.quote?.mechanicScript.length) say.push(...packet.quote.mechanicScript);
  if (packet.symptoms) {
    for (const row of packet.symptoms) {
      if (row.askTheShop) say.push(row.askTheShop);
    }
  }
  if (packet.codes) {
    for (const row of packet.codes) {
      say.push(`${row.code} · ${row.title}${row.plainEnglish ? ` — ${row.plainEnglish}` : ""}`);
    }
  }
  if (say.length) {
    lines.push("", sayHeading(packet.mode));
    for (const line of say) lines.push(`- ${line}`);
  }

  if (packet.symptoms?.some((row) => row.title && row.title !== "Advocate brief")) {
    lines.push("", "Symptoms");
    for (const row of packet.symptoms) {
      if (row.title === "Advocate brief") continue;
      lines.push(`- ${row.title}${row.askTheShop ? ` — ${row.askTheShop}` : ""}`);
    }
  }

  if (packet.playbookTicks?.length) {
    lines.push("", "Playbook ticks");
    for (const tick of packet.playbookTicks) lines.push(`- ${tick}`);
  }

  if (packet.serviceLog?.length) {
    lines.push("", "Service log");
    for (const row of packet.serviceLog) {
      const finding = entryToFinding(row);
      lines.push(`- ${finding.title}${finding.askTheShop ? ` — ${finding.askTheShop}` : ""}`);
    }
  }

  if (hasVehicleIdentity(packet.vehicle) && !hasBayWork(packet)) {
    lines.push("", "Run quote defense, the symptom wizard, or the advocate first. This sheet only has the car in the bay.");
  }

  lines.push("", "Method");
  for (const line of PACKET_METHOD_LINES) lines.push(`- ${line}`);
  for (const chip of SOURCE_LEGEND) lines.push(`- ${chip.stamp}: ${chip.meaning}`);

  lines.push("", "Open Hood is a translator, not a shop. Not legal advice, not a licensed inspector. Measurements beat adjectives.");
  return lines.join("\n");
}
