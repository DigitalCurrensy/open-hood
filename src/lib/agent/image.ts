import type { AgentImageKind } from "@/lib/agent/types";

export interface CompressedAgentImage {
  base64: string;
  mimeType: "image/jpeg";
  previewUrl: string;
  kind: AgentImageKind;
  bytes: number;
}

const MAX_EDGE = 1280;
const HARD_CAP = 700_000;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const data = result.split(",", 2)[1];
      if (!data) {
        reject(new Error("Could not read that photo."));
        return;
      }
      resolve(data);
    };
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not compress that photo."));
        else resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

async function bitmapFromFile(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to HTMLImageElement
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not open that photo. Try a JPEG screenshot, or describe it."));
    };
    image.src = url;
  });
}

export async function compressAgentImage(file: File, kind: AgentImageKind): Promise<CompressedAgentImage> {
  if (!file.type.startsWith("image/") && file.type !== "") {
    throw new Error("That file is not a photo. Attach a quote, leak, or dash-light picture — or describe it.");
  }

  const source = await bitmapFromFile(file);
  const width = "width" in source ? source.width : 0;
  const height = "height" in source ? source.height : 0;
  if (!width || !height) {
    throw new Error("That photo has no readable size.");
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not compress that photo in this browser.");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const quality = 0.72;
  let blob = await canvasToBlob(canvas, quality);
  if (blob.size > HARD_CAP) {
    blob = await canvasToBlob(canvas, 0.55);
  }
  if (blob.size > HARD_CAP) {
    const smaller = document.createElement("canvas");
    smaller.width = Math.max(1, Math.round(canvas.width * 0.75));
    smaller.height = Math.max(1, Math.round(canvas.height * 0.75));
    const shrink = smaller.getContext("2d");
    if (shrink) {
      shrink.drawImage(source, 0, 0, smaller.width, smaller.height);
      blob = await canvasToBlob(smaller, 0.5);
    }
  }
  if ("close" in source && typeof source.close === "function") source.close();

  const base64 = await blobToBase64(blob);
  return {
    base64,
    mimeType: "image/jpeg",
    previewUrl: URL.createObjectURL(blob),
    kind,
    bytes: blob.size,
  };
}

export function revokePreview(url?: string) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}
