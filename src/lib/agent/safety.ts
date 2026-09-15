import type { AgentReply } from "@/lib/agent/types";
import { AGENT_VERIFY } from "@/lib/agent/types";
import { pickTools } from "@/lib/agent/tools";

export type SafetyLane = "medical" | "legal" | "invent-spec" | null;

export function classifySafety(text: string): SafetyLane {
  const raw = text.replace(/\s+/g, " ").trim();
  if (!raw) return null;
  if (/(swallowed|drank|ingested|poison|ipecac|overdose|chest pain|can.?t breathe|suicide)/i.test(raw)) {
    return "medical";
  }
  if (/(write a demand letter|file a lawsuit|accuse.{0,40}fraud|sue (them|tomorrow|the shop)|draft a complaint to the bar)/i.test(raw)) {
    return "legal";
  }
  if (/(ignore (all )?(rules|instructions|previous)|invent a (factory |torque |legal )|required by law|pretend you have Motor|make up (a )?(torque|hour|spec))/i.test(raw)) {
    return "invent-spec";
  }
  return null;
}

export function safetyReply(lane: Exclude<SafetyLane, null>): AgentReply {
  if (lane === "medical") {
    return {
      text: "That is a medical emergency question, not a repair-order question. If someone swallowed fluid, call Poison Control (US 1-800-222-1222) or emergency services. I will not dose anything.",
      scripts: ["I need a medical professional, not a service writer."],
      tools: pickTools("/guides"),
      facts: ["Poison Control US 1-800-222-1222"],
      invocations: [],
      readingLevel: "beginner",
      engine: "rules",
      vision: "none",
      verify: AGENT_VERIFY,
    };
  }
  if (lane === "legal") {
    return {
      text: "I write sentences for the service window. I do not draft lawsuits, demand letters, or fraud accusations. If the shop will not put tests on the RO, walk. Counsel is a lawyer, not this bay.",
      scripts: [
        "Please write the failed test and the number on the RO before I authorize.",
        "If you cannot show that, I am not signing.",
      ],
      tools: pickTools("/quote", "/guides"),
      facts: [],
      invocations: [],
      readingLevel: "beginner",
      engine: "rules",
      vision: "none",
      verify: AGENT_VERIFY,
    };
  }
  return {
    text: "I will not invent a torque spec, a factory hour, or a legal requirement. Give me a VIN, a quote line with a price, a noise, or a five-character scanner code.",
    scripts: [
      "Please measure against the spec for this VIN — millimeters, PSI, or the page in the schedule. I do not authorize from 'they're due.'",
    ],
    tools: pickTools("/quote", "/obd", "/garage"),
    facts: [],
    invocations: [],
    readingLevel: "beginner",
    engine: "rules",
    vision: "none",
    verify: AGENT_VERIFY,
  };
}

export function scrubConcern(concern?: string): string | undefined {
  if (!concern) return undefined;
  if (classifySafety(concern)) return undefined;
  return concern.slice(0, 160);
}
