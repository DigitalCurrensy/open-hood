"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { clipboardImage, compressImageFile, type CompressedImage } from "@/lib/image";

export type { CompressedImage };

export interface MediaCaptureProps {
  label: string;
  hint?: string;
  alt?: string;
  busy?: boolean;
  compact?: boolean;
  disabled?: boolean;
  image?: CompressedImage | null;
  onReady: (image: CompressedImage) => void;
  onClear?: () => void;
  onError?: (message: string) => void;
}

const CAMERA_DENIED = "Camera permission was denied. Choose a photo instead.";
const CAMERA_UNAVAILABLE = "Could not open the camera. Choose a photo instead.";

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: "environment" },
    aspectRatio: { ideal: 16 / 9 },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
};

const TAP =
  "relative z-10 min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50";

function prefersNativeCapture(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
  // iPadOS 13+ reports as Macintosh with a touch surface.
  return navigator.maxTouchPoints > 1 && /Mac/i.test(ua);
}

function isPermissionDenied(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === "NotAllowedError" || error.name === "PermissionDeniedError";
  }
  return false;
}

function stopTracks(stream: MediaStream | null) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

function jpegFileFromCanvas(canvas: HTMLCanvasElement): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not capture that frame. Choose a photo instead."));
          return;
        }
        resolve(new File([blob], "camera.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  });
}

export function MediaCapture({
  label,
  hint,
  alt = "Selected photo",
  busy = false,
  compact = false,
  disabled = false,
  image,
  onReady,
  onClear,
  onError,
}: MediaCaptureProps) {
  const fileId = useId();
  const cameraId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const [internal, setInternal] = useState<CompressedImage | null>(null);
  const [live, setLive] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const controlled = image !== undefined;
  const preview = controlled ? image : internal;
  const locked = busy || disabled || compressing;

  const stopCamera = useCallback(() => {
    const stream = streamRef.current;
    streamRef.current = null;
    stopTracks(stream);
    const video = videoRef.current;
    if (video) video.srcObject = null;
    setLive(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!live || !video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => {
      /* Autoplay can wait — shutter still works once a frame is ready. */
    });
  }, [live]);

  const setPreview = useCallback(
    (next: CompressedImage | null) => {
      if (!controlled) setInternal(next);
    },
    [controlled],
  );

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file || locked) return;
      setLocalError("");
      setNote("");
      setCompressing(true);
      try {
        const compressed = await compressImageFile(file);
        setPreview(compressed);
        setNote(`Compressed to JPEG · ${(compressed.bytes / 1024).toFixed(0)} KB`);
        onReady(compressed);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not use that photo";
        setNote("");
        setLocalError(message);
        onError?.(message);
      } finally {
        setCompressing(false);
      }
    },
    [locked, onError, onReady, setPreview],
  );

  const startCamera = useCallback(async () => {
    if (locked) return;
    setLocalError("");
    stopCamera();

    if (cameraBlocked) {
      fileRef.current?.click();
      return;
    }

    if (prefersNativeCapture() || typeof navigator.mediaDevices?.getUserMedia !== "function") {
      cameraRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
      if (!mountedRef.current) {
        stopTracks(stream);
        return;
      }
      streamRef.current = stream;
      setLive(true);
    } catch (error) {
      stopCamera();
      const denied = isPermissionDenied(error);
      const message = denied ? CAMERA_DENIED : CAMERA_UNAVAILABLE;
      setLocalError(message);
      onError?.(message);
      if (denied) {
        setCameraBlocked(true);
        fileRef.current?.click();
      }
    }
  }, [cameraBlocked, locked, onError, stopCamera]);

  const snap = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) {
      setLocalError("Camera is still starting. Try again in a moment.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      stopCamera();
      setLocalError(CAMERA_UNAVAILABLE);
      onError?.(CAMERA_UNAVAILABLE);
      return;
    }
    context.drawImage(video, 0, 0);
    stopCamera();
    try {
      const file = await jpegFileFromCanvas(canvas);
      await handleFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : CAMERA_UNAVAILABLE;
      setLocalError(message);
      onError?.(message);
    }
  }, [handleFile, onError, stopCamera]);

  function clearPreview() {
    stopCamera();
    setPreview(null);
    setNote("");
    setLocalError("");
    onClear?.();
  }

  const shell = compact
    ? `space-y-2 ${dragOver ? "rounded-sm border border-dashed border-ticket bg-ticket/5 px-3 py-2" : ""}`
    : `rounded-sm border border-dashed px-4 py-5 ${dragOver ? "border-ticket bg-ticket/5" : "border-white/20"}`;

  return (
    <div
      className={shell}
      tabIndex={0}
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
        if (!file) return;
        event.preventDefault();
        event.stopPropagation();
        void handleFile(file);
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">{label}</p>
      {hint ? <p className="mt-1 text-sm leading-6 text-aluminum">{hint}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={locked}
          onClick={() => fileRef.current?.click()}
          className={TAP}
          aria-label="Choose a photo from this device"
        >
          Choose photo
        </button>
        <button
          type="button"
          disabled={locked || live}
          onClick={() => void startCamera()}
          className={TAP}
          aria-label={cameraBlocked ? "Camera blocked — choose a photo instead" : "Use the camera"}
        >
          Use camera
        </button>
        {preview ? (
          <button
            type="button"
            disabled={locked}
            onClick={clearPreview}
            className="min-h-11 rounded-sm border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cone hover:text-ticket disabled:opacity-50"
          >
            Remove
          </button>
        ) : null}
      </div>

      <input
        id={fileId}
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      <input
        id={cameraId}
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />

      {live ? (
        <div className="mt-3 overflow-hidden rounded-sm border border-white/15 bg-black">
          <video
            ref={videoRef}
            className="aspect-video w-full bg-black object-cover"
            autoPlay
            playsInline
            muted
            aria-label="Live camera"
          />
          <div className="flex flex-wrap gap-2 p-2">
            <button
              type="button"
              onClick={() => void snap()}
              className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink"
            >
              Take photo
            </button>
            <button type="button" onClick={stopCamera} className={TAP}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {preview ? (
        // User-provided data URL — not a content asset for next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.dataUrl}
          alt={alt}
          className={`mt-3 w-full rounded-sm object-contain ${compact ? "max-h-28" : "max-h-48"}`}
        />
      ) : !live ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-aluminum-dim">
          Or paste an image here (Ctrl/Cmd+V)
        </p>
      ) : null}

      {note ? <p className="mt-2 font-mono text-[11px] text-ticket">{note}</p> : null}
      {localError ? <p className="mt-2 text-sm text-cone">{localError}</p> : null}
    </div>
  );
}
