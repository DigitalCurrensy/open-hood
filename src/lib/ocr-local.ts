import { isValidVin, normalizeVin } from "@/lib/vin";

export interface LocalOcrResult {
  text: string;
  vins: string[];
  plateGuess: string;
}

let workerPromise: Promise<{
  recognize: (source: Blob | string) => Promise<{ data: { text: string } }>;
}> | null = null;

export async function recognizeLocalText(source: Blob | string): Promise<string> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      return createWorker("eng");
    })();
  }
  const worker = await workerPromise;
  const result = await worker.recognize(source);
  return result.data.text ?? "";
}

export function parseOcrText(text: string): LocalOcrResult {
  const vins = extractVins(text);
  return {
    text: text.replace(/\s+/g, " ").trim(),
    vins,
    plateGuess: extractPlateGuess(text, vins),
  };
}

export function extractVins(text: string): string[] {
  const found = new Set<string>();
  const spaced = text.toUpperCase().match(/[A-HJ-NPR-Z0-9]{17}/g) ?? [];
  for (const match of spaced) {
    const vin = normalizeVin(match);
    if (isValidVin(vin)) found.add(vin);
  }

  const compact = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (let index = 0; index <= compact.length - 17; index += 1) {
    const slice = compact.slice(index, index + 17);
    if (isValidVin(slice)) found.add(slice);
  }

  return [...found];
}

function extractPlateGuess(text: string, vins: string[]): string {
  const tokens = text.toUpperCase().match(/[A-Z0-9]{5,8}/g) ?? [];
  for (const token of tokens) {
    if (vins.some((vin) => vin.includes(token))) continue;
    if (/^[A-Z]{1,3}[0-9]{3,5}[A-Z]{0,3}$/.test(token) || /^[0-9]{1,3}[A-Z]{2,4}[0-9]{1,4}$/.test(token)) {
      return token;
    }
  }
  return "";
}
