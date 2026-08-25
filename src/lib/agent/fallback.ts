import { AGENT_VERIFY, type AgentImageKind, type AgentReply, type AgentVehicleContext, type AgentWireMessage } from "@/lib/agent/types";
import { pickTools } from "@/lib/agent/tools";
import { formatVehicleBrief, specsFromContext, thisVehicle, vehiclePhrase } from "@/lib/agent/vehicle";
import { lookupDtc } from "@/lib/dtc";
import { analyzeQuoteText } from "@/lib/quote";
import { diagnoseSymptoms } from "@/lib/symptoms";
import type { SymptomNoise, SymptomWhen } from "@/lib/types";

const DTC_RE = /\b([PCBU][0-3][0-9A-Fa-f]{3})\b/gi;

export function runAdvocateRules(input: {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  hasVision: boolean;
}): AgentReply {
  const last = [...input.messages].reverse().find((message) => message.role === "user");
  const prior = [...input.messages]
    .reverse()
    .filter((message) => message.role === "user")
    .slice(1, 3)
    .map((message) => message.content)
    .join("\n");

  const image = last?.image;
  const imageKind = image?.kind;
  const lastText = (last?.content ?? "").trim();
  const followUp =
    lastText.length > 0 &&
    lastText.length < 48 &&
    /^(yes|no|ok|and|what|they|say|script|please|how much)\b/i.test(lastText);
  const text = (followUp ? [lastText, prior].filter(Boolean).join("\n") : lastText).trim();
  const car = vehiclePhrase(input.vehicle);
  const specs = specsFromContext(input.vehicle);
  const vision: AgentReply["vision"] = image ? (input.hasVision ? "used" : "unavailable") : "none";

  const codes = uniqueCodes(text);
  const flush = detectFlush(text);
  const looksLikeQuote = hasQuoteShape(text) || Boolean(imageKind === "quote" && text);
  const symptom = detectSymptom(text, imageKind);
  const dealer = /\bdealer[- ]only\b|\bonly (the )?dealer\b|\bwarranty\b|\brecall\b|\bcertified\b|\bprogramming\b|\bmodule (flash|reflash)\b/i.test(
    text,
  );
  const wantsScript = /\bwhat (do|should) i say\b|\bscript\b|\bsay (this|that|to them)\b|\bthey (said|insist|told)\b/i.test(
    last?.content ?? "",
  );

  const photoNote = photoLine(imageKind, input.hasVision, Boolean(text));

  if (codes.length) {
    return withMeta(dtcBrief(codes, car, input.vehicle), vision, photoNote);
  }

  if (flush || (looksLikeQuote && /flush|cleaner|service|filter|labor|rotor|pad/i.test(text))) {
    return withMeta(quoteOrFlushBrief(text, flush, car, specs, input.vehicle), vision, photoNote);
  }

  if (imageKind === "quote" && !text) {
    return withMeta(quotePhotoOnly(car, input.hasVision), vision, photoNote);
  }

  if (symptom) {
    return withMeta(symptomBrief(symptom, car, specs), vision, photoNote);
  }

  if (imageKind === "leak") {
    return withMeta(leakBrief(car), vision, photoNote);
  }

  if (imageKind === "light") {
    return withMeta(lightBrief(car), vision, photoNote);
  }

  if (dealer) {
    return withMeta(dealerBrief(car, input.vehicle), vision, photoNote);
  }

  if (wantsScript) {
    return withMeta(genericScript(car), vision, photoNote);
  }

  return withMeta(generalBrief(text, car, input.vehicle), vision, photoNote);
}

function withMeta(reply: Omit<AgentReply, "engine" | "vision" | "verify">, vision: AgentReply["vision"], photoNote: string): AgentReply {
  const text = photoNote ? `${photoNote}\n\n${reply.text}` : reply.text;
  return {
    ...reply,
    text,
    engine: "rules",
    vision,
    verify: AGENT_VERIFY,
  };
}

function photoLine(kind: AgentImageKind | undefined, hasVision: boolean, hasText: boolean): string {
  if (!kind) return "";
  if (hasVision) return "";
  const label = kind === "quote" ? "repair order" : kind === "leak" ? "leak or puddle" : "dash light";
  if (hasText) {
    return `I cannot see that ${label} photo in this bay — describe the colors, words, and numbers you see, and I will keep working from that.`;
  }
  return `I cannot see that ${label} photo in this bay. Describe it in a sentence (color, where it is, any printed prices or codes) and I will work from your eyes.`;
}

function uniqueCodes(text: string): string[] {
  const found = [...text.matchAll(DTC_RE)].map((match) => match[1].toUpperCase());
  return [...new Set(found)];
}

