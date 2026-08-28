import { NextResponse } from "next/server";
import { FINDER_ROUTES } from "@/config/nav/finder";
import { FINDER_JOB_COUNT, catalogStatus } from "@/lib/finder";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    jobs: FINDER_JOB_COUNT,
    routes: FINDER_ROUTES,
    catalog: catalogStatus(),
  });
}
