import { isValidVin, normalizeVin } from "@/lib/vin";
import type { SymptomNoise, SymptomWhen } from "@/lib/types";
import type { AgentImageKind } from "@/lib/agent/types";

export const DTC_RE = /\b([PCBU][0-3][0-9A-Fa-f]{3})\b/gi;
export const VIN_RE = /\b([A-HJ-NPR-Z0-9]{17})\b/g;
export const ZIP_RE = /\b(\d{5})(?:-\d{4})?\b/;

export function uniqueCodes(text: string): string[] {
  const found = [...text.matchAll(DTC_RE)].map((match) => match[1].toUpperCase());
  return [...new Set(found)];
}

export function extractVinCandidate(text: string): string | undefined {
  const matches = [...text.toUpperCase().matchAll(VIN_RE)].map((match) => normalizeVin(match[1]));
  return matches.find((vin) => isValidVin(vin));
}

export function extractZip(text: string): string | undefined {
  const match = text.match(ZIP_RE);
  return match?.[1];
}

export function detectFlush(text: string): "transmission" | "fuel" | "coolant" | "brake" | "power-steering" | "unknown" | null {
  if (!/flush|fuel[- ]system clean|injector clean|power[- ]steer/i.test(text)) return null;
  if (/trans/i.test(text)) return "transmission";
  if (/fuel|injector/i.test(text)) return "fuel";
  if (/coolant|radiator/i.test(text)) return "coolant";
  if (/brake fluid|brake flush/i.test(text)) return "brake";
  if (/power steer/i.test(text)) return "power-steering";
  if (/\bflush\b/i.test(text)) return "unknown";
  return null;
}

export function hasQuoteShape(text: string): boolean {
  if (/\$\s*\d/.test(text)) return true;
  if (/\b(quoted|estimate|repair order|\bRO\b|line item|they want)\b/i.test(text)) return true;
  return text.split(/\r?\n/).filter((line) => line.trim().length > 3).length >= 3 && /\d/.test(text);
}

export function detectSymptom(
  text: string,
  imageKind?: AgentImageKind,
): { noise: SymptomNoise; when: SymptomWhen; extras: { warningLight: boolean; leak: boolean; pull: boolean } } | null {
  const leak = imageKind === "leak" || /\bleak|puddle|drip|steam|hiss\b/i.test(text);
  const light = imageKind === "light" || /\bcheck engine|CEL\b|warning light|dash light|MIL\b/i.test(text);
  const pull = /\bpull[s]?\b|drifts|wanders/i.test(text);

  let noise: SymptomNoise | null = null;
  if (/\bsqueal|squeak|screech\b/i.test(text)) noise = "squeal";
  else if (/\bgrind/i.test(text)) noise = "grinding";
  else if (/\bclick/i.test(text)) noise = "clicking";
  else if (/\bthump|clunk\b/i.test(text)) noise = "thumping";
  else if (/\brumble|drone|hum\b/i.test(text)) noise = "rumble";
  else if (/\bhiss|whoosh\b/i.test(text) || leak) noise = "hiss";
  else if (light || pull) noise = "none";

  if (!noise) return null;

  let when: SymptomWhen = "always";
  if (/\bbrak/i.test(text)) when = "braking";
  else if (/\bturn|corner/i.test(text)) when = "turning";
  else if (/\baccel|throttle|gas pedal/i.test(text)) when = "accelerating";
  else if (/\bidle|parked|stopped\b/i.test(text)) when = "idling";
  else if (/\bhighway|freeway|speed\b/i.test(text)) when = "highway";
  else if (/\bcold start|morning|startup|start[- ]up\b/i.test(text)) when = "cold-start";

  return { noise, when, extras: { warningLight: light, leak, pull } };
}

export function wantsFluids(text: string): boolean {
  return /\b(oil spec|oil type|viscosity|coolant|tire psi|filter sku|capacity|what oil|which oil|fluid spec)\b/i.test(text);
}

export function wantsGuides(text: string): boolean {
  return /\b(how (do|to)|diy|guide|steps|replace|change the|tutorial)\b/i.test(text);
}

export function wantsDirectory(text: string): boolean {
  return /\b(shop near|find a shop|directory|independent|dealer near|zip)\b/i.test(text) || Boolean(extractZip(text));
}

export function wantsRecalls(text: string): boolean {
  return /\b(recalls?|campaigns?|safercar|nhtsa campaign|takata)\b/i.test(text);
}

export function wantsMpg(text: string): boolean {
  return /\b(mpg|fuel economy|gas mileage|liters per|l\/100)\b/i.test(text);
}

export function wantsPlaybooks(text: string): boolean {
  return /\b(playbook|lemon|pre-purchase|\bppi\b|used car|takata|air ?bag campaign)\b/i.test(text);
}

export function wantsRoTerm(text: string): boolean {
  return /\b(lof|mpi|r\s*&\s*r|\brr\b|shop supplies|ntf|glossary|while we.re in there|what does .{0,24} mean)\b/i.test(
    text,
  );
}

export function wantsParts(text: string): boolean {
  return /\b(rockauto|sku|part number|oil filter|cabin filter|air filter|where (do i|to) (buy|get)|search (for )?(pads?|rotors?|battery|plugs?))\b/i.test(
    text,
  );
}

export function flushProxyLine(flush: NonNullable<ReturnType<typeof detectFlush>>): string {
  switch (flush) {
    case "fuel":
      return "Fuel system flush $199";
    case "coolant":
      return "Coolant flush $189";
    case "brake":
      return "Brake fluid flush $149";
    case "power-steering":
      return "Power steering flush $149";
    default:
      return "Transmission flush $249";
  }
}
