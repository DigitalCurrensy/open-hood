import { composeFromTools } from "@/lib/agent/compose";
import { runAdvocateRules } from "@/lib/agent/fallback";
import { invokeToolPlan, type AgentToolResult } from "@/lib/agent/invoke";
import { completeAdvocateOpenAI, hasOpenAI, streamAdvocateOpenAI } from "@/lib/agent/openai";
import { routeToolCalls } from "@/lib/agent/router";
import { classifySafety, safetyReply } from "@/lib/agent/safety";
import { spokenQuoteLines } from "@/lib/agent/spoken-quote";
import type { AgentReadingLevel, AgentReply, AgentVehicleContext, AgentWireMessage } from "@/lib/agent/types";

export interface AgentRunInput {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  readingLevel: AgentReadingLevel;
  stream?: boolean;
  wantJson?: boolean;
}

function lastUser(messages: AgentWireMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user");
}

function mergeVehicle(base: AgentVehicleContext | undefined, results: AgentToolResult[]): AgentVehicleContext | undefined {
  const patch = results.reduce<AgentVehicleContext>((acc, row) => ({ ...acc, ...row.vehiclePatch }), {});
  if (!base && !Object.keys(patch).length) return undefined;
  return { ...base, ...patch };
}

function photoNote(hasVision: boolean, last?: AgentWireMessage): string | undefined {
  if (!last?.image) return undefined;
  if (hasVision) return undefined;
  const label = last.image.kind === "quote" ? "repair order" : last.image.kind === "leak" ? "leak or puddle" : "dash light";
  return last.content
    ? `I cannot see that ${label} photo in this bay — I still ran the text tools.`
    : `I cannot see that ${label} photo in this bay. Describe the colors, words, and numbers.`;
}

function redact(message: string): string {
  return message.replace(/sk-[a-zA-Z0-9_-]+/g, "[key]").replace(/Bearer\s+\S+/gi, "Bearer [key]").slice(0, 180);
}

function withFallbackNote(briefing: AgentReply, error: unknown): AgentReply {
  const reason = error instanceof Error ? redact(error.message) : "model call failed";
  console.error("[open-hood.agent] openai fallback", reason);
  return {
    ...briefing,
    verify: `${briefing.verify} Model fallback — typed tools answered. ${reason}`,
  };
}

async function prepare(input: AgentRunInput): Promise<{
  briefing: AgentReply;
  toolResults: AgentToolResult[];
  vehicle?: AgentVehicleContext;
  last?: AgentWireMessage;
  sealed: boolean;
}> {
  const last = lastUser(input.messages);
  const raw = last?.content ?? "";
  const text = spokenQuoteLines(raw);
  const lane = classifySafety(raw);
  if (lane) {
    return { briefing: safetyReply(lane), toolResults: [], vehicle: input.vehicle, last, sealed: true };
  }

  const hasVision = hasOpenAI() && Boolean(last?.image);
  let vehicle = input.vehicle;
  const plan = routeToolCalls({ text, vehicle, imageKind: last?.image?.kind });
  const toolResults = await invokeToolPlan(plan, { vehicle, userText: text });
  vehicle = mergeVehicle(vehicle, toolResults);

  const vision: AgentReply["vision"] = last?.image ? (hasVision ? "used" : "unavailable") : "none";
  const routedMessages =
    last && text !== raw
      ? input.messages.map((row) => (row === last ? { ...row, content: text } : row))
      : input.messages;

  const briefing = toolResults.length
    ? composeFromTools({
        results: toolResults,
        vehicle,
        readingLevel: input.readingLevel,
        vision,
        photoNote: photoNote(hasVision, last),
      })
    : runAdvocateRules({
        messages: routedMessages,
        vehicle,
        hasVision,
        readingLevel: input.readingLevel,
      });

  return { briefing, toolResults, vehicle, last, sealed: false };
}

export async function answerAgent(input: AgentRunInput): Promise<AgentReply> {
  const prepared = await prepare(input);
  if (prepared.sealed || !hasOpenAI()) return prepared.briefing;
  try {
    return await completeAdvocateOpenAI({
      messages: input.messages,
      vehicle: prepared.vehicle,
      briefing: prepared.briefing,
      readingLevel: input.readingLevel,
      toolResults: prepared.toolResults,
      userText: lastUser(input.messages)?.content ?? "",
    });
  } catch (error) {
    return withFallbackNote(prepared.briefing, error);
  }
}

export async function streamOrAnswerAgent(input: AgentRunInput): Promise<Response | AgentReply> {
  const prepared = await prepare(input);
  if (prepared.sealed || !hasOpenAI() || input.wantJson) {
    if (prepared.sealed || !hasOpenAI()) return prepared.briefing;
    try {
      return await completeAdvocateOpenAI({
        messages: input.messages,
        vehicle: prepared.vehicle,
        briefing: prepared.briefing,
        readingLevel: input.readingLevel,
        toolResults: prepared.toolResults,
        userText: prepared.last?.content ?? "",
      });
    } catch (error) {
      return withFallbackNote(prepared.briefing, error);
    }
  }

  try {
    return await streamAdvocateOpenAI({
      messages: input.messages,
      vehicle: prepared.vehicle,
      briefing: prepared.briefing,
      readingLevel: input.readingLevel,
      toolResults: prepared.toolResults,
    });
  } catch (error) {
    return withFallbackNote(prepared.briefing, error);
  }
}
