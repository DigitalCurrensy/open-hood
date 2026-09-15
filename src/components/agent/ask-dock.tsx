"use client";

import { EngineChip } from "@/components/agent/engine-chip";
import { QUICK_PROMPTS } from "@/lib/agent/tools";
import type { AgentReply } from "@/lib/agent/types";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DockMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function newId() {
  return `ask-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AskDock() {
  const pathname = usePathname();
  const [vehicle] = useIdentifiedVehicle();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<DockMessage[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  const hide = pathname === "/" || pathname === "/agent" || pathname.startsWith("/agent/");

  const chip = useMemo(() => {
    if (!vehicle) return "No car yet — identify first, or just ask.";
    return [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ");
  }, [vehicle]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setBusy(true);
      setError("");
      setDraft("");
      const user: DockMessage = { id: newId(), role: "user", text: content };
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
        const payload = (await response.json()) as AgentReply & { error?: string; text?: string };
        if (!response.ok) throw new Error(payload.error || "Ask did not answer.");
        const answer = payload.text?.trim() || "I could not write a sentence for that. Try the ticket page.";
        setMessages((prev) => prev.map((row) => (row.id === pendingId ? { ...row, text: answer } : row)));
      } catch (err) {
        setMessages((prev) => prev.filter((row) => row.id !== pendingId && row.id !== user.id));
        setDraft(content);
        setError(err instanceof Error ? err.message : "Ask did not answer.");
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, vehicle],
  );

  if (hide) return null;

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-4 sm:p-6">
      {open ? (
        <section className="pointer-events-auto flex max-h-[min(34rem,78vh)] w-full max-w-md flex-col overflow-hidden rounded-sm border border-ticket/40 bg-bay shadow-[0_24px_80px_rgba(0,0,0,0.45)]" aria-label="Ask Open Hood">
          <header className="flex items-start justify-between gap-3 border-b border-white/10 bg-bay-2 px-4 py-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Ask</p>
              <p className="font-display text-2xl uppercase leading-none text-fluorescent">What should I say?</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-aluminum">{chip}</p>
              <div className="mt-2"><EngineChip /></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:text-ticket">Close</button>
          </header>
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
            {messages.length === 0 ? (
              <p className="text-sm leading-6 text-aluminum">Ask about oil, a scanner code, or a line on the estimate.</p>
            ) : null}
            {messages.map((row) => (
              <p key={row.id} className={`text-sm leading-6 ${row.role === "user" ? "text-ticket" : "text-fluorescent"}`}>
                {row.text || (busy ? "Writing…" : "")}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-4 py-2">
            {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
              <button key={prompt.label} type="button" disabled={busy} onClick={() => void send(prompt.text)} className="rounded-sm border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-aluminum hover:border-ticket/50 hover:text-fluorescent disabled:opacity-50">
                {prompt.label}
              </button>
            ))}
          </div>
          <form className="border-t border-white/10 p-3" onSubmit={(event) => { event.preventDefault(); void send(draft); }}>
            <label className="block">
              <span className="sr-only">Ask a question</span>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} placeholder="They quoted a cabin filter…" className="w-full rounded-sm border border-white/15 bg-bay-2 px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40" />
            </label>
            {error ? <p className="mt-2 text-xs text-cone">{error}</p> : null}
            <button type="submit" disabled={busy} className="mt-2 w-full rounded-sm bg-ticket px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50">
              {busy ? "Writing…" : "Ask"}
            </button>
          </form>
        </section>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-sm bg-ticket px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ticket-ink shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          Ask
        </button>
      )}
    </div>
  );
}
