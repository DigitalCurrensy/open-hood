import { ADVOCATE_SYSTEM_PROMPT } from "@/lib/agent/prompt";
import type { AgentReply, AgentVehicleContext, AgentWireMessage } from "@/lib/agent/types";
import { formatVehicleBrief } from "@/lib/agent/vehicle";
import { hasOpenAI } from "@/lib/openai";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export { hasOpenAI };

export function extractScripts(text: string, fallback: string[]): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const grabbed: string[] = [];
  let inScript = false;
  for (const line of lines) {
    if (/say this|at the counter|counter script/i.test(line) && line.length < 80) {
      inScript = true;
      continue;
    }
    if (inScript && /^(verify|next|do not|don't|tool)/i.test(line)) break;
    const quoted = line.match(/^[-*•\d.)]+\s*[“"](.+?)[”"]\s*$/) ?? line.match(/^[“"](.+?)[”"]\s*$/);
    if (quoted?.[1]) {
      grabbed.push(quoted[1].trim());
      continue;
    }
    if (inScript && /^[-*•\d.)]+\s+/.test(line)) {
      grabbed.push(line.replace(/^[-*•\d.)]+\s+/, "").replace(/^["“]|["”]$/g, "").trim());
    }
  }

  const unique = [...new Set(grabbed.filter((line) => line.length > 12 && line.length < 280))];
  return (unique.length ? unique : fallback).slice(0, 4);
}

export function mergeOpenAIReply(modelText: string, briefing: AgentReply): AgentReply {
  const text = modelText.trim() || briefing.text;
  return {
    ...briefing,
    text,
    scripts: extractScripts(text, briefing.scripts),
    engine: "gpt-4o",
    vision: briefing.vision === "none" ? "none" : "used",
  };
}

function openaiMessages(input: {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  briefing: AgentReply;
}) {
  const history = input.messages.slice(-12).map((message, index, all) => {
    const last = index === all.length - 1 && message.role === "user";
    if (last && message.image?.base64) {
      const mime = message.image.mimeType || "image/jpeg";
      return {
        role: "user" as const,
        content: [
          { type: "text" as const, text: message.content || "Please look at this photo. Stay cautious. Do not invent specs." },
          {
            type: "image_url" as const,
            image_url: { url: `data:${mime};base64,${message.image.base64}` },
          },
        ],
      };
    }
    return { role: message.role, content: message.content || "(photo attached)" };
  });

  return [
    { role: "system" as const, content: ADVOCATE_SYSTEM_PROMPT },
    {
      role: "system" as const,
      content: [
        `Vehicle context: ${formatVehicleBrief(input.vehicle)}`,
        "Local AutoShield briefing (stay consistent; do not invent numbers that contradict this):",
        input.briefing.text,
        input.briefing.scripts.length ? `Grounded counter lines:\n${input.briefing.scripts.map((line) => `- "${line}"`).join("\n")}` : "",
        `Suggested next desks: ${input.briefing.tools.map((tool) => tool.href).join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    ...history,
  ];
}

export async function completeAdvocateOpenAI(input: {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  briefing: AgentReply;
}): Promise<AgentReply> {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 900,
      messages: openaiMessages(input),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${detail.slice(0, 280)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return mergeOpenAIReply(payload.choices?.[0]?.message?.content ?? "", input.briefing);
}

export async function streamAdvocateOpenAI(input: {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  briefing: AgentReply;
}): Promise<Response> {
  const upstream = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 900,
      stream: true,
      messages: openaiMessages(input),
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text();
    throw new Error(`OpenAI error ${upstream.status}: ${detail.slice(0, 280)}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const { briefing } = input;
  const reader = upstream.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      let full = "";
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const rows = buffer.split("\n");
          buffer = rows.pop() ?? "";
          for (const row of rows) {
            const line = row.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                full += delta;
                send({ type: "delta", text: delta });
              }
            } catch {
              // skip a torn JSON chunk
            }
          }
        }
        send({ type: "done", reply: mergeOpenAIReply(full, briefing) });
        controller.close();
      } catch {
        send({ type: "done", reply: briefing });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
