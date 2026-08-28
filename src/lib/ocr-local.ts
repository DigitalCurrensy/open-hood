import { isValidVin, normalizeVin } from "@/lib/vin";

export interface LocalOcrResult {
  text: string;
  vins: string[];
  plateGuess: string;
}

type TessWorker = Awaited<ReturnType<(typeof import("tesseract.js"))["createWorker"]>>;

let workerPromise: Promise<TessWorker> | null = null;
let quoteWorkerPromise: Promise<TessWorker> | null = null;

async function localWorker() {
  workerPromise ??= import("tesseract.js").then(({ createWorker }) => createWorker("eng"));
  return workerPromise;
}

async function quoteWorker() {
  quoteWorkerPromise ??= import("tesseract.js").then(async ({ createWorker, PSM }) => {
    const worker = await createWorker("eng");
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });
    return worker;
  });
  return quoteWorkerPromise;
}

export async function recognizeLocalText(source: Blob | string): Promise<string> {
  const worker = await localWorker();
  const result = await worker.recognize(source);
  return result.data.text ?? "";
}

function tokenCount(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 2).length;
}

/** Lottery path: contrast stretch + Tesseract PSM 6, sparse retry if the block is junk. */
export async function recognizeQuotePhoto(dataUrl: string): Promise<{ text: string; confidence: number | null }> {
  const processed = await preprocessQuotePhoto(dataUrl);
  try {
    const worker = await quoteWorker();
    const first = await worker.recognize(processed);
    let text = first.data.text ?? "";
    let confidence = typeof first.data.confidence === "number" ? first.data.confidence : null;
    if (tokenCount(text) < 3) {
      const { PSM } = await import("tesseract.js");
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      const second = await worker.recognize(processed);
      const next = second.data.text ?? "";
      if (tokenCount(next) > tokenCount(text)) {
        text = next;
        confidence = typeof second.data.confidence === "number" ? second.data.confidence : confidence;
      }
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
    }
    return { text, confidence };
  } catch {
    const text = await recognizeLocalText(processed);
    return { text, confidence: null };
  }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not open that photo for reading."));
    image.src = src;
  });
}

async function preprocessQuotePhoto(dataUrl: string): Promise<string> {
  try {
    const image = await loadHtmlImage(dataUrl);
    const minEdge = Math.min(image.width, image.height);
    const scale = minEdge < 1600 ? 1600 / minEdge : minEdge > 2400 ? 2400 / minEdge : 1;
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;
    context.filter = "grayscale(1) contrast(1.55) brightness(1.06)";
    context.drawImage(image, 0, 0, width, height);
    context.filter = "none";
    const pixels = context.getImageData(0, 0, width, height);
    const data = pixels.data;
    let sum = 0;
    for (let index = 0; index < data.length; index += 4) {
      sum += data[index];
    }
    const mean = sum / (data.length / 4);
    if (mean < 80) {
      for (let index = 0; index < data.length; index += 4) {
        data[index] = 255 - data[index];
        data[index + 1] = 255 - data[index + 1];
        data[index + 2] = 255 - data[index + 2];
      }
    } else if (mean > 150) {
      for (let index = 0; index < data.length; index += 4) {
        const ink = data[index] < mean - 18 ? Math.max(0, Math.round(data[index] * 0.45)) : 255;
        data[index] = ink;
        data[index + 1] = ink;
        data[index + 2] = ink;
      }
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return dataUrl;
  }
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
