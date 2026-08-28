import { NextResponse } from "next/server";
import { fetchTitleSnapshot, titleSnapshotStatus } from "@/lib/title-snapshot";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const vin = new URL(request.url).searchParams.get("vin");
  if (!vin?.trim()) {
    const status = titleSnapshotStatus();
    return NextResponse.json({
      ok: true,
      ...status,
      invented: false,
      snapshot: null,
      desk: "/history",
    });
  }
  return fetchTitleSnapshot(vin).then((snapshot) => NextResponse.json(snapshot));
}

export async function POST(request: Request) {
  let body: { vin?: string } = {};
  try {
    body = (await request.json()) as { vin?: string };
  } catch {
    return NextResponse.json(
      { ok: false, invented: false, error: "Send JSON { vin }. We will not invent a title file." },
      { status: 400 },
    );
  }
  return NextResponse.json(await fetchTitleSnapshot(body.vin ?? ""));
}
