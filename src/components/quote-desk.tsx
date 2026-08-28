"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PrintFindingsButton } from "@/components/report/print-findings-button";
import { type CompressedImage } from "@/components/media-capture";
import { PhotoIntake } from "@/components/photo-intake";
import { recognizeQuotePhoto } from "@/lib/ocr-local";
import {
  asQuoteDefense,
  DARK_HOURS_STAMP,
  extractQuoteLinesFromOcr,
  VISION_OFF_STAMP,
  VISION_ON_STAMP,
  visionStamp,
  type LineRole,
  type QuoteDefenseResult,
  type QuoteHoursStamp,
  type TicketFlag,
} from "@/lib/quote";
import { readBayItem, writeBayItem } from "@/lib/bay-storage";
import type { FlaggedQuoteItem, IdentifiedVehicle, QuoteAnalysisResult } from "@/lib/types";
import { useLastQuote, useQuoteHistory } from "@/lib/vehicle-session";
import "@/app/quote/quote.css";

const ZIP_SESSION_KEY = "openhood.zip";
const DEFAULT_ZIP = "90210";

function readSessionZip(): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("zip") ?? "";
    const urlDigits = fromUrl.replace(/\D/g, "").slice(0, 5);
    if (urlDigits.length === 5) return urlDigits;
    const stored = readBayItem(ZIP_SESSION_KEY) ?? "";
    const storedDigits = stored.replace(/\D/g, "").slice(0, 5);
    if (storedDigits.length === 5) return storedDigits;
  } catch {
    // private mode / SSR
  }
  return "";
}

function writeSessionZip(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  if (digits.length !== 5) return;
  writeBayItem(ZIP_SESSION_KEY, digits);
}

