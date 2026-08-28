import { ChromeLedger } from "@/app/sticker/chrome-ledger";
import { IdentifyPacket } from "@/app/sticker/identify-packet";
import { PlateDesk } from "@/app/sticker/plate-desk";
import { PageHeader } from "@/components/page-header";
import { assembleIdentificationPacket, VIN_OPEN_CLOSED_STAMP } from "@/lib/nhtsa";
import { pageMeta } from "@/lib/seo";
import { DEMO_VINS, isValidVin, normalizeVin } from "@/lib/vin";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMeta({
  title: "VIN identification packet",
  description:
    "vPIC decode, engine, nameplate recalls grouped by campaign, SaferCar VIN link. Not Chrome. Not VIN-true open/closed.",
  path: "/vin",
});

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const vin = normalizeVin(first((await searchParams).vin));
  const packet = isValidVin(vin) ? await assembleIdentificationPacket(vin).catch(() => null) : null;

  return (
    <div className="space-y-6">
      <PageHeader kicker="Window · identification" title={packet?.headline || "VIN packet"}>
        Stamp a 17. We print the decoder, the engine, and the nameplate recall list. {VIN_OPEN_CLOSED_STAMP}{" "}
        {packet?.stillNotVinTrue ?? ""}
      </PageHeader>
      <div className="flex flex-wrap gap-2">
        {DEMO_VINS.map((demo) => (
          <Link
            key={demo.vin}
            href={`/vin?vin=${demo.vin}`}
            className="rounded-sm border border-white/15 bg-bay-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent hover:border-ticket/50"
          >
            {demo.label}
          </Link>
        ))}
        <Link
          href="/sticker?vin=1HGCM82633A004352"
          className="rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Honda sticker
        </Link>
      </div>
      {packet ? <IdentifyPacket packet={packet} /> : null}
      {isValidVin(vin) && !packet ? (
        <p className="text-sm leading-6 text-cone">NHTSA did not decode {vin}. We will not invent a nameplate.</p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <PlateDesk />
        <ChromeLedger completeness={packet?.completeness ?? null} />
      </div>
    </div>
  );
}
