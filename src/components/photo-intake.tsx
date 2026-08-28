"use client";

import { MediaCapture, type MediaCaptureProps } from "@/components/media-capture";

/** Shared bay photo control — prefer importing MediaCapture directly. */
export function PhotoIntake({ stamp, ...props }: MediaCaptureProps & { stamp?: string }) {
  return (
    <div>
      <MediaCapture {...props} />
      {stamp ? (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">{stamp}</p>
      ) : null}
    </div>
  );
}