function subscribeZip(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getZipSnapshot() {
  return readSessionZip();
}

function getZipServerSnapshot() {
  return "";
}

export function QuoteDesk({ vehicle }: { vehicle: IdentifiedVehicle }) {
  const [, setLastQuote] = useLastQuote();
  const quoteHistory = useQuoteHistory();
  const [quoteText, setQuoteText] = useState("");
  const storedZip = useSyncExternalStore(subscribeZip, getZipSnapshot, getZipServerSnapshot);
  const [zip, setZip] = useState("");
  const zipValue = zip || storedZip || DEFAULT_ZIP;
  const [image, setImage] = useState<CompressedImage | null>(null);
  const [result, setResult] = useState<QuoteDefenseResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ocrNote, setOcrNote] = useState("");
  const [cloudOcr, setCloudOcr] = useState(false);
  const [visionDeskStamp, setVisionDeskStamp] = useState(VISION_OFF_STAMP);
  const [hoursDesk, setHoursDesk] = useState<QuoteHoursStamp>({
    source: "typical",
    stamp: DARK_HOURS_STAMP,
    licensed: false,
    catalogIds: [],
  });

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/ocr", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/quote", { cache: "no-store" }).then((response) => response.json()),
    ])
      .then(([ocr, quote]: [{ available?: boolean; stamp?: string }, { hours?: QuoteHoursStamp }]) => {
        if (cancelled) return;
        setCloudOcr(Boolean(ocr.available));
        setVisionDeskStamp(ocr.stamp ?? visionStamp(Boolean(ocr.available)));
        if (quote.hours?.stamp) setHoursDesk(quote.hours);
      })
      .catch(() => {
        if (cancelled) return;
        setCloudOcr(false);
        setVisionDeskStamp(VISION_OFF_STAMP);
        setHoursDesk({ source: "typical", stamp: DARK_HOURS_STAMP, licensed: false, catalogIds: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function applyQuoteText(cleaned: string, note: string) {
    const extracted = extractQuoteLinesFromOcr(cleaned);
    if (!extracted) return false;
    setQuoteText((current) => (current.trim() ? `${current.trim()}\n${extracted}` : extracted));
    setOcrNote(note);
    return true;
  }

  async function onQuotePhoto(compressed: CompressedImage) {
    setImage(compressed);
    setError("");
    try {
      if (cloudOcr) {
        setOcrNote(`${VISION_ON_STAMP}…`);
        try {
          const response = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: compressed.base64,
              mimeType: compressed.mimeType,
              kind: "quote",
            }),
          });
          const body = (await response.json()) as {
            text?: string;
            usedCloud?: boolean;
            error?: string;
            stamp?: string;
            engine?: string;
          };
          if (body.usedCloud && applyQuoteText(body.text ?? "", `${body.stamp ?? VISION_ON_STAMP}. Pulled lines. Still check the dollars.`)) {
            return;
          }
          if (body.usedCloud && body.error) {
            setOcrNote(`${body.error} Trying Tesseract next. ${VISION_OFF_STAMP}`);
          }
        } catch {
          setOcrNote(`Vision missed. Trying Tesseract… ${VISION_OFF_STAMP}`);
        }
      } else {
        setOcrNote(`${VISION_OFF_STAMP} Reading on this device. Same packed-LOF engine as paste.`);
      }

      const read = await recognizeQuotePhoto(compressed.dataUrl);
      const cleaned = read.text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 2)
        .join("\n");
      const confidenceBit =
        read.confidence != null ? ` Device confidence ${Math.round(read.confidence)}%.` : "";
      let extracted = extractQuoteLinesFromOcr(cleaned);
      try {
        const parsed = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "quote", text: cleaned }),
        });
        const body = (await parsed.json()) as { text?: string; usedCloud?: boolean };
        if (!body.usedCloud && body.text) extracted = body.text;
      } catch {
        // local extract already in hand
      }
      if (applyQuoteText(extracted, `${VISION_OFF_STAMP}${confidenceBit} Dollars and job names still go through the same engine as paste.`)) {
        return;
      }
      setOcrNote(`${VISION_OFF_STAMP}${confidenceBit} No dollars landed — type the line items.`);
    } catch (err) {
      setOcrNote(VISION_OFF_STAMP);
      setError(err instanceof Error ? err.message : "Could not read that quote photo");
    }
  }

  async function analyze(demo = false) {
    setBusy(true);
    setError("");
    writeSessionZip(zipValue);
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demo,
          quoteText,
          zip: zipValue,
          imageBase64: image?.base64,
          mimeType: image?.mimeType ?? "image/jpeg",
          specs: vehicle.specs,
        }),
      });
      const payload = (await response.json()) as QuoteAnalysisResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Analysis failed");
      const defense = asQuoteDefense(payload);
      setResult(defense);
      setLastQuote(defense);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="desk-tap grid gap-4 md:grid-cols-2">
      <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <h3 className="font-display text-2xl uppercase tracking-wide">Drop the RO</h3>
        <p className="mt-1 text-sm text-aluminum">
          Photo of a handwritten or printed estimate, or paste the line items. ZIP picks an independent vs dealer hour
          band. Hours stay {DARK_HOURS_STAMP} unless a Motor or Mitchell extract answers. We shrink the photo first so
          the upload does not die.
        </p>
        <p className="quote-hours-stamp" data-licensed={hoursDesk.licensed ? "true" : "false"}>
          {hoursDesk.stamp}
        </p>
        <p className="quote-vision-stamp" data-on={cloudOcr ? "true" : "false"}>
          {visionDeskStamp}
        </p>

        <div className="mt-4">
          <PhotoIntake
            label="Quote photo"
            stamp={cloudOcr ? `${VISION_ON_STAMP} · usedCloud` : `${VISION_OFF_STAMP} · Tesseract, not vision`}
            hint={
              cloudOcr
                ? "Choose, camera, drag, or paste. We convert to JPEG, then OpenAI vision reads the RO (usedCloud:true). Tesseract is the lottery fallback if vision misses — we still parse $."
                : "Choose, camera, drag, or paste. We convert to JPEG, boost contrast, and run Tesseract (PSM). That is a lottery, not vision. Dollars still parse. Paste the RO if the scan is junk."
            }
            alt="Uploaded repair estimate"
            busy={busy}
            image={image}
            onReady={(compressed) => void onQuotePhoto(compressed)}
            onClear={() => setImage(null)}
            onError={setError}
          />
        </div>
        {ocrNote ? <p className="mt-2 text-sm text-ticket">{ocrNote}</p> : null}
      {quoteHistory[1] ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">
          Last ticket on this phone: {quoteHistory[1].shopName || "unnamed shop"}
          {quoteHistory[1].totalQuoted != null ? ` · $${quoteHistory[1].totalQuoted.toFixed(0)}` : ""} ·{" "}
          {quoteHistory[1].flaggedCount} flagged. {DARK_HOURS_STAMP} — a second opinion from the last markup.
        </p>
      ) : null}

        <label className="mt-4 block max-w-[8rem]">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Shop ZIP</span>
          <input
            name="zip"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={zipValue}
            onChange={(event) => {
              const next = event.target.value.replace(/\D/g, "").slice(0, 5);
              setZip(next);
              writeSessionZip(next);
            }}
            placeholder={DEFAULT_ZIP}
            className="mt-2 min-h-11 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Or paste line items</span>
          <textarea
            value={quoteText}
            onChange={(event) => setQuoteText(event.target.value)}
            rows={6}
            placeholder={"Cabin air filter $85\nBrake pads $420\nShop supplies 8%\nCoolant flush $189"}
            className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void analyze(false)}
            className="min-h-11 rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
          >
            {busy ? "Marking up…" : "Markup this ticket"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void analyze(true)}
            className="min-h-11 rounded-sm border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-fluorescent disabled:opacity-50"
          >
            Load demo padding
          </button>
          <PrintFindingsButton
            extras={result ? { quote: result, vehicle } : { vehicle }}
            className="min-h-11 rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
          />
        </div>
        {error ? <p className="mt-3 text-sm text-cone">{error}</p> : null}
      </div>

      {result ? <MarkedTicket result={result} previous={quoteHistory[1]} /> : <EmptyTicket />}
    </div>
  );
}

