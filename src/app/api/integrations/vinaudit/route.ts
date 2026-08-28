import { NextResponse } from "next/server";
import { titleSnapshotStatus } from "@/lib/title-snapshot";

export const dynamic = "force-dynamic";

export function GET() {
  const status = titleSnapshotStatus();
  const configured = status.vinaudit;
  return NextResponse.json({
    configured,
    connected: configured,
    probed: configured ? "skip" : "none",
    env: "VINAUDIT_API_KEY",
    vendor: configured ? "vinaudit" : null,
    invented: false,
    snapshot: null,
    stamp: status.stamp,
    notice: configured
      ? "VinAudit key is on. POST /api/history/title with a VIN. We still do not invent wrecks or a Carfax XML."
      : "No VINAUDIT_API_KEY. Title brands stay outbound. This jack is not a Carfax file.",
    unlocks: configured
      ? "Title snapshot on /history names VinAudit. Never a dummy salvage file."
      : "A VinAudit key would unlock /history title. Off → Carfax / AutoCheck / NMVTIS consumer cards.",
    desk: "/history",
    title: "/api/history/title",
  });
}
