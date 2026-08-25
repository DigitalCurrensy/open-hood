import { NextResponse } from "next/server";
import { extractVinFromImage, hasOpenAI } from "@/lib/openai";
import { isValidVin, normalizeVin } from "@/lib/vin";

export async function POST(request: Request) {
  const body = (await request.json()) as { imageBase64?: string; mimeType?: string };
  if (!body.imageBase64) {
    return NextResponse.json({ error: "Attach a plate or VIN photo." }, { status: 400 });
  }

  if (!hasOpenAI()) {
    return NextResponse.json(
      {
        error:
          "Cloud VIN-from-photo is off (no OPENAI_API_KEY). The bay still reads photos on your device — or type the VIN / year-make-model.",
        vin: "",
        usedCloud: false,
      },
      { status: 200 },
    );
  }

  try {
    const vin = normalizeVin(
      await extractVinFromImage(body.imageBase64, body.mimeType ?? "image/jpeg"),
    );
    if (!isValidVin(vin)) {
      return NextResponse.json({ error: "The photo did not yield a valid VIN." }, { status: 422 });
    }
    return NextResponse.json({ vin });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read that photo" },
      { status: 422 },
    );
  }
}