function EmptyTicket() {
  return (
    <div className="ticket-paper flex min-h-[22rem] flex-col justify-between rounded-sm p-5 text-ticket-ink">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Repair order · customer copy</p>
      <p className="max-w-xs text-sm leading-6">
        The yellow copy is yours. Book hits get a grease-pencil ring. Unmatched lines stay a heuristic miss. A packed
        LOF menu — cabin, flush, induction, nitrogen, supplies as a percent — gets its own decline stamp.{" "}
        {DARK_HOURS_STAMP}.
      </p>
    </div>
  );
}

function asTicket(item: FlaggedQuoteItem): TicketFlag {
  const extra = item as TicketFlag;
  return {
    ...item,
    bookHit: extra.bookHit !== false && extra.matchKind !== "miss",
    matchKind: extra.matchKind ?? (extra.bookHit === false ? "miss" : "regex"),
    script: extra.script,
    role: extra.role ?? "parts",
    asks: extra.asks ?? [],
    jobSlug: extra.jobSlug,
  };
}

function matchStamp(item: TicketFlag): string {
  if (!item.bookHit || item.matchKind === "miss") return "Heuristic miss";
  if (item.hoursSource && item.hoursSource !== "typical" && item.hoursStamp) return item.hoursStamp;
  if (item.matchKind === "catalog") return `Book hit · ${DARK_HOURS_STAMP}`;
  if (item.matchKind === "hours") return "Book hit · ZIP hour band";
  return "Book hit · regex";
}

function roleStamp(role: LineRole): string {
  if (role === "diagnostic") return "Diag";
  if (role === "supplies") return "Supplies";
  if (role === "sublet") return "Sublet";
  if (role === "labor") return "Labor";
  return "Parts";
}

