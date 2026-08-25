import { runAdvocateRules } from "@/lib/agent/fallback";
import { completeAdvocateOpenAI, hasOpenAI, streamAdvocateOpenAI } from "@/lib/agent/openai";
import type { AgentImageKind, AgentRequestBody, AgentStatus, AgentWireMessage } from "@/lib/agent/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const IMAGE_KINDS: AgentImageKind[] = ["quote", "leak", "light"];
const MAX_IMAGE_CHARS = 1_200_000;

export async function GET() {
  const vision = hasOpenAI();
  const status: AgentStatus = {
    engine: vision ? "gpt-4o" : "rules",
    vision,
  };
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  let body: AgentRequestBody;
  try {
    body = (await request.json()) as AgentRequestBody;
  } catch {
    return NextResponse.json({ error: "Send JSON: messages[] and optional vehicle context." }, { status: 400 });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages.length) {
    return NextResponse.json({ error: "Send a message — a quote line, a noise, or a scanner code." }, { status: 400 });
  }

  const last = messages[messages.length - 1];
  if (last.role !== "user") {
    return NextResponse.json({ error: "The last message must be from you." }, { status: 400 });
  }
  if (!last.content && !last.image) {
    return NextResponse.json({ error: "Type a question or attach a quote, leak, or light photo." }, { status: 400 });
  }
  if (last.image && last.image.base64.length > MAX_IMAGE_CHARS) {
    return NextResponse.json({ error: "That photo is still too large. Compress it or describe what you see." }, { status: 413 });
  }

  const vehicle = body.vehicle
    ? {
        vin: trimField(body.vehicle.vin),
        year: trimField(body.vehicle.year),
        make: trimField(body.vehicle.make),
        model: trimField(body.vehicle.model),
        mileage: trimField(body.vehicle.mileage),
        concern: trimField(body.vehicle.concern) || last.content.slice(0, 160) || undefined,
      }
    : last.content
      ? { concern: last.content.slice(0, 160) }
      : undefined;

  const briefing = runAdvocateRules({
    messages,
    vehicle,
    hasVision: hasOpenAI() && Boolean(last.image),
  });

  const accept = request.headers.get("accept") ?? "";
  const wantJson = body.stream === false || (accept.includes("application/json") && !accept.includes("text/event-stream"));

  if (!hasOpenAI()) {
    return NextResponse.json(briefing);
  }

  try {
    if (wantJson) {
      return NextResponse.json(await completeAdvocateOpenAI({ messages, vehicle, briefing }));
    }
    return await streamAdvocateOpenAI({ messages, vehicle, briefing });
  } catch {
    return NextResponse.json(briefing);
  }
}

function trimField(value?: string): string | undefined {
  const next = value?.trim();
  return next ? next.slice(0, 80) : undefined;
}

function sanitizeMessages(raw: AgentRequestBody["messages"]): AgentWireMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-16).flatMap((row) => {
    if (!row || (row.role !== "user" && row.role !== "assistant")) return [];
    const content = typeof row.content === "string" ? row.content.slice(0, 8000) : "";
    const image = row.image?.base64
      ? {
          base64: row.image.base64,
          mimeType: /^image\/(jpeg|jpg|png|webp)$/i.test(row.image.mimeType) ? row.image.mimeType : "image/jpeg",
          kind: IMAGE_KINDS.includes(row.image.kind as AgentImageKind) ? (row.image.kind as AgentImageKind) : undefined,
        }
      : undefined;
    return [{ role: row.role, content, image }];
  });
}
