import { NextResponse } from "next/server";
import { analyzeQuoteWithVision, hasOpenAI } from "@/lib/openai";
import { analyzeQuoteText, demoQuote } from "@/lib/quote";
import type { VehicleSpecs } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    imageBase64?: string;
    mimeType?: string;
    quoteText?: string;
    demo?: boolean;
    specs?: VehicleSpecs;
  };

  if (!body.specs?.year || !body.specs?.make || !body.specs?.model) {
    return NextResponse.json({ error: "Identify the vehicle first." }, { status: 400 });
  }

  if (body.demo) {
    return NextResponse.json(demoQuote(body.specs));
  }

  const quoteText = body.quoteText?.trim() ?? "";
  const hasImage = Boolean(body.imageBase64);

  if (!hasImage && !quoteText) {
    return NextResponse.json({ error: "Upload a quote photo or paste the line items." }, { status: 400 });
  }

  try {
    if (hasOpenAI() && (hasImage || quoteText.length > 40)) {
      const result = await analyzeQuoteWithVision({
        imageBase64: body.imageBase64,
        mimeType: body.mimeType ?? "image/jpeg",
        quoteText,
        specs: body.specs,
      });
      return NextResponse.json(result);
    }

    if (!quoteText) {
      return NextResponse.json(
        {
          error:
            "We could not read line items from that photo. Paste the prices, or wait for the local reader on the page — no OpenAI key required.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json(analyzeQuoteText(quoteText, body.specs));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quote analysis failed" },
      { status: 502 },
    );
  }
}
