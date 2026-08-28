import { hasBayWork } from "@/components/report/assemble-client";
import { confidenceChips, PACKET_METHOD_LINES, SOURCE_LEGEND, type FluidsLane } from "@/components/report/methodology";
import { formatFindingsDate, sayHeading } from "@/components/report/to-text";
import { hasVehicleIdentity, vehicleHeadline, type ReportPacket } from "@/lib/report/packet";
import { entryToFinding } from "@/lib/service-log/export";
import Link from "next/link";

function money(value: number | null | undefined): string {
  return value == null ? "—" : `$${value.toFixed(2)}`;
}

export function PacketPreview({ packet, fluidsLane }: { packet: ReportPacket; fluidsLane?: FluidsLane }) {
  const title = vehicleHeadline(packet.vehicle);
  const sayLines = collectSayLines(packet);
  const symptomCards = packet.symptoms?.filter((row) => row.title && row.title !== "Advocate brief") ?? [];
  const work = hasBayWork(packet);
  const identified = hasVehicleIdentity(packet.vehicle);
  const chips = confidenceChips(packet, fluidsLane);

  return (
    <article aria-label="Open Hood findings" className="report-sheet rounded-sm p-5 text-ticket-ink sm:p-6">
      <div className="report-perf -mx-5 -mt-5 mb-4 h-3 rounded-t-sm border-b border-black/15 sm:-mx-6" />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] opacity-70">Copy 3 · customer</p>
          <h2 className="font-display text-4xl uppercase leading-none sm:text-5xl">Open Hood findings</h2>
          {title ? <p className="mt-2 text-lg font-semibold leading-6">{title}</p> : null}
        </div>
        <div className="text-left font-mono text-[11px] uppercase leading-5 tracking-[0.12em] sm:text-right">
          <p>{formatFindingsDate(packet.generatedAt)}</p>
          {packet.vehicle.vin ? <p className="report-vin mt-1">VIN {packet.vehicle.vin}</p> : null}
          {packet.vehicle.engine ? <p className="mt-1 normal-case tracking-normal">{packet.vehicle.engine}</p> : null}
        </div>
      </header>

      {(packet.vehicle.mileage || packet.vehicle.plate || packet.vehicle.concern) && (
        <dl className="mt-4 grid gap-2 border-t border-black/15 pt-3 font-mono text-[11px] uppercase tracking-[0.12em] sm:grid-cols-3">
          {packet.vehicle.mileage ? (
            <div>
              <dt className="opacity-60">Miles</dt>
              <dd className="mt-0.5 text-sm normal-case tracking-normal">{packet.vehicle.mileage}</dd>
            </div>
          ) : null}
          {packet.vehicle.plate ? (
            <div>
              <dt className="opacity-60">Plate</dt>
              <dd className="mt-0.5 text-sm normal-case tracking-normal">
                {packet.vehicle.plate}
                {packet.vehicle.state ? ` · ${packet.vehicle.state}` : ""}
              </dd>
            </div>
          ) : null}
          {packet.vehicle.concern ? (
            <div className="sm:col-span-1">
              <dt className="opacity-60">Concern</dt>
              <dd className="mt-0.5 text-sm normal-case tracking-normal">{packet.vehicle.concern}</dd>
            </div>
          ) : null}
        </dl>
      )}

      {identified && !work ? (
        <p className="mt-4 border-l-2 border-black/30 pl-3 text-sm leading-6">
          Run{" "}
          <Link href="/quote" className="underline">
            quote defense
          </Link>
          , the{" "}
          <Link href="/symptoms" className="underline">
            symptom wizard
          </Link>
          , or the{" "}
          <Link href="/agent" className="underline">
            advocate
          </Link>{" "}
          first. This sheet only has the car in the bay.
        </p>
      ) : null}

      {chips.length ? (
        <ul className="mt-4 space-y-2" aria-label="Confidence chips">
          {chips.map((chip) => (
            <li key={chip.id} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <span
                className={`report-chip w-fit font-mono text-[10px] uppercase tracking-[0.16em] ${chip.warn ? "report-chip-warn" : ""}`}
              >
                {chip.stamp}
              </span>
              <span className="text-xs leading-5">{chip.meaning}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {packet.fluids ? (
        <section className="mt-5 border-t border-black/15 pt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">
            {packet.mode === "expert" ? "Spec / SKU" : "Fluids on this car"}
          </h3>
          {fluidsLane === "heuristic" ? (
            <p className="mt-2 text-sm leading-6">
              Heuristic specs can be wrong. Confirm viscosity and capacity on the cap and the door jamb before you buy
              oil.
            </p>
          ) : null}
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            {packet.fluids.viscosity ? (
              <Row label="Oil" value={`${packet.fluids.viscosity}${packet.fluids.capacity ? ` · ${packet.fluids.capacity}` : ""}`} />
            ) : null}
            {packet.fluids.tirePsiFront || packet.fluids.tirePsiRear ? (
              <Row
                label="Tire PSI"
                value={`${packet.fluids.tirePsiFront ?? "—"} front / ${packet.fluids.tirePsiRear ?? "—"} rear`}
              />
            ) : null}
            {packet.fluids.oilFilterSku ? <Row label="Oil filter" value={packet.fluids.oilFilterSku} /> : null}
            {packet.fluids.airFilterSku ? <Row label="Air filter" value={packet.fluids.airFilterSku} /> : null}
            {packet.fluids.cabinFilterSku ? <Row label="Cabin filter" value={packet.fluids.cabinFilterSku} /> : null}
          </dl>
        </section>
      ) : null}

      {packet.quote ? (
        <section className="mt-5 border-t border-black/15 pt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">
            {packet.quote.isQuoteFair ? "Quote · mostly fair" : "Quote · do not authorize yet"}
          </h3>
          {packet.quote.summary ? <p className="mt-2 text-sm leading-6">{packet.quote.summary}</p> : null}
          {packet.quote.flaggedItems.length ? (
            <ul className="mt-3 space-y-2">
              {packet.quote.flaggedItems.map((item) => (
                <li
                  key={`${item.item}-${item.quotedPrice}`}
                  className={`rounded-sm p-2.5 ${item.category === "ok" ? "bg-black/5" : "grease-x bg-black/5"}`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold">{item.item}</p>
                    <p className="font-mono text-sm">{money(item.quotedPrice)}</p>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-wide opacity-70">Fair {item.fairPriceRange}</p>
                  {item.warning ? <p className="mt-1 text-sm">{item.warning}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {sayLines.length ? (
        <section className="mt-5 border-t border-black/15 pt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">{sayHeading(packet.mode)}</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm leading-6">
            {sayLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {symptomCards.length ? (
        <section className="mt-5 border-t border-black/15 pt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">Symptoms</h3>
          <ul className="mt-2 space-y-2">
            {symptomCards.map((row) => (
              <li key={`${row.title}-${row.askTheShop}`}>
                <p className="font-semibold">{row.title}</p>
                {row.askTheShop ? <p className="text-sm leading-6">{row.askTheShop}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {packet.codes?.length ? (
        <section className="mt-5 border-t border-black/15 pt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">
            {packet.mode === "expert" ? "Codes" : "Scanner codes"}
          </h3>
          <ul className="mt-2 space-y-2">
            {packet.codes.map((row) => (
              <li key={row.code}>
                <p className="font-mono text-sm uppercase tracking-wide">
                  {row.code}
                  {row.title ? ` · ${row.title}` : ""}
                </p>
                {row.plainEnglish ? <p className="text-sm leading-6">{row.plainEnglish}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {packet.playbookTicks?.length ? (
        <section className="mt-5 border-t border-black/15 pt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">Playbook ticks</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-6">
            {packet.playbookTicks.map((tick) => (
              <li key={tick}>{tick}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {packet.serviceLog?.length ? (
        <section className="mt-5 border-t border-black/15 pt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">Service log</h3>
          <ul className="mt-2 space-y-2">
            {packet.serviceLog.map((row) => {
              const finding = entryToFinding(row);
              return (
                <li key={row.id}>
                  <p className="font-semibold">{finding.title}</p>
                  {packet.mode === "expert" && finding.askTheShop ? (
                    <p className="text-sm leading-6">{finding.askTheShop}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-5 border-t border-black/15 pt-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">Method</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-5">
          {PACKET_METHOD_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 text-xs leading-5 opacity-80">
          {SOURCE_LEGEND.map((chip) => (
            <li key={`${chip.id}-legend`}>
              <span className="font-mono uppercase tracking-wide">{chip.stamp}</span>
              {" — "}
              {chip.meaning}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 opacity-70">
        Open Hood is a translator, not a shop. Not legal advice, not a licensed inspector. Measurements beat
        adjectives. Do not authorize from a hunch or a menu.
      </p>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}

function collectSayLines(packet: ReportPacket): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();
  const push = (value: string | undefined) => {
    const next = value?.trim();
    if (!next || seen.has(next)) return;
    seen.add(next);
    lines.push(next);
  };
  for (const line of packet.quote?.mechanicScript ?? []) push(line);
  for (const row of packet.symptoms ?? []) push(row.askTheShop);
  return lines;
}
