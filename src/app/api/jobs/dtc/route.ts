import { NextResponse } from "next/server";
import { DTC_COUNT, lookupJobDtc } from "@/lib/jobs/dtc";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";
  const result = lookupJobDtc(code);
  if (!result.valid) {
    return NextResponse.json({ error: result.error, count: DTC_COUNT }, { status: 400 });
  }
  return NextResponse.json({ ...result, count: DTC_COUNT });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { code?: string };
  const result = lookupJobDtc(body.code ?? "");
  if (!result.valid) {
    return NextResponse.json({ error: result.error, count: DTC_COUNT }, { status: 400 });
  }
  return NextResponse.json({ ...result, count: DTC_COUNT });
}
