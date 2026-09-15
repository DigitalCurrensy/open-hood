import { NextResponse } from "next/server";
import { analyzeQuoteWithVision } from "@/lib/openai";
import { hoursStatus, loadHoursBook } from "@/lib/quote/licensed-hours";
import {
  analyzeQuote,
  asQuoteDefense,
  demoQuote,
  OCR_HONESTY,
  visionKeyOn,
  visionStamp,
} from "@/lib/quote";
import { rateLimit } from "@/lib/rate-limit";
import type { VehicleSpecs } from "@/lib/types";

export const dynamic = "force-dynamic";

function visionStatus() {
  const on = visionKeyOn();
  return {
    on,
    usedCloud: false,
    stamp: visionStamp(on),
    engine: on ? ("vision" as const) : ("tesseract" as const),
  };
}

function specsFromBody(body: {
  specs?: Partial<VehicleSpecs>;
  vehicle?: { year?: string; make?: string; model?: string; vin?: string };
}): VehicleSpecs | null {
  const year = body.specs?.year || body.vehicle?.year;
  const make = body.specs?.make || body.vehicle?.make;
  const model = body.specs?.model || body.vehicle?.model;
  if (!year || !make || !model) return null;
  return {
    ...(body.specs as VehicleSpecs),
    year,
    make,
    model,
    vin: body.specs?.vin || body.vehicle?.vin || "",
  } as VehicleSpecs;
}

export function GET() {
  const hours = hoursStatus();
  return NextResponse.json({
    hours,
    vision: visionStatus(),
    stamp: hours.stamp,
    licensed: hours.licensed,
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!rateLimit(`quote:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many quote checks from this network. Wait a minute." }, { status: 429 });
  }

  const body = (await request.json()) as {
    imageBase64?: string;
    mimeType?: string;
    quoteText?: string;
    text?: string;
    zip?: string;
    demo?: boolean;
    specs?: VehicleSpecs;
    vehicle?: { year?: string; make?: string; model?: string; vin?: string };
  };

  const specs = specsFromBody(body);
  if (!specs) {
    return NextResponse.json({ error: "Identify the vehicle first." }, { status: 400 });
  }

  const zip = typeof body.zip === "string" ? body.zip : undefined;
  const visionOn = visionKeyOn();

  if (body.demo) {
    return NextResponse.json({
      ...demoQuote(specs, zip),
      vision: { ...visionStatus(), usedCloud: false },
    });
  }

  const quoteText = (body.quoteText ?? body.text)?.trim() ?? "";
  const hasImage = Boolean(body.imageBase64);

  if (!hasImage && !quoteText) {
    return NextResponse.json({ error: "Upload a quote photo or paste the line items." }, { status: 400 });
  }

  try {
    if (quoteText) {
      const defense = await analyzeQuote(quoteText, specs, zip);
      return NextResponse.json({
        ...defense,
        vision: { on: visionOn, usedCloud: false, stamp: visionStamp(visionOn), engine: visionOn ? "vision" : "tesseract" },
      });
    }

    if (visionOn && hasImage) {
      const vision = await analyzeQuoteWithVision({
        imageBase64: body.imageBase64,
        mimeType: body.mimeType ?? "image/jpeg",
        quoteText,
        specs,
      });
      const hoursBook = await loadHoursBook({
        jobKeys: vision.flaggedItems.map((row) => row.item),
        year: specs.year,
        make: specs.make,
        model: specs.model,
      });
      const defense = asQuoteDefense({
        ...vision,
        laborRateEstimate: vision.laborRateEstimate
          ? `${vision.laborRateEstimate} · ${hoursBook.stamp}`
          : hoursBook.stamp,
      });
      return NextResponse.json({
        ...defense,
        hours: {
          source: hoursBook.source,
          stamp: hoursBook.stamp,
          licensed: hoursBook.licensed,
          catalogIds: hoursBook.catalogIds,
        },
        vision: { on: true, usedCloud: true, stamp: visionStamp(true), engine: "vision" },
      });
    }

    return NextResponse.json(
      {
        error: `${OCR_HONESTY} We could not read line items from that photo. Paste the prices — we mark this up from the typical-hour book.`,
        hours: hoursStatus(),
        vision: { on: false, usedCloud: false, stamp: visionStamp(false), engine: "tesseract" },
      },
      { status: 422 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quote analysis failed" },
      { status: 502 },
    );
  }
}
