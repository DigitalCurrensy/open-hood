"use client";

import Link from "next/link";
import { useState } from "react";
import { PhotoIntake } from "@/components/photo-intake";
import type { CompressedImage } from "@/lib/image";
import { recognizeLocalText } from "@/lib/ocr-local";
import type { IdentifiedVehicle, QuoteAnalysisResult } from "@/lib/types";
import { useLastQuote } from "@/lib/vehicle-session";

export function QuoteDesk({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const [, setLastQuote] = useLastQuote();
  const [quoteText, setQuoteText] = useState("");
  const [image, setImage] = useState<CompressedImage | null>(null);
  const [result, setResult] = useState<QuoteAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ocrNote, setOcrNote] = useState("");

  async function onQuotePhoto(compressed: CompressedImage) {
    setImage(compressed);
    setError("");
    setOcrNote("Reading the ticket on this device…");
    try {
      const text = await recognizeLocalText(compressed.dataUrl);
      const cleaned = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 2)
        .join("\n");
      if (cleaned) {
        setQuoteText((current) => (current.trim() ? `${current.trim()}\n${cleaned}` : cleaned));
        setOcrNote("Pulled text from the photo. Check it, then markup.");
      } else {
        setOcrNote("Photo is ready. We could not read prices — type the line items.");
      }
    } catch (err) {
      setOcrNote("");
      setError(err instanceof Error ? err.message : "Could not read that quote photo");
    }
  }

  async function analyze(demo = false) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demo,
          quoteText,
          imageBase64: image?.base64,
          mimeType: image?.mimeType ?? "image/jpeg",
          specs: vehicle.specs,
        }),
      });
      const payload = (await response.json()) as QuoteAnalysisResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Analysis failed");
      setResult(payload);
      setLastQuote(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <h3 className="font-display text-2xl uppercase tracking-wide">Drop the RO</h3>
        <p className="mt-1 text-sm text-aluminum">
          Photo of a handwritten or printed estimate, or paste the line items. We shrink the photo first so the upload
          does not die. Local reading works without an OpenAI key.
        </p>

        <div className="mt-4">
          <PhotoIntake
            label="Quote photo"
            hint="Choose, camera, drag, or paste. We convert to JPEG under 1 MB."
            alt="Uploaded repair estimate"
            busy={busy}
            onReady={(compressed) => void onQuotePhoto(compressed)}
            onError={setError}
          />
        </div>
        {ocrNote ? <p className="mt-2 text-sm text-ticket">{ocrNote}</p> : null}

        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Or paste line items</span>
          <textarea
            value={quoteText}
            onChange={(event) => setQuoteText(event.target.value)}
            rows={6}
            placeholder={"Cabin air filter $85\nTransmission flush $249\nOil change $129"}
            className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void analyze(false)}
            className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
          >
            {busy ? "Marking up…" : "Markup this ticket"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void analyze(true)}
            className="rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
          >
            Load demo padding
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-cone">{error}</p> : null}
      </div>

      {result ? <MarkedTicket result={result} /> : <EmptyTicket />}
    </div>
  );
}

function EmptyTicket() {
  return (
    <div className="ticket-paper flex min-h-[22rem] flex-col justify-between rounded-sm p-5 text-ticket-ink">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Repair order · customer copy</p>
      <p className="max-w-xs text-sm leading-6">
        The yellow copy is yours. After analysis, overpriced lines get a grease-pencil ring and a three-line script for
        the service writer.
      </p>
    </div>
  );
}

function MarkedTicket({ result }: { result: QuoteAnalysisResult }) {
  return (
    <div className="ticket-paper rounded-sm p-5 text-ticket-ink">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
            {result.shopName || "Repair order"} · customer copy
          </p>
          <h3 className="font-display text-3xl uppercase leading-none">
            {result.isQuoteFair ? "Mostly fair" : "Do not authorize yet"}
          </h3>
        </div>
        <span
          className={`font-mono text-[11px] uppercase tracking-wide ${result.isQuoteFair ? "text-fair" : "text-grease"}`}
        >
          {result.usedVisionModel ? "Vision parse" : "Price book"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6">{result.summary}</p>
      {result.laborRateEstimate ? (
        <p className="mt-2 font-mono text-xs uppercase tracking-wide">{result.laborRateEstimate}</p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {result.flaggedItems.map((item) => (
          <li
            key={`${item.item}-${item.quotedPrice}`}
            className={`rounded-sm p-3 ${item.category === "ok" ? "bg-black/5" : "grease-x bg-black/5"}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">{item.item}</p>
              <p className="font-mono text-sm">
                {item.quotedPrice != null ? `$${item.quotedPrice.toFixed(2)}` : "—"}
              </p>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wide opacity-70">Fair {item.fairPriceRange}</p>
            <p className="mt-1 text-sm">{item.warning}</p>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-black/15 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Mechanic-mode script</p>
        <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm leading-6">
          {result.mechanicScript.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em]">
          <Link href="/mechanic-mode" className="text-ticket-ink underline">
            Open printable mechanic-mode script
          </Link>
        </p>
      </div>
    </div>
  );
}