function detectFlush(text: string): "transmission" | "fuel" | "coolant" | "brake" | "power-steering" | "unknown" | null {
  if (!/flush|fuel[- ]system clean|injector clean|power[- ]steer/i.test(text)) return null;
  if (/trans/i.test(text)) return "transmission";
  if (/fuel|injector/i.test(text)) return "fuel";
  if (/coolant|radiator/i.test(text)) return "coolant";
  if (/brake fluid|brake flush/i.test(text)) return "brake";
  if (/power steer/i.test(text)) return "power-steering";
  if (/\bflush\b/i.test(text)) return "unknown";
  return null;
}

function hasQuoteShape(text: string): boolean {
  if (/\$\s*\d/.test(text)) return true;
  if (/\b(quoted|estimate|repair order|\bRO\b|line item|they want)\b/i.test(text)) return true;
  return text.split(/\r?\n/).filter((line) => line.trim().length > 3).length >= 3 && /\d/.test(text);
}

function detectSymptom(
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

function dtcBrief(codes: string[], car: string, vehicle?: AgentVehicleContext): Omit<AgentReply, "engine" | "vision" | "verify"> {
  const blocks = codes.slice(0, 3).map((code) => {
    const hit = lookupDtc(code);
    if (!hit.valid) {
      return `${code} is not a standard five-character OBD layout. Recheck the scanner printout — letter P/C/B/U plus four characters.`;
    }
    if (hit.entry) {
      return [
        `${hit.entry.code} — ${hit.entry.title}.`,
        hit.entry.plainEnglish,
        `Typical first looks: ${hit.entry.typicalCause}. Shop band if the test actually fails: ${hit.entry.costBand}.`,
        hit.entry.askTheShop,
      ].join(" ");
    }
    const generic = hit.generic;
    return `${code} is a real ${generic?.system ?? "module"} code (${generic?.subsystem ?? "unspecified"}). ${generic?.hint ?? ""} Ask the shop to print the factory title and the freeze-frame (RPM, load, coolant temp when it set) before you approve parts.`;
  });

  const primary = codes[0];
  const scripts = [
    `The scanner showed ${primary} on ${car}. Please print the freeze-frame and tell me pending vs confirmed before you quote a part.`,
    "I want the test that failed — a graph, a leak location, or a measurement — not the code turned into a parts list.",
    "Do not replace the catalytic converter, a pack of coils, or a module from the code number alone.",
  ];

  if (vehicle?.mileage) {
    const who = thisVehicle(vehicle);
    scripts.push(`${who.charAt(0).toUpperCase()}${who.slice(1)} shows about ${vehicle.mileage} miles. Still verify any campaign or interval against the VIN, not a menu.`);
  }

  return {
    text: [
      `A code is a pointer, not a repair order. On ${car}, ${primary} does not mean "buy the expensive part first."`,
      blocks.join("\n\n"),
      "If the light is flashing, that is a misfire-while-driving warning — ease it to a shop, do not floor it. A steady amber light is usually 'soon,' not 'leave it on the shoulder,' unless the car is overheating, leaking, or will not stay running.",
    ].join("\n\n"),
    scripts: scripts.slice(0, 4),
    tools: pickTools("/obd", "/symptoms", "/quote"),
  };
}

function quoteOrFlushBrief(
  text: string,
  flush: ReturnType<typeof detectFlush>,
  car: string,
  specs: ReturnType<typeof specsFromContext>,
  vehicle?: AgentVehicleContext,
): Omit<AgentReply, "engine" | "vision" | "verify"> {
  const proxy = flush ? `${text}\n${flushProxyLine(flush)}` : text;
  const analysis = analyzeQuoteText(proxy || "Cabin air filter $85", specs);
  const mapped = analysis.flaggedItems.filter((item) => item.item !== "Unparsed estimate");
  const problems = mapped.filter((item) => item.category !== "ok");
  const flags = (problems.length ? problems : mapped)
    .slice(0, 4)
    .map((item) => {
      const price = item.quotedPrice != null ? ` at $${item.quotedPrice.toFixed(2)}` : "";
      return `${item.item}${price} — ${item.warning} Typical band: ${item.fairPriceRange}.`;
    })
    .join("\n\n");

  const flushTalk = flush
    ? flushTalking(flush, car, vehicle)
    : `I marked the lines I can map on ${car}. Paste every part + price if a line is missing.`;
  const scripts = analysis.mechanicScript.slice(0, 4);
  const summary = mapped.length
    ? analysis.summary
    : "I could not map those words to a known job. Paste each line as part + price, or tell me the noise or the scanner code.";

  return {
    text: [
      flushTalk,
      flags,
      summary,
      `Do not authorize a flush, cleaner, or "while we're in there" line because someone said it is due. Due is not a millimeter reading and it is not a page I will invent in the maintenance schedule.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    scripts,
    tools: pickTools("/quote", "/guides", "/directory"),
  };
}

function flushProxyLine(flush: NonNullable<ReturnType<typeof detectFlush>>): string {
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

function flushTalking(
  flush: ReturnType<typeof detectFlush>,
  car: string,
  vehicle?: AgentVehicleContext,
): string {
  const miles = vehicle?.mileage ? ` at about ${vehicle.mileage} miles` : "";
  if (flush === "fuel") {
    return `A bottled fuel-system or injector "flush"${miles} is a menu item on ${car} until a test says otherwise — trims, rail pressure, or a misfire isolate. Ask what failed before you buy shop-priced additive.`;
  }
  if (flush === "coolant") {
    return `A coolant flush machine is not the same as "the coolant is the wrong type or is rusty." On ${car}${miles}, ask for color, oil-in-coolant, and the factory fill on the under-hood label. A thermostat or a leak is a different job.`;
  }
  if (flush === "brake") {
    return `Brake fluid is hygroscopic and does age — that is real. A "$99 flush special" is still not a measurement. Ask them to test water content or show the fluid color, and to use the spec on the cap (DOT 3 vs 4). I will not invent the interval.`;
  }
  if (flush === "power-steering") {
    return `Power-steering fluid services get sold next to rack leaks. If the rack is dry and quiet, ask why a flush is the repair. If it is leaking, the fluid is not the fix.`;
  }
  return `A pressurized transmission flush is not the same as a drain-and-fill. Many factories specify drain-and-fill — or a sealed unit — on ${car}${miles}. The page in the maintenance schedule decides, not the service writer's pad. I will not invent that page.`;
}

function quotePhotoOnly(car: string, hasVision: boolean): Omit<AgentReply, "engine" | "vision" | "verify"> {
  const lead = hasVision
    ? `You attached a repair-order photo for ${car}. I will only mark lines I can actually read.`
    : `You attached a repair-order photo for ${car}. Paste the lines you can read: part name and price, one per line.`;
  return {
    text: [
      lead,
      "Classic padding: cabin filter at shop labor, fuel or trans flush with no failed test, throttle-body 'service,' and rotors 'due' with no millimeter reading.",
      "Authorize nothing extra until the old part is named and the test is written on the RO.",
    ].join("\n\n"),
    scripts: [
      `Please write each line as part + price on ${car}. I will hold anything that is not on that list.`,
      "Show me the manufacturer page that requires a flush at this mileage.",
      "Measure the rotors in millimeters next to the discard spec. I do not authorize from 'they're due.'",
    ],
    tools: pickTools("/quote", "/guides", "/directory"),
  };
}

function symptomBrief(
  symptom: NonNullable<ReturnType<typeof detectSymptom>>,
  car: string,
  specs: ReturnType<typeof specsFromContext>,
): Omit<AgentReply, "engine" | "vision" | "verify"> {
  const findings = diagnoseSymptoms(symptom.noise, symptom.when, symptom.extras, specs);
  const body = findings
    .map((finding) => {
      const odds = finding.likelihood === "likely" ? "Likely" : finding.likelihood === "possible" ? "Possible" : "Needs a test";
      const english = finding.plainEnglish.replace(/\bon a your car\b/gi, "on this vehicle");
      return `${odds}: ${finding.title}. ${english} ${finding.askTheShop}`;
    })
    .join("\n\n");

  const scripts = findings.slice(0, 3).map((finding) => finding.askTheShop);
  if (scripts.length < 3) {
    scripts.push("Authorize a diagnostic hour with a written conclusion. Do not pre-approve related repairs.");
  }

  return {
    text: [
      `On ${car}, we map the sound and the moment — we do not throw a parts catalog at you.`,
      body,
      "If it becomes grinding under the pedal, a flashing check-engine light, or a hot, sweet-smelling steam leak, that is 'get it looked at before a long trip' — still not a blank check on the RO.",
    ].join("\n\n"),
    scripts: scripts.slice(0, 4),
    tools: pickTools("/symptoms", "/obd", "/quote"),
  };
}

function leakBrief(car: string): Omit<AgentReply, "engine" | "vision" | "verify"> {
  return {
    text: [
      `Color and location beat a guess on ${car}. Green, orange, or pink is often coolant. Red can be transmission or power steering. Brown-black is oil. Clear and oily near the condenser can be A/C dye. Water under the A/C drip is usually just condensate.`,
      "A hiss plus steam is coolant until a pressure test says otherwise. 'The cooling system needs a flush' is not a leak location.",
      "Tell me: color, front/middle/rear of the car, and whether it shows up after sitting overnight or only after a drive.",
    ].join("\n\n"),
    scripts: [
      "Please pressure-test the cooling system and name the leaking fitting — not 'the radiator system needs a flush.'",
      "I want the test PSI and a photo of the wet part before I authorize a hose, a radiator, or a water pump.",
    ],
    tools: pickTools("/symptoms", "/guides", "/directory"),
  };
}

function lightBrief(car: string): Omit<AgentReply, "engine" | "vision" | "verify"> {
  return {
    text: [
      `A light on ${car} is a color and a behavior, not a part. Amber check-engine is usually stored codes. Flashing check-engine is a misfire in progress. Red oil or temp is 'shut it down and check the gauge / dipstick' — I am not diagnosing a spun bearing from a photo.`,
      "Any $20 OBD-II scanner will print a five-character code. Type that code here or on the OBD desk. Do not authorize a catalytic converter, a coil pack, or a 'tune-up' from the icon alone.",
    ].join("\n\n"),
    scripts: [
      "Please read the codes and print the freeze-frame before you quote a part.",
      "Is the light steady or flashing? I will not approve a converter from the icon.",
    ],
    tools: pickTools("/obd", "/symptoms", "/quote"),
  };
}

function dealerBrief(car: string, vehicle?: AgentVehicleContext): Omit<AgentReply, "engine" | "vision" | "verify"> {
  const vinLine = vehicle?.vin
    ? `This VIN (${vehicle.vin}) is what the dealer uses for campaigns. Ask them to run it — not a year/model guess.`
    : "Stamp the VIN on the bay first so a dealer can run campaigns against the actual car.";
  return {
    text: [
      `Most mechanical work on ${car} is not dealer-only. Independents measure rotors, replace pads, and diagnose codes every day.`,
      "Where the selling brand matters: an open safety recall (often performed at the brand dealer at no charge to you), a warranty that requires their invoice, and some module programming that needs factory-level software. That is a capability question — 'do you have the factory scan tool for this VIN?' — not a loyalty oath.",
      "I will not tell you a job is legally dealer-only, and I will not certify a shop. Airbag, hybrid high-voltage, and immobilizer work is where you ask about training and the right tool, then get the answer in writing.",
      vinLine,
    ].join("\n\n"),
    scripts: [
      "Is this a recall or customer-pay? If it is a campaign, I want it done under the campaign, not as a retail RO.",
      "If I have this done at an independent, which warranty item do I lose? Please show me that in writing.",
      "Do you need factory software for this VIN, or a quality scan tool? I am deciding on capability, not a logo.",
    ],
    tools: pickTools("/directory", "/guides", "/quote"),
  };
}

function genericScript(car: string): Omit<AgentReply, "engine" | "vision" | "verify"> {
  return {
    text: [
      `You can walk to the window with three sentences and a closed wallet. On ${car}, you are buying a test and a number, not a feeling.`,
      "If they already quoted a flush, a cabin filter, or rotors 'due,' open Quote defense and paste the lines. If it is a noise, open the symptom wizard. If a scanner spat a code, type it on OBD.",
    ].join("\n\n"),
    scripts: [
      "Before you start, write the labor hours and the OEM part numbers on the RO. I want to see the old parts when you are done.",
      "If anything extra shows up after you open it, call me before you add it. Do not go past the written estimate.",
      "Please measure against the factory spec for this VIN — millimeters, PSI, or the page in the schedule. I do not authorize from 'they're due.'",
    ],
    tools: pickTools("/quote", "/symptoms", "/obd"),
  };
}

function generalBrief(text: string, car: string, vehicle?: AgentVehicleContext): Omit<AgentReply, "engine" | "vision" | "verify"> {
  const hook = text
    ? `I heard you. On ${car}, I will not invent a part from a short note.`
    : `I am in your corner on ${car} — not the shop's.`;
  return {
    text: [
      hook,
      formatVehicleBrief(vehicle),
      "Tell me one of these and I can write the window script: the line items they quoted (part + price), the sound and when it happens, or the five-character code on any $20 scanner.",
      "Until then, authorize diagnosis with a written conclusion — not a bundled menu.",
    ].join("\n\n"),
    scripts: [
      "I am not authorizing related repairs until you show the failed test and the number.",
      "Please write part names, OEM numbers, and labor hours on the RO before you start.",
    ],
    tools: pickTools("/quote", "/symptoms", "/obd", "/guides"),
  };
}
