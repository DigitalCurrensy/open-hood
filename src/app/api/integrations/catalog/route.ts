import { NextResponse } from "next/server";
import { licensedVendorRows } from "@/app/api/integrations/_lib/empty-catalog";
import { licensedEmpty } from "@/app/api/integrations/_lib/matrix";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    configured: false,
    connected: false,
    ...licensedEmpty(),
    vendors: licensedVendorRows(),
    osm: "Shop map stays OSM Overpass + Nominatim. Licensed SKUs do not replace rooftops.",
    roadmap: "/ROADMAP.md",
    desk: "/integrations",
  });
}
