import {
  detectFlush,
  detectSymptom,
  extractVinCandidate,
  extractZip,
  hasQuoteShape,
  uniqueCodes,
  wantsDirectory,
  wantsFluids,
  wantsGuides,
  wantsMpg,
  wantsParts,
  wantsPlaybooks,
  wantsRecalls,
  wantsRoTerm,
} from "@/lib/agent/detect";
import type { AgentFnCall, AgentImageKind, AgentVehicleContext } from "@/lib/agent/types";
import { isValidVin, normalizeVin } from "@/lib/vin";

export function routeToolCalls(input: {
  text: string;
  vehicle?: AgentVehicleContext;
  imageKind?: AgentImageKind;
}): AgentFnCall[] {
  const text = input.text.trim();
  const calls: AgentFnCall[] = [];
  const seen = new Set<string>();

  const push = (name: AgentFnCall["name"], args: Record<string, unknown> = {}) => {
    const key = `${name}:${JSON.stringify(args)}`;
    if (seen.has(key)) return;
    seen.add(key);
    calls.push({ name, args });
  };

  const vin = extractVinCandidate(text) || (input.vehicle?.vin && isValidVin(normalizeVin(input.vehicle.vin))
    ? normalizeVin(input.vehicle.vin)
    : undefined);

  const codes = uniqueCodes(text);
  for (const code of codes.slice(0, 3)) {
    push("lookup_dtc", { code });
  }

  const askedDecode = /\b(decode|what (year|car|vehicle)|identify)\b/i.test(text) || Boolean(extractVinCandidate(text));
  if (vin && (askedDecode || extractVinCandidate(text))) {
    push("decode_vin", { vin });
  }

  const flush = detectFlush(text);
  const quote = hasQuoteShape(text) || Boolean(flush) || input.imageKind === "quote";
  if (quote && (flush || /flush|cleaner|service|filter|labor|rotor|pad|quoted|estimate/i.test(text) || input.imageKind === "quote")) {
    const zip = extractZip(text);
    push("analyze_quote_text", { text: text || "Quoted line items", ...(zip ? { zip } : {}) });
  }

  const symptom = detectSymptom(text, input.imageKind);
  if (symptom && !codes.length) {
    push("diagnose_symptoms", {
      noise: symptom.noise,
      when: symptom.when,
      warningLight: symptom.extras.warningLight,
      leak: symptom.extras.leak,
      pull: symptom.extras.pull,
    });
  }

  const hasYmm = Boolean(input.vehicle?.year && input.vehicle.make && input.vehicle.model) || Boolean(extractVinCandidate(text));

  if (wantsFluids(text) || (vin && askedDecode)) {
    push("get_fluids_for_vehicle");
  }

  if (wantsRecalls(text) || (vin && askedDecode)) {
    push("get_recalls");
  }

  if (wantsMpg(text) && hasYmm) {
    push("get_epa_mpg");
  }

  if (flush || wantsGuides(text)) {
    const q = flush ? `${flush} flush` : text.slice(0, 80);
    push("search_guides", { q });
  }

  if (wantsDirectory(text)) {
    const zip = extractZip(text);
    const type = /dealer/i.test(text)
      ? "dealers"
      : /tire/i.test(text)
        ? "tires"
        : /parts/i.test(text)
          ? "parts"
          : /body|collision/i.test(text)
            ? "body"
            : "repair";
    push("search_directory", { zip: zip ?? text.slice(0, 40), type });
  }

  if (wantsPlaybooks(text)) {
    push("search_playbooks", { q: text.slice(0, 80) });
  }

  if (wantsRoTerm(text)) {
    push("lookup_ro_term", { q: text.slice(0, 80) });
  }

  if (wantsParts(text) && !wantsDirectory(text)) {
    push("search_parts", { part: text.slice(0, 80) });
  }

  return calls.slice(0, 6);
}
