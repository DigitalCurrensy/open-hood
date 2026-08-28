import { NextResponse } from "next/server";
import { extractQuoteTextFromImage, extractVinPlateFromImage } from "@/lib/openai";
import { DARK_HOURS_STAMP } from "@/lib/quote/licensed-hours";
import { extractQuoteLinesFromOcr, OCR_HONESTY, visionKeyOn, visionStamp } from "@/lib/quote";
import { isValidVin, normalizeVin } from "@/lib/vin";

export const dynamic = "force-dynamic";

const LOTTERY =
  `${OCR_HONESTY} Tesseract on this device still tries dollars and job names (filter / coolant garbles included). Same packed-LOF engine as paste. Not vision.`;

function ocrStatus() {
  const available = visionKeyOn();
  return {
    available,
    vision: available,
    engine: available ? ("vision" as const) : ("tesseract" as const),
    stamp: visionStamp(available),
    usedCloud: false,
    hoursStamp: DARK_HOURS_STAMP,
    message: available
      ? `${visionStamp(true)}. Compressed JPEG goes to vision first (usedCloud:true). Line items feed ${DARK_HOURS_STAMP} unless a licensed extract answers.`
      : LOTTERY,
  };
}

export async function GET() {
  return NextResponse.json(ocrStatus());
}

export async function POST(request: Request) {
  let body: {
    imageBase64?: string;
    mimeType?: string;
    kind?: string;
    text?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Send JSON with a photo or pasted lines.", usedCloud: false }, { status: 400 });
  }

  const kind = body.kind === "quote" ? "quote" : "vin";
  const deviceText = typeof body.text === "string" ? body.text.trim() : "";
  const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
  const mimeType = body.mimeType?.startsWith("image/") ? body.mimeType : "image/jpeg";
  const available = visionKeyOn();
  const stamp = visionStamp(available);

  if (kind === "quote" && !available) {
    if (deviceText) {
      return NextResponse.json({
        text: extractQuoteLinesFromOcr(deviceText),
        usedCloud: false,
        parsed: true,
        kind,
        engine: "tesseract",
        stamp,
        message: LOTTERY,
      });
    }
    return NextResponse.json({
      text: "",
      usedCloud: false,
      parsed: false,
      kind,
      engine: "tesseract",
      stamp,
      message: imageBase64
        ? LOTTERY
        : "Attach an RO photo or paste the line items.",
      ...(imageBase64 ? {} : { error: "Attach an RO photo or paste the line items." }),
    }, { status: imageBase64 ? 200 : 400 });
  }

  if (!available) {
    if (!imageBase64 && !deviceText) {
      return NextResponse.json({ error: "Attach a plate, VIN, or estimate photo.", usedCloud: false, kind }, { status: 400 });
    }
    return NextResponse.json({
      error: LOTTERY,
      vin: "",
      plate: "",
      text: "",
      usedCloud: false,
      parsed: false,
      kind,
      engine: "tesseract",
      stamp,
      message: LOTTERY,
    });
  }

  if (kind === "quote" && !imageBase64 && deviceText) {
    return NextResponse.json({
      text: extractQuoteLinesFromOcr(deviceText),
      usedCloud: false,
      parsed: true,
      kind,
      engine: "vision",
      stamp,
      message: `${stamp}. Pasted lines still go through the same markup engine as a photo.`,
    });
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "Attach a plate, VIN, or estimate photo.", usedCloud: false, kind }, { status: 400 });
  }

  try {
    if (kind === "quote") {
      const read = await extractQuoteTextFromImage(imageBase64, mimeType);
      if (!read.text) {
        return NextResponse.json(
          {
            error: read.notes || "The photo did not yield line items we could type.",
            text: "",
            usedCloud: true,
            parsed: false,
            kind,
            engine: "vision",
            stamp,
          },
          { status: 422 },
        );
      }
      const text = extractQuoteLinesFromOcr(read.text);
      return NextResponse.json({
        text,
        notes: read.notes,
        usedCloud: true,
        parsed: Boolean(text),
        kind,
        engine: "vision",
        stamp,
        message: `${stamp}. Line items and dollars go through the typical-hour book.`,
      });
    }

    const read = await extractVinPlateFromImage(imageBase64, mimeType);
    const vin = normalizeVin(read.vin);
    if (vin && !isValidVin(vin)) {
      return NextResponse.json(
        { error: "The photo did not yield a valid VIN.", vin: "", plate: read.plate, usedCloud: true, kind, engine: "vision" },
        { status: 422 },
      );
    }
    if (!vin && !read.plate) {
      return NextResponse.json(
        {
          error: read.notes || "The photo did not yield a VIN or a plate.",
          vin: "",
          plate: "",
          usedCloud: true,
          kind,
          engine: "vision",
        },
        { status: 422 },
      );
    }
    return NextResponse.json({
      vin,
      plate: read.plate,
      notes: read.notes,
      usedCloud: true,
      kind,
      engine: "vision",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not read that photo",
        usedCloud: true,
        kind,
        engine: "vision",
        stamp,
      },
      { status: 422 },
    );
  }
}
