import { NextResponse } from "next/server";
import { emptyCatalogAdapter } from "@/app/api/integrations/_lib/empty-catalog";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(emptyCatalogAdapter("partstech"));
}
