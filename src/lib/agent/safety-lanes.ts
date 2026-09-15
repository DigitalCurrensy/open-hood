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
