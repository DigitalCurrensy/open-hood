export interface CompressedImage {
  dataUrl: string;
  base64: string;
  mimeType: "image/jpeg";
  bytes: number;
}

const MAX_EDGE = 1600;
const QUALITY = 0.72;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

export function isLikelyImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(file.name);
}

export async function compressImageFile(file: File): Promise<CompressedImage> {
  if (!isLikelyImage(file)) {
    throw new Error("That file is not an image. Use a JPEG, PNG, or a phone photo.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("That photo is over 25 MB. Take a closer crop of the VIN plate or the quote.");
  }

  const bitmap = await fileToBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Could not open a drawing surface to compress that photo.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = await canvasToJpeg(canvas);
  const base64 = dataUrl.split(",", 2)[1] ?? "";
  if (!base64) throw new Error("Compression produced an empty image.");

  return {
    dataUrl,
    base64,
    mimeType: "image/jpeg",
    bytes: Math.round((base64.length * 3) / 4),
  };
}

async function fileToBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    const dataUrl = await readAsDataUrl(file);
    const image = await loadHtmlImage(dataUrl);
    try {
      return await createImageBitmap(image);
    } catch {
      throw new Error(
        "This browser could not read that photo (often iPhone HEIC). Take the shot as JPEG, or send a screenshot.",
      );
    }
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not decode that image."));
    image.src = src;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("JPEG conversion failed."));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Could not encode the JPEG."));
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      QUALITY,
    );
  });
}

export function clipboardImage(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      return item.getAsFile();
    }
  }
  return null;
}
