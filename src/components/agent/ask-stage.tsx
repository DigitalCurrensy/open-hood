"use client";

import { EngineChip } from "@/components/agent/engine-chip";
import { QUICK_PROMPTS } from "@/lib/agent/tools";
import type { AgentReply } from "@/lib/agent/types";
import { DEMO_VIN, DEMO_VIN_LABEL } from "@/lib/seo";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface StageMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  scripts?: string[];
}

function newId() {
  return `ask-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AskStage() {
  const [vehicle] = useIdentifiedVehicle();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<StageMessage[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  const chip = useMemo(() => {
    if (!vehicle) return null;
    return [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ");
  }, [vehicle]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setBusy(true);
      setError("");
      setDraft("");
      setCopied(false);
      const user: StageMessage = { id: newId(), role: "user", text: content };
      const pendingId = newId();
      setMessages((prev) => [...prev, user, { id: pendingId, role: "assistant", text: "" }]);

      const vehicleContext = vehicle
        ? {
            vin: vehicle.specs.vin,
            year: vehicle.specs.year,
            make: vehicle.specs.make,
            model: vehicle.specs.model,
            concern: content.slice(0, 160),
          }
        : { concern: content.slice(0, 160) };

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            messages: [...messages, user].map((row) => ({ role: row.role, content: row.text })),
            vehicle: vehicleContext,
            readingLevel: "beginner",
          }),
        });
        const payload = (await response.json()) as AgentReply & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Ask did not answer.");
        const answer = payload.text?.trim() || "I could not write a sentence for that.";
        setMessages((prev) =>
          prev.map((row) =>
            row.id === pendingId
              ? { ...row, text: answer, scripts: payload.scripts?.filter(Boolean).slice(0, 3) }
              : row,
          ),
        );
      } catch (err) {
        setMessages((prev) => prev.filter((row) => row.id !== pendingId && row.id !== user.id));
        setDraft(content);
        setError(err instanceof Error ? err.message : "Ask did not answer.");
      } finally {
        setBusy(false);
        box.current?.focus();
      }
    },
    [busy, messages, vehicle],
  );

  const lastScripts = [...messages].reverse().find((row) => row.scripts?.length)?.scripts ?? [];

  return (
    <section id="ask" aria-labelledby="ask-heading" className="overflow-hidden rounded-sm border-2 border-ticket bg-bay-2">
      <header className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">Ask before you authorize</p>
          <h2 id="ask-heading" className="mt-1 font-display text-4xl uppercase leading-none text-fluorescent sm:text-5xl">
            Ask
          </h2>
          <p id="ask-help" className="mt-2 max-w-xl text-sm leading-6 text-aluminum">
            Quote line, noise, or scanner code. Three sentences for the window. We do not book a shop.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <EngineChip />
            <p className="font-mono text-[10px] uppercase tracking-wide text-aluminum">
              {chip ? `On the hook · ${chip}` : "No car yet — Ask still works"}
            </p>
          </div>
        </div>
        {chip ? null : (
          <Link
            href={`/?vin=${DEMO_VIN}#ask`}
            className="inline-flex min-h-11 items-center rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket-ink"
          >
            Load demo · {DEMO_VIN_LABEL}
          </Link>
        )}
      </header>

      <div ref={scroller} className="min-h-[10rem] max-h-[22rem] space-y-3 overflow-y-auto px-4 py-4 sm:px-6" aria-live="polite">
        {messages.length === 0 ? (
          <p className="text-sm leading-6 text-aluminum">
            Try: “They quoted $89 for a cabin filter.” or “What oil does this take?”
          </p>
        ) : null}
        {messages.map((row) => (
          <article key={row.id} className={row.role === "user" ? "text-ticket" : "text-fluorescent"}>
            <p className="text-sm leading-6">{row.text || (busy ? "Writing…" : "")}</p>
            {row.scripts?.length ? (
              <ol className="ticket-paper mt-3 space-y-2 rounded-sm p-3 text-ticket-ink">
                {row.scripts.map((line, index) => (
                  <li key={line} className="text-sm leading-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-70">{index + 1}. </span>
                    {line}
                  </li>
                ))}
              </ol>
            ) : null}
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-4 py-3 sm:px-6">
        <button
          type="button"
          disabled={busy}
          onClick={() => void send("They quoted $89 for a cabin filter")}
          className="rounded-sm bg-ticket px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ticket-ink disabled:opacity-50"
        >
          $89 cabin filter
        </button>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            type="button"
            disabled={busy}
            onClick={() => void send(prompt.text)}
            className="min-h-11 rounded-sm border border-white/15 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-aluminum hover:border-ticket/50 hover:text-fluorescent disabled:opacity-50"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <form
        className="border-t border-white/10 p-4 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <label htmlFor="ask-box" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          Your question
        </label>
        <textarea
          id="ask-box"
          ref={box}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send(draft);
            }
          }}
          rows={3}
          aria-describedby="ask-help ask-privacy"
          placeholder="They quoted $89 for a cabin filter…"
          className="w-full rounded-sm border border-ticket/50 bg-bay px-3 py-3 text-base text-fluorescent placeholder:text-aluminum/40"
        />
        {error ? (
          <p role="alert" className="mt-2 text-sm text-cone">
            {error}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-ticket px-4 py-3 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-ticket-ink disabled:opacity-50"
          >
            {busy ? "Writing…" : "Ask"}
          </button>
          {lastScripts.length ? (
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(lastScripts.join("\n"));
                setCopied(true);
              }}
              className="inline-flex min-h-12 items-center rounded-sm border border-ticket/50 px-4 py-3 font-mono text-sm uppercase tracking-[0.16em] text-ticket"
            >
              {copied ? "Copied" : "Copy the three lines"}
            </button>
          ) : null}
        </div>
        <p id="ask-privacy" className="mt-3 text-xs leading-5 text-aluminum">
          Stays on this phone unless you attach a photo and a vision key is live. No account.
        </p>
      </form>
    </section>
  );
}