function MarkedTicket({
  result,
  previous,
}: {
  result: QuoteDefenseResult;
  previous?: { shopName: string | null; totalQuoted: number | null; flaggedCount: number; summary: string };
}) {
  const defense = asQuoteDefense(result);
  const lines = defense.flaggedItems.map(asTicket);
  const hits = defense.book.hits;
  const misses = defense.book.misses;
  const bundle = defense.bundle;

  return (
    <div className="ticket-paper rounded-sm p-5 text-ticket-ink">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
            {defense.shopName || "Repair order"} · customer copy
          </p>
          <h3 className="font-display text-3xl uppercase leading-none">
            {defense.isQuoteFair ? "Mostly fair" : "Do not authorize yet"}
          </h3>
        </div>
        <span
          className={`font-mono text-[11px] uppercase tracking-wide ${defense.isQuoteFair ? "text-fair" : "text-grease"}`}
        >
          {defense.usedVisionModel ? "Vision marked this up" : defense.hours.licensed ? defense.hours.stamp : DARK_HOURS_STAMP}
        </span>
      </div>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">{defense.hours.stamp}</p>
      <p className="mt-3 text-sm leading-6">{defense.summary}</p>
      <div className="quote-hit-ledger">
        <p data-tone="hit">
          Book hit · {hits}
          <span className="mt-1 block font-sans text-[12px] font-normal normal-case tracking-normal opacity-80">
            {defense.hours.licensed
              ? `${defense.hours.stamp}. Regex and packed-LOF flags stay ours.`
              : `${DARK_HOURS_STAMP}. Regex match is not a licensed hour.`}
          </span>
        </p>
        <p data-tone="miss">
          Heuristic miss · {misses}
          <span className="mt-1 block font-sans text-[12px] font-normal normal-case tracking-normal opacity-80">
            Unmatched line. Paste a clearer job name if the scan garbled it.
          </span>
        </p>
      </div>
      {previous && previous.summary !== defense.summary ? (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">
          Versus last ticket
          {previous.shopName ? ` · ${previous.shopName}` : ""}
          {previous.totalQuoted != null ? ` · $${previous.totalQuoted.toFixed(0)}` : ""} · {previous.flaggedCount} flagged
        </p>
      ) : null}
      {defense.laborRateEstimate ? (
        <p className="mt-2 font-mono text-xs uppercase tracking-wide">{defense.laborRateEstimate}</p>
      ) : null}

      {bundle?.packed ? (
        <div className="quote-bundle" data-severity={bundle.severity}>
          {bundle.severity === "decline" ? <span className="quote-decline-stamp">Decline</span> : null}
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Packed service</p>
          <h4 className="mt-1 max-w-[16rem] font-display text-2xl uppercase leading-none text-ticket">
            {bundle.title}
          </h4>
          <p className="mt-2 max-w-prose text-sm leading-6 text-fluorescent">{bundle.say}</p>
          <div className="quote-pack-stamps">
            {bundle.members.map((member) => (
              <span key={member.key} data-on={member.present ? "true" : "false"}>
                {member.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {defense.flags.length ? (
        <ul className="mt-3 space-y-1">
          {defense.flags.map((flag) => (
            <li key={flag.id} className="font-mono text-[11px] uppercase tracking-[0.12em] opacity-80">
              {flag.id} · {flag.severity}
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="mt-4 space-y-3">
        {lines.map((item) => (
          <li
            key={`${item.item}-${item.quotedPrice}-${item.matchKind}`}
            className={`rounded-sm p-3 ${item.category === "ok" && item.bookHit ? "bg-black/5" : "grease-x bg-black/5"}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">{item.item}</p>
              <p className="font-mono text-sm">
                {item.quotedPrice != null ? `$${item.quotedPrice.toFixed(2)}` : "—"}
              </p>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide opacity-70">
              <span className="quote-role">{roleStamp(item.role)}</span>
              <span>
                {item.bookHit ? "Book hit" : "Heuristic miss"} · {matchStamp(item)} · Fair {item.fairPriceRange}
              </span>
            </p>
            <p className="mt-1 text-sm">{item.warning}</p>
          </li>
        ))}
      </ul>

      {defense.asks.length ? (
        <div className="quote-ask-board">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Ask the counter</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">
            From say-if-high and the job ask list — one authorization at a time
          </p>
          <ol className="mt-2 list-decimal space-y-3 pl-4 text-sm leading-6">
            {defense.asks.map((ask) => (
              <li key={`${ask.item}-${ask.jobSlug ?? "line"}`}>
                <span className="font-semibold">{ask.item}</span>
                <ul className="mt-1 list-disc pl-4">
                  {ask.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="mt-5 border-t border-black/15 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Mechanic-mode script</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">
          From {defense.hours.stamp} when a line hits
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm leading-6">
          {defense.mechanicScript.map((line) => (
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
