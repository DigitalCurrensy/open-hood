import { ChromeLedger } from "@/app/sticker/chrome-ledger";
import { PlateDesk } from "@/app/sticker/plate-desk";
import { StickerDesk } from "@/app/sticker/sticker-desk";
import { DeskBrief } from "@/app/trust/_components/desk-brief";
import { PageHeader } from "@/components/page-header";
import { STICKER_BRIEF, STICKER_DISCLAIMER, STICKER_ROUTE } from "@/config/nav/sticker";
import { buildFluidSpecSheet } from "@/lib/fluids";
import { assembleIdentificationPacket, type IdentificationPacket } from "@/lib/nhtsa";
import type { IdentifiedVehicle } from "@/lib/types";
import { isValidVin, normalizeVin } from "@/lib/vin";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMeta({
  title: "Decoder sticker",
  description:
    "Identification packet from NHTSA vPIC: decode, engine, nameplate recalls, SaferCar VIN link. Not a Monroney. Not Chrome Data.",
  path: "/sticker",
});

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

async function seedFromVin(raw: string): Promise<{
  vehicle: IdentifiedVehicle | null;
  packet: IdentificationPacket | null;
}> {
  const vin = normalizeVin(raw);
  if (!isValidVin(vin)) return { vehicle: null, packet: null };
  try {
    const packet = await assembleIdentificationPacket(vin);
    const fluids = buildFluidSpecSheet(packet.specs);
    const recalls = packet.campaigns.flatMap((group) => group.rows);
    return { vehicle: { specs: packet.specs, fluids, recalls }, packet };
  } catch {
    return { vehicle: null, packet: null };
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialVin = first(params.vin);
  const seeded = await seedFromVin(initialVin);

  return (
    <div className="space-y-6">
      <DeskBrief brief={STICKER_BRIEF} beginnerHint="Beginner · factory facts" expertHint="Expert · vPIC fields" />
      <PageHeader kicker={`Window 09 · ${STICKER_ROUTE}`} title="Decoder sticker">
        {STICKER_DISCLAIMER}
      </PageHeader>
      <StickerDesk
        key={seeded.vehicle?.specs.vin || initialVin || "empty"}
        initialVin={initialVin}
        seeded={seeded.vehicle}
        seededPacket={seeded.packet}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <PlateDesk />
        <ChromeLedger completeness={seeded.packet?.completeness ?? null} />
      </div>
    </div>
  );
}
