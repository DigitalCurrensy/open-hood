import { NextResponse } from "next/server";
import { chromeDataStatus } from "@/lib/chrome-data";

export const dynamic = "force-dynamic";

export function GET() {
  const chrome = chromeDataStatus();
  return NextResponse.json({
    configured: false,
    connected: false,
    probed: "none",
    vendor: chrome.vendor,
    env: chrome.env,
    keyPresent: Boolean(process.env.CHROME_DATA_KEY?.trim()),
    skus: [],
    styles: [],
    packages: [],
    msrp: null,
    reason: chrome.reason,
    unlocks: "A signed J.D. Power Chrome Data contract would unlock style IDs, packages, destination, and RPO codes. A key sitting in env does not turn this on. ROADMAP.",
    homeUrl: chrome.homeUrl,
    desk: "/sticker",
  });
}
