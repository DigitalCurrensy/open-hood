import type { QuoteAnalysisResult, VehicleSpecs } from "@/lib/types";
import { analyzeQuoteText } from "@/lib/quote";

const SYSTEM_QUOTE = `You are an expert master mechanic advocate for non-car-knowledgeable vehicle owners in the United States.
Analyze the repair estimate (image and/or pasted text).
Rules:
- Parse each labor and part line item.
- Flag excessive markups vs typical independent-shop retail.
- Flag unnecessary add-ons (flushes, fuel-system cleaners, cabin filters at extreme labor rates, throttle-body services with no symptom).
- Never invent prices you cannot see. If handwriting is unclear, say so.
- mechanicScript must be word-for-word lines the customer can say at the counter. Max 5. Plain English. No slang lecture.
Return strict JSON:
{
  "isQuoteFair": boolean,
  "shopName": string|null,
  "laborRateEstimate": string|null,
  "totalQuoted": number|null,
  "flaggedItems": [{"item": string, "quotedPrice": number|null, "fairPriceRange": string, "warning": string, "category": "markup"|"upsell"|"labor"|"ok"}],
  "mechanicScript": string[],
  "summary": string
}`;

export function hasOpenAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

async function chatJson(messages: unknown[]): Promise<Record<string, unknown>> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${detail.slice(0, 280)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty message");
  return JSON.parse(content) as Record<string, unknown>;
}

export async function extractVinFromImage(imageBase64: string, mimeType: string): Promise<string> {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  const json = await chatJson([
    {
      role: "system",
      content:
        "Read a US license plate or a VIN (dashboard plate, door jamb sticker, or barcode area). Return JSON {\"vin\": string, \"plate\": string|null, \"notes\": string}. VIN must be 17 characters if visible. Use empty string if unreadable.",
    },
    {
      role: "user",
      content: [
        { type: "text", text: "Extract the VIN and/or plate." },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    },
  ]);

  const vin = String(json.vin ?? "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  if (vin.length !== 17) {
    throw new Error(String(json.notes || "Could not read a 17-character VIN from that photo."));
  }
  return vin;
}

export async function analyzeQuoteWithVision(input: {
  imageBase64?: string;
  mimeType?: string;
  quoteText?: string;
  specs: VehicleSpecs;
}): Promise<QuoteAnalysisResult> {
  const vehicle = `${input.specs.year} ${input.specs.make} ${input.specs.model}`.trim();
  const userContent: unknown[] = [
    {
      type: "text",
      text: `Analyze this repair estimate for a ${vehicle} (VIN ${input.specs.vin}). ${input.quoteText ? `Pasted text:\n${input.quoteText}` : ""}`,
    },
  ];

  if (input.imageBase64 && input.mimeType) {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${input.mimeType};base64,${input.imageBase64}` },
    });
  }

  const json = await chatJson([
    { role: "system", content: SYSTEM_QUOTE },
    { role: "user", content: userContent },
  ]);

  const flaggedItems = Array.isArray(json.flaggedItems) ? json.flaggedItems : [];
  const mechanicScript = Array.isArray(json.mechanicScript)
    ? json.mechanicScript.map(String)
    : [];

  return {
    isQuoteFair: Boolean(json.isQuoteFair),
    shopName: json.shopName ? String(json.shopName) : null,
    laborRateEstimate: json.laborRateEstimate ? String(json.laborRateEstimate) : null,
    totalQuoted: typeof json.totalQuoted === "number" ? json.totalQuoted : null,
    flaggedItems: flaggedItems.map((row) => {
      const item = row as Record<string, unknown>;
      const category = item.category;
      return {
        item: String(item.item ?? "Line item"),
        quotedPrice: typeof item.quotedPrice === "number" ? item.quotedPrice : null,
        fairPriceRange: String(item.fairPriceRange ?? "Unknown"),
        warning: String(item.warning ?? ""),
        category:
          category === "markup" || category === "upsell" || category === "labor" || category === "ok"
            ? category
            : "ok",
      };
    }),
    mechanicScript: mechanicScript.length ? mechanicScript : analyzeQuoteText(input.quoteText ?? "", input.specs).mechanicScript,
    summary: String(json.summary ?? "Review the flagged lines before you authorize work."),
    usedVisionModel: Boolean(input.imageBase64),
  };
}
