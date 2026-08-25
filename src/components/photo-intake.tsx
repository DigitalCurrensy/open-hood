"use client";

import { useRef, useState } from "react";
import { clipboardImage, compressImageFile, type CompressedImage } from "@/lib/image";

interface PhotoIntakeProps {
  label: string;
  hint: string;
  alt: string;
  busy?: boolean;
  onReady: (image: CompressedImage) => void;
  onError?: (message: string) => void;
}

export function PhotoIntake({ label, hint, alt, busy, onReady, onError }: PhotoIntakeProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    setNote("");
    try {
      const compressed = await compressImageFile(file);
      setPreview(compressed.dataUrl);
      setNote(`Compressed to JPEG · ${(compressed.bytes / 1024).toFixed(0)} KB`);
      onReady(compressed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not use that photo";
      setNote("");
      onError?.(message);
    }
  }

  return (
    <div
      className={`rounded-sm border border-dashed px-4 py-5 ${
        dragOver ? "border-ticket bg-ticket/5" : "border-white/20"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        void handleFile(event.dataTransfer.files[0] ?? null);
      }}
      onPaste={(event) => {
        const file = clipboardImage(event.nativeEvent);
        if (file) {
          event.preventDefault();
          void handleFile(file);
        }
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">{label}</p>
      <p className="mt-1 text-sm leading-6 text-aluminum">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-sm border border-white/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
        >
          Choose photo
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
          className="rounded-sm border border-white/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
        >
          Use camera
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      {preview ? (
        // User-provided data URL — not a content asset for next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={alt} className="mt-3 max-h-48 w-full rounded-sm object-contain" />
      ) : (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-aluminum-dim">
          Or paste an image here (Ctrl/Cmd+V)
        </p>
      )}
      {note ? <p className="mt-2 font-mono text-[11px] text-ticket">{note}</p> : null}
    </div>
  );
}
