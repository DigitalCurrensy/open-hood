import type { AgentReply } from "@/lib/agent/types";
import { AGENT_VERIFY } from "@/lib/agent/types";
import { pickTools } from "@/lib/agent/tools";

export type SafetyLane = "medical" | "legal" | "invent-spec" | "crime" | "card" | null;

export function classifySafety(text: string): SafetyLane {
  const raw = text.replace(/\s+/g, " ").trim();
  if (!raw) return null;
  if (/(swallowed|drank|ingested|poison|ipecac|overdose|chest pain|can.?t breathe|suicide|kill myself)/i.test(raw)) {
    return "medical";
  }
  if (/(write a demand letter|file a lawsuit|accuse.{0,40}fraud|sue (them|tomorrow|the shop)|draft a complaint to the bar)/i.test(raw)) {
    return "legal";
  }
  if (/(ignore (all )?(rules|instructions|previous)|invent a (factory |torque |legal )|required by law|pretend you have Motor|make up (a )?(torque|hour|spec))/i.test(raw)) {
    return "invent-spec";
  }
  if (/(how (do i|to) (steal|clone|forge) (a )?(car|vin|title)|bypass immobilizer to steal|chip the ecu to clone)/i.test(raw)) {
    return "crime";
  }
  if (/(credit card|card number|cvv|ssn|social security)\s*[:#]?\s*\d{3}/i.test(raw)) {
    return "card";
  }
  return null;
}

export function safetyReply(lane: Exclude<SafetyLane, null>): AgentReply {
  if (lane === "medical") {
    return base(
      "That is a medical emergency question, not a repair-order question. If someone swallowed fluid, call Poison Control (US 1-800-222-1222) or emergency services. I will not dose anything.",
      ["I need a medical professional, not a service writer."],
      ["Poison Control US 1-800-222-1222"],
    );
  }
  if (lane === "legal") {
    return base(
      "I write sentences for the service window. I do not draft lawsuits, demand letters, or fraud accusations. If the shop will not put tests on the RO, walk.",
      ["Please write the failed test and the number on the RO before I authorize."],
    );
  }
  if (lane === "crime") {
    return base(
      "I will not help steal a car, clone a VIN, or forge a title. If this is your car, stamp the VIN and ask a legal question at the window.",
      ["This is my VIN. Please write the work against this number only."],
    );
  }
  if (lane === "card") {
    return base(
      "Do not paste card numbers, CVVs, or Social Security numbers here. There is no checkout. Delete that text.",
      ["I am not paying from this screen. Write the test on the RO."],
    );
  }
  return base(
    "I will not invent a torque spec, a factory hour, or a legal requirement. Give me a VIN, a quote line with a price, a noise, or a five-character scanner code.",
    ["Please measure against the spec for this VIN. I do not authorize from 'they're due.'"],
  );
}

function base(text: string, scripts: string[], facts: string[] = []): AgentReply {
  return {
    text,
    scripts,
    tools: pickTools("/quote", "/guides"),
    facts,
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
