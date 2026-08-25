"use client";

import { AdvocateBrief, UserScrap } from "@/components/agent/advocate-message";
import { PageHeader } from "@/components/page-header";
import { compressAgentImage, revokePreview, type CompressedAgentImage } from "@/lib/agent/image";
import { QUICK_PROMPTS } from "@/lib/agent/tools";
import { clearThread, loadMileage, loadThread, newMessageId, saveMileage, saveThread, type AgentUiMessage } from "@/lib/agent/thread";
import { AGENT_DISCLAIMER, type AgentImageKind, type AgentReply, type AgentWireMessage } from "@/lib/agent/types";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const IMAGE_KINDS: Array<{ id: AgentImageKind; label: string }> = [
  { id: "quote", label: "Quote" },
  { id: "leak", label: "Leak" },
  { id: "light", label: "Light" },
];

export function AdvocateDesk() {
  const [vehicle] = useIdentifiedVehicle();
  const [messages, setMessages] = useState<AgentUiMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");
  const [mileage, setMileage] = useState("");
  const [imageKind, setImageKind] = useState<AgentImageKind>("quote");
  const [image, setImage] = useState<CompressedAgentImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const chip = useMemo(() => {
    if (!vehicle) return null;
    const title = [vehicle.specs.year, vehicle.specs.make, vehicle.specs.model].filter(Boolean).join(" ");
    return { title, vin: vehicle.specs.vin };
  }, [vehicle]);

  useEffect(() => {
    // localStorage is window-only; hydrate after mount.
    queueMicrotask(() => {
      setMessages(loadThread());
      setMileage(loadMileage());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) saveThread(messages);
  }, [hydrated, messages]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const attachFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError("");
      try {
        const next = await compressAgentImage(file, imageKind);
        setImage((prev) => {
          revokePreview(prev?.previewUrl);
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not attach that photo.");
      }
    },
    [imageKind],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (busy) return;
      if (!content && !image) {
        setError("Type a question or attach a quote, leak, or light photo.");
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: AgentUiMessage = {
        id: newMessageId(),
        role: "user",
        content,
        imageKind: image?.kind,
        previewUrl: image?.previewUrl,
      };
      const assistantId = newMessageId();
      const pending: AgentUiMessage = { id: assistantId, role: "assistant", content: "" };

      setBusy(true);
      setError("");
      setDraft("");
      setStreamingId(assistantId);
      setMessages((prev) => [...prev, userMsg, pending]);

      const history = [...messages, userMsg];
      const wire: AgentWireMessage[] = history.map((row) => ({
        role: row.role,
        content: row.content,
        image:
          row.id === userMsg.id && image
            ? { base64: image.base64, mimeType: image.mimeType, kind: image.kind }
            : undefined,
      }));

      const vehicleContext = vehicle
        ? {
            vin: vehicle.specs.vin,
            year: vehicle.specs.year,
            make: vehicle.specs.make,
            model: vehicle.specs.model,
            mileage: mileage.trim() || undefined,
            concern: content.slice(0, 160) || undefined,
          }
        : mileage.trim()
          ? { mileage: mileage.trim(), concern: content.slice(0, 160) || undefined }
          : content
            ? { concern: content.slice(0, 160) }
            : undefined;

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream, application/json",
          },
          body: JSON.stringify({ messages: wire, vehicle: vehicleContext }),
          signal: controller.signal,
        });

        const type = response.headers.get("content-type") ?? "";
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || "The advocate window did not answer.");
        }

        if (type.includes("text/event-stream") && response.body) {
          await readSse(response.body, (delta) => {
            setMessages((prev) =>
              prev.map((row) => (row.id === assistantId ? { ...row, content: row.content + delta } : row)),
            );
          }, (reply) => {
            setMessages((prev) =>
              prev.map((row) =>
                row.id === assistantId ? { ...row, content: reply.text, reply } : row,
              ),
            );
          });
        } else {
          const reply = (await response.json()) as AgentReply & { error?: string };
          if (reply.error) throw new Error(reply.error);
          setMessages((prev) =>
            prev.map((row) => (row.id === assistantId ? { ...row, content: reply.text, reply } : row)),
          );
        }
        setImage(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setMessages((prev) => prev.filter((row) => row.id !== assistantId && row.id !== userMsg.id));
        setDraft(content);
        setError(err instanceof Error ? err.message : "The advocate window did not answer.");
      } finally {
        setBusy(false);
        setStreamingId(null);
      }
    },
    [busy, image, messages, mileage, vehicle],
  );

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col gap-5">
      <PageHeader kicker="Window 02 · advocate" title="Say it at the window">
        A master mechanic in your corner — not the shop&apos;s. Ask about a quote, a noise, or a scanner code before you
        authorize.
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <VehicleChip chip={chip} mileage={mileage} onMileage={setMileage} />
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">
          Standing orders · measurements beat adjectives
        </p>
        {hydrated && messages.length ? (
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort();
              for (const row of messages) revokePreview(row.previewUrl);
              revokePreview(image?.previewUrl);
              setImage(null);
              clearThread();
              setMessages([]);
              setError("");
            }}
            className="ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:text-ticket"
          >
            New brief
          </button>
        ) : null}
      </div>

      <div
        ref={scroller}
        className="flex min-h-[22rem] flex-1 flex-col gap-4 overflow-y-auto rounded-sm border border-white/10 bg-bay/50 p-4"
        aria-live="polite"
      >
        {hydrated && messages.length === 0 ? <EmptyWindow /> : null}
        {messages.map((message) =>
          message.role === "user" ? (
            <UserScrap key={message.id} message={message} />
          ) : (
            <AdvocateBrief key={message.id} message={message} streaming={streamingId === message.id && !message.reply} />
          ),
        )}
      </div>

      <form
        className="rounded-sm border border-white/10 bg-bay-2/80 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
        onPaste={(event) => {
          const file = [...event.clipboardData.items]
            .find((item) => item.type.startsWith("image/"))
            ?.getAsFile();
          if (file) {
            event.preventDefault();
            void attachFile(file);
          }
        }}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              disabled={busy}
              onClick={() => void send(prompt.text)}
              className="rounded-sm border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum hover:border-ticket/50 hover:text-fluorescent disabled:opacity-50"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="sr-only">Ask the advocate</span>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(draft);
              }
            }}
            rows={3}
            placeholder="They quoted a flush… it squeals when I brake… scanner says P0420…"
            className="w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40"
          />
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <fieldset>
              <legend className="font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">
                Optional photo · quote / leak / light
              </legend>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {IMAGE_KINDS.map((kind) => (
                  <label
                    key={kind.id}
                    className={`cursor-pointer rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
                      imageKind === kind.id ? "border-ticket bg-ticket text-ticket-ink" : "border-white/10 text-aluminum"
                    }`}
                  >
                    <input
                      type="radio"
                      name="image-kind"
                      className="sr-only"
                      checked={imageKind === kind.id}
                      onChange={() => setImageKind(kind.id)}
                    />
                    {kind.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="inline-flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:text-fluorescent">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  void attachFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              {image ? "Replace photo" : "Attach photo"}
            </label>
            {image ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum">
                {image.kind} · {Math.round(image.bytes / 1024)} kb compressed
                <button
                  type="button"
                  className="ml-2 text-cone hover:text-ticket"
                  onClick={() => {
                    revokePreview(image.previewUrl);
                    setImage(null);
                  }}
                >
                  Remove
                </button>
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
          >
            {busy ? "Writing the brief…" : "Ask the bay"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-cone">{error}</p> : null}
      </form>

      <p className="text-center font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-aluminum">
        {AGENT_DISCLAIMER}
      </p>
    </div>
  );
}

function VehicleChip({
  chip,
  mileage,
  onMileage,
}: {
  chip: { title: string; vin: string } | null;
  mileage: string;
  onMileage: (value: string) => void;
}) {
  return (
    <div className="jamb-sticker flex flex-wrap items-center gap-3 rounded-sm px-3 py-2">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-black/55">On the hook</p>
        <p className="font-display text-lg uppercase leading-none text-black">
          {chip ? chip.title : "No car stamped"}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wide text-black/60">
          {chip?.vin ? `VIN · ${chip.vin.slice(-8)}` : chip ? "No VIN stamped — door jamb still wins" : "Identify on the bay to pin a VIN"}
        </p>
      </div>
      <label className="block">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/55">Miles if you know</span>
        <input
          value={mileage}
          onChange={(event) => {
            const next = event.target.value.replace(/[^\d,]/g, "");
            onMileage(next);
            saveMileage(next);
          }}
          inputMode="numeric"
          placeholder="86400"
          className="mt-0.5 w-24 rounded-sm border border-black/15 bg-white/70 px-2 py-1 font-mono text-sm text-black"
        />
      </label>
    </div>
  );
}

function EmptyWindow() {
  return (
    <div className="m-auto max-w-lg text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">Service writer&apos;s window</p>
      <h2 className="mt-2 font-display text-3xl uppercase text-fluorescent">I&apos;m in your corner</h2>
      <p className="mt-3 text-sm leading-6 text-aluminum">
        Stamp a prompt below or type what they quoted. I write the sentences for the counter. I do not invent torque
        specs, and I will not tell you a job is legally required.
      </p>
    </div>
  );
}

async function readSse(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
  onDone: (reply: AgentReply) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  while (!finished) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part
        .split("\n")
        .map((row) => row.trim())
        .find((row) => row.startsWith("data:"));
      if (!line) continue;
      try {
        const event = JSON.parse(line.slice(5).trim()) as { type?: string; text?: string; reply?: AgentReply };
        if (event.type === "delta" && event.text) onDelta(event.text);
        if (event.type === "done" && event.reply) {
          onDone(event.reply);
          finished = true;
        }
      } catch {
        // ignore a torn event
      }
    }
  }
}
