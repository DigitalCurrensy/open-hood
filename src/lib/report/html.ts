import { BRAND } from "@/lib/brand";
import {
  hasVehicleIdentity,
  vehicleHeadline,
  type ReportCode,
  type ReportFluids,
  type ReportPacket,
  type ReportQuote,
  type ReportServiceLogRow,
  type ReportSymptom,
  type ReportVehicle,
} from "@/lib/report/packet";
import { entryToFinding } from "@/lib/service-log/export";

const BAY = {
  oil: "#0c1210",
  card: "#151e1a",
  fluorescent: "#d7efe0",
  aluminum: "#8d968f",
  ticket: "#f3d36b",
  ink: "#23180a",
  grease: "#b42318",
  cone: "#e85d04",
} as const;

/** Standalone letter-size findings document. Empty packet sections are omitted. */
export function renderReportHtml(packet: ReportPacket): string {
  const title = printTitle(packet);
  const modeHeading = packet.mode === "expert" ? "Measurements / codes" : "What to say";
  const body = [
    toolbar(),
    `<article class="sheet">`,
    header(packet, modeHeading),
    vehicleSection(packet.vehicle),
    serviceLogSection(packet.serviceLog, packet.mode),
    packet.mode === "expert" ? expertBody(packet) : beginnerBody(packet),
    desksSection(packet),
    footer(),
    `</article>`,
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Big+Shoulders+Stencil:wght@700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>${printCss()}</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function printTitle(packet: ReportPacket): string {
  const car = vehicleHeadline(packet.vehicle);
  return car ? `Open Hood findings — ${car}` : "Open Hood findings";
}

function toolbar(): string {
  return `<div class="toolbar no-print">
  <p>Night-bay copy. Print this page or Save as PDF.</p>
  <button type="button" onclick="window.print()">Print / Save as PDF</button>
</div>`;
}

function header(packet: ReportPacket, modeHeading: string): string {
  const when = formatWhen(packet.generatedAt);
  return `<header class="mast">
  <p class="kicker">${escapeHtml(BRAND.kicker)}</p>
  <h1>Findings</h1>
  <p class="lede">${escapeHtml(BRAND.oneLiner)}</p>
  <div class="meta">
    <span class="stamp">${escapeHtml(packet.mode === "expert" ? "Expert" : "Beginner")}</span>
    <span class="mode">${escapeHtml(modeHeading)}</span>
    ${when ? `<time datetime="${escapeHtml(packet.generatedAt)}">${escapeHtml(when)}</time>` : ""}
  </div>
</header>`;
}

function vehicleSection(vehicle: ReportVehicle): string {
  if (!hasVehicleIdentity(vehicle)) return "";
  const name = vehicleHeadline(vehicle);
  const facts = [
    fact("VIN", vehicle.vin, "vin"),
    fact("Engine", vehicle.engine),
    fact("Plate", [vehicle.plate, vehicle.state].filter(Boolean).join(" · ") || undefined),
    fact("Miles", vehicle.mileage),
  ].filter(Boolean);

  return `<section class="card">
  <h2>${name ? escapeHtml(name) : "Vehicle"}</h2>
  ${vehicle.concern ? `<p class="concern">${escapeHtml(vehicle.concern)}</p>` : ""}
  ${facts.length ? `<dl class="facts">${facts.join("")}</dl>` : ""}
</section>`;
}

function serviceLogSection(rows: ReportServiceLogRow[] | undefined, mode: ReportPacket["mode"]): string {
  if (!rows?.length) return "";
  const items = rows
    .map((row) => {
      const finding = entryToFinding(row);
      const extra = mode === "expert" && finding.askTheShop ? `<p>${escapeHtml(finding.askTheShop)}</p>` : "";
      return `<li>
      <p class="item">${escapeHtml(finding.title)}</p>
      ${extra}
    </li>`;
    })
    .join("");
  return `<section class="card"><h2>Service log</h2><ul class="plain">${items}</ul></section>`;
}

function beginnerBody(packet: ReportPacket): string {
  const lines = sayLines(packet);
  const spoken = packet.fluids ? fluidsSpoken(packet.fluids) : undefined;
  const inner = [
    lines.length ? `<ol>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ol>` : "",
    packet.quote ? fairStamp(packet.quote) : "",
    packet.quote?.summary ? `<p>${escapeHtml(packet.quote.summary)}</p>` : "",
    spoken && !lines.includes(spoken) ? `<p>${escapeHtml(spoken)}</p>` : "",
    beginnerCodes(packet.codes),
    packet.playbookTicks?.length
      ? `<p class="sub">Ticked playbook steps</p><ul class="ticks">${packet.playbookTicks.map((tick) => `<li>${escapeHtml(tick)}</li>`).join("")}</ul>`
      : "",
  ].join("");

  if (!inner.replace(/<[^>]+>/g, "").trim()) return "";
  return `<section class="card say"><h2>What to say</h2>${inner}</section>`;
}

function expertBody(packet: ReportPacket): string {
  const fluidFacts = fluidFactRows(packet.fluids);
  const flags = flagList(packet.quote);
  const codeRows = expertCodes(packet.codes);
  const findings = expertFindings(packet.symptoms);
  const measure = [
    fluidFacts ? `<p class="sub">Door-sticker fluids, PSI, and filter SKUs — confirm the jamb.</p><dl class="facts">${fluidFacts}</dl>` : "",
    codeRows,
    packet.quote ? fairStamp(packet.quote) : "",
    packet.quote?.summary ? `<p>${escapeHtml(packet.quote.summary)}</p>` : "",
    flags,
    findings,
    packet.playbookTicks?.length
      ? `<p class="sub">Ticked playbook steps</p><ul class="ticks">${packet.playbookTicks.map((tick) => `<li>${escapeHtml(tick)}</li>`).join("")}</ul>`
      : "",
  ].join("");

  const scripts = packet.quote?.mechanicScript ?? [];
  const asks = (packet.symptoms ?? []).map((row) => row.askTheShop).filter(Boolean);
  const say = [...scripts, ...asks];

  const blocks: string[] = [];
  if (measure.replace(/<[^>]+>/g, "").trim()) {
    blocks.push(`<section class="card"><h2>Measurements / codes</h2>${measure}</section>`);
  }
  if (say.length) {
    blocks.push(
      `<section class="card say"><h2>What to say</h2><ol>${say.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ol></section>`,
    );
  }
  return blocks.join("");
}

function sayLines(packet: ReportPacket): string[] {
  const lines: string[] = [];
  if (packet.quote?.mechanicScript.length) lines.push(...packet.quote.mechanicScript);
  if (packet.symptoms) {
    for (const row of packet.symptoms) {
      if (row.askTheShop) lines.push(row.askTheShop);
    }
  }
  if (!lines.length && packet.fluids) {
    const spoken = fluidsSpoken(packet.fluids);
    if (spoken) lines.push(spoken);
  }
  return unique(lines);
}

function beginnerCodes(codes: ReportCode[] | undefined): string {
  if (!codes?.length) return "";
  const rows = codes
    .map((row) => {
      const english = row.plainEnglish || row.title;
      return english ? `<li><span class="code">${escapeHtml(row.code)}</span> ${escapeHtml(english)}</li>` : "";
    })
    .filter(Boolean);
  return rows.length ? `<ul class="plain">${rows.join("")}</ul>` : "";
}

function expertCodes(codes: ReportCode[] | undefined): string {
  if (!codes?.length) return "";
  const rows = codes.map(
    (row) => `<li>
      <p class="item"><span class="code">${escapeHtml(row.code)}</span> ${escapeHtml(row.title)}</p>
      ${row.plainEnglish ? `<p>${escapeHtml(row.plainEnglish)}</p>` : ""}
    </li>`,
  );
  return `<ul class="plain">${rows.join("")}</ul>`;
}

function expertFindings(symptoms: ReportSymptom[] | undefined): string {
  if (!symptoms?.length) return "";
  const rows = symptoms.map(
    (row) => `<li>
      <p class="item">${escapeHtml(row.title)}</p>
      ${row.askTheShop ? `<p>${escapeHtml(row.askTheShop)}</p>` : ""}
    </li>`,
  );
  return `<ul class="plain">${rows.join("")}</ul>`;
}

function fluidFactRows(fluids: ReportFluids | undefined): string {
  if (!fluids) return "";
  return [
    fact("Viscosity", fluids.viscosity),
    fact("Capacity", fluids.capacity),
    fact("Tire PSI", tirePsi(fluids)),
    fact("Oil filter", fluids.oilFilterSku),
    fact("Air filter", fluids.airFilterSku),
    fact("Cabin filter", fluids.cabinFilterSku),
  ]
    .filter(Boolean)
    .join("");
}

function flagList(quote: ReportQuote | undefined): string {
  if (!quote?.flaggedItems.length) return "";
  const items = quote.flaggedItems
    .map((item) => {
      const bits = [
        item.quotedPrice != null && Number.isFinite(item.quotedPrice)
          ? `<span class="price">${escapeHtml(formatMoney(item.quotedPrice))}</span>`
          : "",
        item.fairPriceRange ? `<span class="range">${escapeHtml(item.fairPriceRange)}</span>` : "",
      ].filter(Boolean);
      return `<li class="flag ${escapeHtml(item.category)}">
        <div>
          <p class="item">${escapeHtml(item.item)}</p>
          ${item.warning ? `<p class="warn">${escapeHtml(item.warning)}</p>` : ""}
        </div>
        ${bits.length ? `<div class="nums">${bits.join("")}</div>` : ""}
      </li>`;
    })
    .join("");
  return `<ul class="flags">${items}</ul>`;
}

function desksSection(packet: ReportPacket): string {
  if (!packet.nextDesks.length) return "";
  return `<section class="card desks">
  <h2>Next desks</h2>
  <ul>${packet.nextDesks
    .map(
      (desk) =>
        `<li><span class="stamp">${escapeHtml(desk.stamp)}</span> <a href="${escapeHtml(desk.href)}">${escapeHtml(desk.label)}</a> <code>${escapeHtml(desk.href)}</code></li>`,
    )
    .join("")}</ul>
</section>`;
}

function footer(): string {
  return `<footer class="colophon">
  <p>${escapeHtml(BRAND.short)} · We do not book shops. We do not take a cut.</p>
  <p>Confirm oil spec, tire PSI, and any interval on the door-jamb sticker for this VIN.</p>
</footer>`;
}

function fairStamp(quote: ReportQuote): string {
  return quote.isQuoteFair
    ? `<p class="fair">Mostly fair — still ask for the test.</p>`
    : `<p class="unfair">Do not authorize yet.</p>`;
}

function fluidsSpoken(fluids: ReportFluids): string | undefined {
  const parts: string[] = [];
  if (fluids.viscosity && fluids.capacity) {
    parts.push(`This VIN calls for ${fluids.viscosity}, ${fluids.capacity}.`);
  } else if (fluids.viscosity) {
    parts.push(`This VIN calls for ${fluids.viscosity}.`);
  } else if (fluids.capacity) {
    parts.push(`Capacity on our card is ${fluids.capacity}.`);
  }
  const psi = tirePsi(fluids);
  if (psi) parts.push(`Door-sticker tire pressure is ${psi}. The sidewall number is a maximum, not the spec.`);
  const sku = fluids.oilFilterSku || fluids.cabinFilterSku;
  if (sku) parts.push(`Filter SKU on the card: ${sku}.`);
  return parts.length ? parts.join(" ") : undefined;
}

function tirePsi(fluids: ReportFluids): string | undefined {
  if (fluids.tirePsiFront && fluids.tirePsiRear) {
    if (fluids.tirePsiFront === fluids.tirePsiRear) return fluids.tirePsiFront;
    return `${fluids.tirePsiFront} front / ${fluids.tirePsiRear} rear`;
  }
  return fluids.tirePsiFront || fluids.tirePsiRear;
}

function fact(label: string, value: string | undefined, kind = ""): string {
  if (!value) return "";
  return `<div${kind ? ` class="${kind}"` : ""}><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    rows.push(value);
  }
  return rows;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printCss(): string {
  return `
@page { size: letter; margin: 0.55in 0.6in; }
* { box-sizing: border-box; }
html, body {
  margin: 0;
  background: ${BAY.oil};
  color: ${BAY.fluorescent};
  font-family: Barlow, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
body {
  min-height: 100%;
  background-image:
    linear-gradient(90deg, ${BAY.cone} 0 8px, transparent 8px),
    radial-gradient(900px 420px at 72% -8%, rgba(215,239,224,0.08), transparent 55%);
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.25rem 0.85rem 1.7rem;
  background: ${BAY.card};
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: ${BAY.aluminum};
  font-size: 0.92rem;
}
.toolbar button {
  appearance: none;
  border: 0;
  background: ${BAY.ticket};
  color: ${BAY.ink};
  font: 700 0.72rem/1 "IBM Plex Mono", ui-monospace, monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.7rem 0.95rem;
  cursor: pointer;
}
.sheet { padding: 1.4rem 1.5rem 2rem 1.85rem; max-width: 8.5in; }
.mast h1 {
  margin: 0.15rem 0 0.35rem;
  font-family: "Big Shoulders Stencil", Impact, "Arial Narrow", sans-serif;
  font-size: 3.1rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${BAY.fluorescent};
}
.kicker, .sub, time, code, .stamp, .code, .meta {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}
.kicker {
  margin: 0;
  color: ${BAY.cone};
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}
.lede { margin: 0 0 0.85rem; color: ${BAY.aluminum}; max-width: 36rem; }
.meta { display: flex; flex-wrap: wrap; gap: 0.55rem 0.9rem; align-items: center; color: ${BAY.aluminum}; font-size: 0.72rem; }
.stamp {
  display: inline-block;
  background: ${BAY.ticket};
  color: ${BAY.ink};
  padding: 0.18rem 0.4rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.62rem;
  font-weight: 600;
}
.mode { color: ${BAY.ticket}; letter-spacing: 0.12em; text-transform: uppercase; }
.card {
  background: ${BAY.card};
  border: 1px solid rgba(255,255,255,0.08);
  padding: 1rem 1.1rem 1.05rem;
  margin: 0.85rem 0 0;
  break-inside: avoid;
}
.card h2 {
  margin: 0 0 0.45rem;
  font-family: "Big Shoulders Stencil", Impact, "Arial Narrow", sans-serif;
  font-size: 1.45rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.card h3 {
  margin: 0.85rem 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${BAY.ticket};
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}
.card p, .card li { color: ${BAY.fluorescent}; line-height: 1.45; }
.sub { color: ${BAY.aluminum}; font-size: 0.72rem; letter-spacing: 0.06em; }
.concern { font-size: 1.05rem; }
.facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.65rem 1rem; margin: 0.7rem 0 0; }
.facts div.vin { grid-column: 1 / -1; }
.facts dt { margin: 0; color: ${BAY.aluminum}; font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; font-family: "IBM Plex Mono", ui-monospace, monospace; }
.facts dd { margin: 0.15rem 0 0; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.95rem; }
ol, ul { margin: 0.4rem 0 0; padding-left: 1.15rem; }
.plain, .ticks, .flags, .desks ul { list-style: none; padding-left: 0; }
.plain li, .ticks li { margin: 0.45rem 0 0; padding-left: 0.7rem; border-left: 2px solid ${BAY.ticket}; }
.item { margin: 0; font-weight: 600; }
.code { color: ${BAY.ticket}; letter-spacing: 0.08em; }
.flags li { display: flex; justify-content: space-between; gap: 1rem; margin: 0.65rem 0 0; padding: 0.55rem 0.6rem; background: rgba(0,0,0,0.22); }
.flags .nums { text-align: right; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.78rem; color: ${BAY.aluminum}; }
.price { display: block; color: ${BAY.fluorescent}; }
.warn { margin: 0.25rem 0 0; color: ${BAY.aluminum}; font-size: 0.92rem; }
.flag.markup, .flag.upsell { box-shadow: inset 3px 0 0 ${BAY.grease}; }
.fair { color: #8fd4b0; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; }
.unfair { color: #ffb4ae; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; }
.desks li { display: flex; flex-wrap: wrap; gap: 0.45rem 0.7rem; align-items: center; margin: 0.45rem 0 0; }
.desks a { color: ${BAY.ticket}; }
.desks code { color: ${BAY.aluminum}; font-size: 0.78rem; }
.colophon { margin-top: 1.2rem; color: ${BAY.aluminum}; font-size: 0.82rem; }
.colophon p { margin: 0.2rem 0; }
@media print {
  .no-print { display: none !important; }
  html, body { background: ${BAY.oil}; }
  body { background-image: linear-gradient(90deg, ${BAY.cone} 0 8px, transparent 8px); }
  .sheet { padding: 0; }
  a { color: ${BAY.ticket}; text-decoration: none; }
}
@media (max-width: 640px) {
  .facts { grid-template-columns: 1fr; }
  .flags li { flex-direction: column; }
}
`.replace(/\n/g, "");
}
