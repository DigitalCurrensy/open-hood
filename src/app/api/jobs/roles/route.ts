import { NextResponse } from "next/server";
import { JOB_ROUTES, JOB_NAV } from "@/config/nav/jobs";

export async function GET() {
  return NextResponse.json({ routes: JOB_ROUTES, nav: JOB_NAV });
}
