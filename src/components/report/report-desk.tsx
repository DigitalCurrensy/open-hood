"use client";

import { assembleClientPacket, hasBayWork, packetIsEmpty } from "@/components/report/assemble-client";
import { fluidsLaneFromSheet } from "@/components/report/methodology";
import { PacketPreview } from "@/components/report/packet-preview";
import { ReportActions } from "@/components/report/report-actions";
import "./report.css";
import { PageHeader } from "@/components/page-header";
import { useReadingLevel } from "@/components/reading-level";
import { hasVehicleIdentity, type ReportPacket } from "@/lib/report/packet";
import { useIdentifiedVehicle, useLastQuote } from "@/lib/vehicle-session";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function ReportDesk() {
  const [vehicle] = useIdentifiedVehicle();
  const [quote] = useLastQuote();
  const [level] = useReadingLevel();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setReady(true));
  }, []);

  const packet: ReportPacket = useMemo(() => {
    if (!ready) {
      return assembleClientPacket({ mode: level });
    }
    return assembleClientPacket({
      mode: level,
      vehicle: vehicle ?? undefined,
      fluids: vehicle?.fluids,
      quote: quote ?? undefined,
    });
  }, [level, quote, ready, vehicle]);

  const empty = packetIsEmpty(packet);
  const identified = hasVehicleIdentity(packet.vehicle);
  const fluidsLane = fluidsLaneFromSheet(vehicle?.fluids);

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader kicker="Window 04 · customer copy" title="Findings">
          One packet. Print it, save the JSON, or walk the yellow copy to the window. Empty sections stay off the page.
        </PageHeader>
      </div>

      {!ready ? (
        <p className="no-print font-mono text-[11px] uppercase tracking-[0.28em] text-aluminum">Collating the copy…</p>
      ) : empty ? (
        <div className="no-print rounded-sm border border-dashed border-white/15 bg-bay-2/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Empty bay</p>
          <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">No findings in this session</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-aluminum">
            Identify a car on the{" "}
            <Link href="/" className="text-ticket">
              bay
            </Link>
            , then run quote defense, the symptom wizard, or the advocate. This desk does not invent a ticket.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <aside className="no-print space-y-4">
            <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
              <h3 className="font-display text-2xl uppercase tracking-wide">Take the copy</h3>
              <p className="mt-2 text-sm leading-6 text-aluminum">
                Print uses the browser dialog — Save as PDF if you need a file. JSON is the same packet the preview
                shows. Text is the counter version.
              </p>
              <div className="mt-4">
                <ReportActions packet={packet} />
              </div>
              {identified && !hasBayWork(packet) ? (
                <p className="mt-4 text-sm leading-6 text-aluminum">
                  Vehicle is stamped. Run{" "}
                  <Link href="/quote" className="text-ticket">
                    quote
                  </Link>
                  ,{" "}
                  <Link href="/symptoms" className="text-ticket">
                    symptoms
                  </Link>
                  , or the{" "}
                  <Link href="/agent" className="text-ticket">
                    advocate
                  </Link>{" "}
                  first.
                </p>
              ) : null}
            </div>
            {packet.nextDesks.length ? (
              <nav aria-label="Next desks" className="rounded-sm border border-white/10 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Still in the bay</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {packet.nextDesks.map((desk) => (
                    <li key={desk.href}>
                      <Link
                        href={desk.href}
                        className="inline-block rounded-sm border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
                      >
                        {desk.stamp}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </aside>
          <PacketPreview packet={packet} fluidsLane={fluidsLane} />
        </div>
      )}
    </div>
  );
}
