import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY?.trim());
  return NextResponse.json({
    configured,
    connected: configured,
    probed: configured ? "skip" : "none",
    used: false,
    unlocks: configured
      ? "POST /api/ocr and quote photos can use vision. We still will not invent a line we cannot see."
      : "OPENAI_API_KEY would read a ticket or door-jamb photo first. Off → Tesseract on this device. VIN decode and the quote book still work.",
    desk: "/agent",
    ocr: "/api/ocr",
  });
}
