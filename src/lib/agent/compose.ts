import { AGENT_VERIFY, type AgentReadingLevel, type AgentReply, type AgentVehicleContext } from "@/lib/agent/types";
import type { AgentToolResult } from "@/lib/agent/invoke";
import { pickTools } from "@/lib/agent/tools";
import { vehiclePhrase } from "@/lib/agent/vehicle";

export function composeFromTools(input: {
  results: AgentToolResult[];
  vehicle?: AgentVehicleContext;
  readingLevel: AgentReadingLevel;
  vision: AgentReply["vision"];
  photoNote?: string;
}): AgentReply {
  const ok = input.results.filter((row) => row.invocation.ok);
  const facts = input.results.map((row) => row.fact).filter(Boolean);
  const desks = input.results.flatMap((row) => row.desks);
  const car = vehiclePhrase(input.vehicle);
  const expert = input.readingLevel === "expert";

  const scripts = collectScripts(input.results, car, expert);
  const lead = expert
    ? `Facts first on ${car}. I ran ${ok.length || input.results.length} bay tool${ok.length === 1 ? "" : "s"} — I will not invent a torque spec or a factory hour on top of this.`
    : `Here is what I can prove on ${car}, then what to say at the counter. I will not invent a number you cannot verify.`;

  const body = expert
    ? facts.join("\n\n")
    : facts.map(shortenFact).join("\n\n");

  const closer = expert
    ? "Authorize the failed test, the millimeter reading, or the open VIN campaign. Freeze-frame (RPM, load, STFT/LTFT, ECT) beats a parts list. OEM vs aftermarket is a written part number, not a logo."
    : "Do not authorize from a menu. Ask for the test, then decide. Next desks are below.";

  const text = [input.photoNote, lead, body, closer].filter(Boolean).join("\n\n");

  return {
    text,
    scripts: scripts.slice(0, 4),
    tools: pickTools(...desks, "/expert"),
    facts: facts.slice(0, 8),
    invocations: input.results.map((row) => row.invocation),
    readingLevel: input.readingLevel,
    engine: "rules",
    vision: input.vision,
    verify: AGENT_VERIFY,
  };
}

function shortenFact(fact: string): string {
  if (fact.length <= 420) return fact;
  return `${fact.slice(0, 400).trim()}…`;
}

function collectScripts(results: AgentToolResult[], car: string, expert: boolean): string[] {
  const scripts: string[] = [];

  for (const row of results) {
    const data = row.data;
    const named = Array.isArray(data.scripts) ? data.scripts.map(String) : [];
    scripts.push(...named);

    if (row.invocation.name === "lookup_dtc" && typeof data.code === "string") {
      scripts.push(
        expert
          ? `The scanner stored ${data.code} on ${car}. Print freeze-frame — RPM, load, STFT/LTFT, ECT — and pending vs confirmed before you quote a part.`
          : `The scanner showed ${data.code} on ${car}. Please print the freeze-frame and tell me pending vs confirmed before you quote a part.`,
      );
      scripts.push("I want the test that failed — a graph, a leak location, or a measurement — not the code turned into a parts list.");
    }

    if (row.invocation.name === "analyze_quote_text") {
      scripts.push("Show me the manufacturer page that requires this flush or service at this mileage.");
      scripts.push("Measure rotors in millimeters next to the discard spec. I do not authorize from 'they're due.'");
    }

    if (row.invocation.name === "diagnose_symptoms" && Array.isArray(data.findings)) {
      for (const finding of data.findings.slice(0, 2)) {
        if (finding && typeof finding === "object" && "askTheShop" in finding) {
          scripts.push(String((finding as { askTheShop: string }).askTheShop));
        }
      }
    }

    if (row.invocation.name === "decode_vin" && typeof data.vin === "string") {
      scripts.push(`Please write VIN ${data.vin} on the RO and match it to the door sticker before you start.`);
    }

    if (row.invocation.name === "get_recalls") {
      scripts.push("Run this VIN for open campaigns. If a campaign is open, I want the remedy, not a related retail line.");
    }

    if (row.invocation.name === "search_directory") {
      scripts.push("Do you work on this make? What is the diagnostic fee in writing, and do you call before extras?");
    }

    if (row.invocation.name === "search_playbooks") {
      scripts.push("I want the measurement first — millimeters, PSI, or freeze-frame — then we talk parts.");
    }

    if (row.invocation.name === "lookup_ro_term") {
      scripts.push("What does that line mean in dollars on this RO? Shop supplies need a number.");
    }

    if (row.invocation.name === "search_parts") {
      scripts.push("VIN first. Write the brand and OEM vs aftermarket on the invoice line. I will not authorize 'equivalent' without a name.");
    }
  }

  if (!scripts.length) {
    scripts.push("I am not authorizing related repairs until you show the failed test and the number.");
    scripts.push("Please write part names, OEM numbers, and labor hours on the RO before you start.");
  }

  return [...new Set(scripts.filter((line) => line.length > 12 && line.length < 280))];
}

export function stampReply(
  reply: Omit<AgentReply, "readingLevel" | "facts" | "invocations"> & Partial<Pick<AgentReply, "facts" | "invocations">>,
  readingLevel: AgentReadingLevel,
  extras?: { facts?: string[]; invocations?: AgentReply["invocations"] },
): AgentReply {
  return {
    ...reply,
    facts: extras?.facts ?? reply.facts ?? [],
    invocations: extras?.invocations ?? reply.invocations ?? [],
    readingLevel,
  };
}
