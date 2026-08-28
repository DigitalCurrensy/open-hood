import { compactToolPayload, invokeAgentTool, type AgentToolResult } from "@/lib/agent/invoke";
import { systemPromptFor } from "@/lib/agent/prompt";
import { OPENAI_TOOL_SCHEMAS } from "@/lib/agent/tools";
import type {
  AgentFnName,
  AgentReadingLevel,
  AgentReply,
  AgentVehicleContext,
  AgentWireMessage,
} from "@/lib/agent/types";
import { AGENT_FN_NAMES } from "@/lib/agent/types";
import { formatVehicleBrief } from "@/lib/agent/vehicle";
import { hasOpenAI } from "@/lib/openai";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export { hasOpenAI };

type OpenAIMessage = Record<string, unknown>;

function isFnName(value: string): value is AgentFnName {
  return (AGENT_FN_NAMES as readonly string[]).includes(value);
}

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

function historyMessages(messages: AgentWireMessage[]): OpenAIMessage[] {
  return messages.slice(-12).map((message, index, all) => {
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
}

function groundingMessages(input: {
  vehicle?: AgentVehicleContext;
  briefing: AgentReply;
  readingLevel: AgentReadingLevel;
  toolResults: AgentToolResult[];
}): OpenAIMessage[] {
  return [
    { role: "system", content: systemPromptFor(input.readingLevel) },
    {
      role: "system",
      content: [
        `Vehicle context: ${formatVehicleBrief(input.vehicle)}`,
        `Reading level: ${input.readingLevel}`,
        input.toolResults.length
          ? `Tool facts (authoritative; do not contradict):\n${compactToolPayload(input.toolResults)}`
          : "No tools have run yet. Call a tool if the user gave a VIN, code, quote, noise, ZIP, recall, fluid, guide, or MPG question.",
        "Local briefing (stay consistent):\n" + input.briefing.text,
        input.briefing.scripts.length
          ? `Grounded counter lines:\n${input.briefing.scripts.map((line) => `- "${line}"`).join("\n")}`
          : "",
        `Suggested next desks: ${input.briefing.tools.map((tool) => tool.href).join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];
}

async function openaiChat(body: Record<string, unknown>): Promise<{
  content: string;
  toolCalls: Array<{ id: string; name: string; arguments: string }>;
}> {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`The advocate desk did not answer (${response.status}): ${detail.slice(0, 280)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
        tool_calls?: Array<{ id?: string; function?: { name?: string; arguments?: string } }>;
      };
    }>;
  };
  const message = payload.choices?.[0]?.message;
  const toolCalls = (message?.tool_calls ?? [])
    .map((call) => ({
      id: call.id ?? "",
      name: call.function?.name ?? "",
      arguments: call.function?.arguments ?? "{}",
    }))
    .filter((call) => call.id && call.name);

  return { content: message?.content ?? "", toolCalls };
}

export async function runOpenAIToolRound(input: {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  briefing: AgentReply;
  readingLevel: AgentReadingLevel;
  toolResults: AgentToolResult[];
  userText: string;
}): Promise<{ content: string; toolResults: AgentToolResult[]; vehicle?: AgentVehicleContext }> {
  const toolResults = [...input.toolResults];
  let vehicle = input.vehicle;
  const ran = new Set(toolResults.map((row) => row.invocation.name));
  const lastUser = [...input.messages].reverse().find((message) => message.role === "user");

  const first = await openaiChat({
    model: "gpt-4o",
    temperature: 0.2,
    max_tokens: 900,
    tools: OPENAI_TOOL_SCHEMAS,
    messages: [
      ...groundingMessages({
        vehicle,
        briefing: input.briefing,
        readingLevel: input.readingLevel,
        toolResults,
      }),
      ...historyMessages(input.messages),
    ],
  });

  if (!first.toolCalls.length) {
    return { content: first.content, toolResults, vehicle };
  }

  const assistantToolMessage: OpenAIMessage = {
    role: "assistant",
    content: first.content || null,
    tool_calls: first.toolCalls.map((call) => ({
      id: call.id,
      type: "function",
      function: { name: call.name, arguments: call.arguments },
    })),
  };
  const toolMessages: OpenAIMessage[] = [];

  for (const call of first.toolCalls.slice(0, 4)) {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(call.arguments) as Record<string, unknown>;
    } catch {
      args = {};
    }
    if (isFnName(call.name) && !ran.has(call.name)) {
      const result = await invokeAgentTool(call.name, args, {
        vehicle,
        userText: input.userText || lastUser?.content || "",
      });
      toolResults.push(result);
      ran.add(call.name);
      if (result.vehiclePatch) vehicle = { ...vehicle, ...result.vehiclePatch };
      toolMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify({ ok: result.invocation.ok, summary: result.invocation.summary, fact: result.fact, data: result.data }),
      });
    } else {
      const existing = toolResults.find((row) => row.invocation.name === call.name);
      toolMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(existing ? { ok: existing.invocation.ok, fact: existing.fact, data: existing.data } : { ok: false, error: "already ran" }),
      });
    }
  }

  const second = await openaiChat({
    model: "gpt-4o",
    temperature: 0.3,
    max_tokens: 900,
    messages: [
      ...groundingMessages({
        vehicle,
        briefing: input.briefing,
        readingLevel: input.readingLevel,
        toolResults,
      }),
      ...historyMessages(input.messages),
      assistantToolMessage,
      ...toolMessages,
    ],
  });

  return { content: second.content, toolResults, vehicle };
}

export async function completeAdvocateOpenAI(input: {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  briefing: AgentReply;
  readingLevel?: AgentReadingLevel;
  toolResults?: AgentToolResult[];
  userText?: string;
}): Promise<AgentReply> {
  const readingLevel = input.readingLevel ?? input.briefing.readingLevel;
  const round = await runOpenAIToolRound({
    messages: input.messages,
    vehicle: input.vehicle,
    briefing: input.briefing,
    readingLevel,
    toolResults: input.toolResults ?? [],
    userText: input.userText ?? "",
  });
  return mergeOpenAIReply(round.content, {
    ...input.briefing,
    invocations: round.toolResults.map((row) => row.invocation),
    facts: round.toolResults.map((row) => row.fact),
  });
}

export async function streamAdvocateOpenAI(input: {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  briefing: AgentReply;
  readingLevel?: AgentReadingLevel;
  toolResults?: AgentToolResult[];
}): Promise<Response> {
  const readingLevel = input.readingLevel ?? input.briefing.readingLevel;
  const toolResults = input.toolResults ?? [];
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
      messages: [
        ...groundingMessages({
          vehicle: input.vehicle,
          briefing: input.briefing,
          readingLevel,
          toolResults,
        }),
        ...historyMessages(input.messages),
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text();
    throw new Error(`The advocate desk did not answer (${upstream.status}): ${detail.slice(0, 280)}`);
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

      send({ type: "tools", invocations: briefing.invocations, facts: briefing.facts });

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
