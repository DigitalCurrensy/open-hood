"use client";

import { useState } from "react";
import { ElmBay } from "@/components/elm-bay";
import { MechanicDesk } from "@/components/mechanic-desk";
import { PageHeader } from "@/components/page-header";
import { VehicleGate } from "@/components/vehicle-gate";
import { quoteFromDtcHref } from "@/lib/obd";
import Link from "next/link";

export function MechanicPage() {
  const [codes, setCodes] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <PageHeader kicker="Counter copy" title="Mechanic mode">
        Don&apos;t authorize until you can say this out loud. Print it or paste it into your notes. Android Chrome can
        pair a BLE ELM327 here. iOS Safari has no Web Bluetooth — type the code or use TestFlight native.
      </PageHeader>
      <ElmBay onCodes={setCodes} />
      {codes.length ? (
        <p className="text-sm leading-6 text-aluminum">
          Stored codes from Mode 03:{" "}
          {codes.map((code) => (
            <Link key={code} href={quoteFromDtcHref(code)} className="mr-2 font-mono text-ticket">
              {code}
            </Link>
          ))}
          — take one to quote defense. This desk still does not invent the diagnosis.
        </p>
      ) : null}
      <VehicleGate tool="mechanic mode">{(vehicle) => <MechanicDesk vehicle={vehicle} />}</VehicleGate>
    </div>
  );
}
