import {
  detectFlush,
  detectSymptom,
  flushProxyLine,
  hasQuoteShape,
  uniqueCodes,
} from "@/lib/agent/detect";
import { AGENT_VERIFY, type AgentImageKind, type AgentReadingLevel, type AgentReply, type AgentVehicleContext, type AgentWireMessage } from "@/lib/agent/types";
import { pickTools } from "@/lib/agent/tools";
import { formatVehicleBrief, specsFromContext, thisVehicle, vehiclePhrase } from "@/lib/agent/vehicle";
import { lookupDtc } from "@/lib/dtc";
import { analyzeQuoteText } from "@/lib/quote";
import { diagnoseSymptoms } from "@/lib/symptoms";

export function runAdvocateRules(input: {
  messages: AgentWireMessage[];
  vehicle?: AgentVehicleContext;
  hasVision: boolean;
  readingLevel?: AgentReadingLevel;
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
  const readingLevel = input.readingLevel ?? "beginner";

  if (codes.length) {
    return withMeta(dtcBrief(codes, car, input.vehicle, readingLevel), vision, photoNote, readingLevel);
  }

  if (flush || (looksLikeQuote && /flush|cleaner|service|filter|labor|rotor|pad/i.test(text))) {
    return withMeta(quoteOrFlushBrief(text, flush, car, specs, input.vehicle), vision, photoNote, readingLevel);
  }

  if (imageKind === "quote" && !text) {
    return withMeta(quotePhotoOnly(car, input.hasVision), vision, photoNote, readingLevel);
  }

  if (symptom) {
    return withMeta(symptomBrief(symptom, car, specs), vision, photoNote, readingLevel);
  }

  if (imageKind === "leak") {
    return withMeta(leakBrief(car), vision, photoNote, readingLevel);
  }

  if (imageKind === "light") {
    return withMeta(lightBrief(car, readingLevel), vision, photoNote, readingLevel);
  }

  if (dealer) {
    return withMeta(dealerBrief(car, input.vehicle), vision, photoNote, readingLevel);
  }

  if (wantsScript) {
    return withMeta(genericScript(car), vision, photoNote, readingLevel);
  }

  return withMeta(generalBrief(text, car, input.vehicle, readingLevel), vision, photoNote, readingLevel);
}

function withMeta(
  reply: Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations">,
  vision: AgentReply["vision"],
  photoNote: string,
  readingLevel: AgentReadingLevel,
): AgentReply {
  const text = photoNote ? `${photoNote}\n\n${reply.text}` : reply.text;
  return {
    ...reply,
    text,
    facts: [],
    invocations: [],
    readingLevel,
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

function dtcBrief(
  codes: string[],
  car: string,
  vehicle?: AgentVehicleContext,
  readingLevel: AgentReadingLevel = "beginner",
): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
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
      readingLevel === "expert"
        ? "Flashing MIL is a misfire-in-progress. Steady amber is stored/pending. Ask for freeze-frame (RPM, load, STFT/LTFT, ECT) and OEM vs aftermarket part numbers before a converter, coil pack, or module."
        : "If the light is flashing, that is a misfire-while-driving warning — ease it to a shop, do not floor it. A steady amber light is usually 'soon,' not 'leave it on the shoulder,' unless the car is overheating, leaking, or will not stay running.",
    ].join("\n\n"),
    scripts: scripts.slice(0, 4),
    tools: pickTools("/obd", "/symptoms", "/quote", "/expert"),
  };
}

function quoteOrFlushBrief(
  text: string,
  flush: ReturnType<typeof detectFlush>,
  car: string,
  specs: ReturnType<typeof specsFromContext>,
  vehicle?: AgentVehicleContext,
): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
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

function quotePhotoOnly(car: string, hasVision: boolean): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
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
): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
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

function leakBrief(car: string): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
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

function lightBrief(car: string, readingLevel: AgentReadingLevel = "beginner"): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
  return {
    text: [
      `A light on ${car} is a color and a behavior, not a part. Amber check-engine is usually stored codes. Flashing check-engine is a misfire in progress. Red oil or temp is 'shut it down and check the gauge / dipstick' — I am not diagnosing a spun bearing from a photo.`,
      readingLevel === "expert"
        ? "Read the five-character code and the freeze-frame. Do not authorize a catalytic converter, coil pack, or module from the icon."
        : "Any $20 OBD-II scanner will print a five-character code. Type that code here or on the OBD desk. Do not authorize a catalytic converter, a coil pack, or a tune-up from the icon alone.",
    ].join("\n\n"),
    scripts: [
      "Please read the codes and print the freeze-frame before you quote a part.",
      "Is the light steady or flashing? I will not approve a converter from the icon.",
    ],
    tools: pickTools("/obd", "/symptoms", "/quote"),
  };
}

function dealerBrief(car: string, vehicle?: AgentVehicleContext): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
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
    tools: pickTools("/directory", "/guides", "/quote", "/recalls"),
  };
}

function genericScript(car: string): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
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

function generalBrief(
  text: string,
  car: string,
  vehicle?: AgentVehicleContext,
  readingLevel: AgentReadingLevel = "beginner",
): Omit<AgentReply, "engine" | "vision" | "verify" | "readingLevel" | "facts" | "invocations"> {
  const hook = text
    ? `I heard you. On ${car}, I will not invent a part from a short note.`
    : `I am in your corner on ${car} — not the shop's.`;
  return {
    text: [
      hook,
      formatVehicleBrief(vehicle),
      readingLevel === "expert"
        ? "Give me the RO lines (part + price), the DTC + freeze-frame, or the noise and operating condition. I will call the matching bay tool."
        : "Tell me one of these and I can write the window script: the line items they quoted (part + price), the sound and when it happens, or the five-character code on any $20 scanner.",
      "Until then, authorize diagnosis with a written conclusion — not a bundled menu.",
    ].join("\n\n"),
    scripts: [
      "I am not authorizing related repairs until you show the failed test and the number.",
      "Please write part names, OEM numbers, and labor hours on the RO before you start.",
    ],
    tools: pickTools("/quote", "/symptoms", "/obd", "/guides"),
  };
}
