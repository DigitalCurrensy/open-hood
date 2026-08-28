import { ChromeLedger } from "@/app/sticker/chrome-ledger";
import { IdentifyPacket } from "@/app/sticker/identify-packet";
import { PlateDesk } from "@/app/sticker/plate-desk";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { STICKER_DISCLAIMER } from "@/config/nav/sticker";
import { assembleIdentificationPacket, type IdentificationPacket } from "@/lib/nhtsa";
import { breadcrumbList, pageMeta } from "@/lib/seo";
import { isValidVin, normalizeVin } from "@/lib/vin";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vin: string }>;
}): Promise<Metadata> {
  const vin = normalizeVin(decodeURIComponent((await params).vin));
  if (!isValidVin(vin)) return { title: "VIN not valid" };
  const packet = await assembleIdentificationPacket(vin).catch(() => null);
  return pageMeta({
    title: `${packet?.headline || "VIN"} · identification packet`,
    description: `vPIC decode, engine, nameplate recalls, SaferCar VIN link for ${vin}. Not Chrome. Not a VIN-true close-out.`,
    path: `/vin/${vin}`,
  });
}

export default async function Page({ params }: { params: Promise<{ vin: string }> }) {
  const vin = normalizeVin(decodeURIComponent((await params).vin));
  if (!isValidVin(vin)) notFound();

  const packet = await assembleIdentificationPacket(vin).catch(() => null);
  if (!packet) return <VinDecodeFault vin={vin} />;
  return <VinPacketView vin={vin} packet={packet} />;
}

function VinPacketView({ vin, packet }: { vin: string; packet: IdentificationPacket }) {
  return (
    <div className="space-y-6">
      <JsonLd
        data={breadcrumbList([
          { name: "VIN packet", path: "/vin" },
          { name: packet.headline || vin, path: `/vin/${vin}` },
        ])}
      />
      <PageHeader kicker="Window · identification packet" title={packet.headline || vin}>
        {STICKER_DISCLAIMER} {packet.stamp}
      </PageHeader>
      <IdentifyPacket packet={packet} />
      <div className="grid gap-4 lg:grid-cols-2">
        <PlateDesk />
        <ChromeLedger completeness={packet.completeness} />
      </div>
    </div>
  );
}

function VinDecodeFault({ vin }: { vin: string }) {
  return (
    <div className="space-y-4">
      <PageHeader kicker="VIN miss" title="Decoder did not land">
        NHTSA vPIC did not return a nameplate for this 17. We will not invent year, make, or a recall file.
      </PageHeader>
      <p className="text-sm leading-6 text-aluminum">VIN {vin}.</p>
      <Link href="/sticker" className="font-mono text-xs uppercase tracking-[0.16em] text-ticket">
        Back to the sticker desk
      </Link>
    </div>
  );
}
