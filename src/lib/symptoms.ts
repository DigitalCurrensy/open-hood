import type { SymptomFinding, SymptomNoise, SymptomWhen, VehicleSpecs } from "@/lib/types";

export const NOISE_OPTIONS: Array<{ id: SymptomNoise; label: string; hint: string }> = [
  { id: "squeal", label: "Squeal", hint: "High, sharp, metal-on-metal or belt-like" },
  { id: "grinding", label: "Grinding", hint: "Gritty, like sand in a bearing" },
  { id: "thumping", label: "Thumping", hint: "Once-per-revolution knock" },
  { id: "clicking", label: "Clicking", hint: "Fast ticks, especially in a turn" },
  { id: "rumble", label: "Rumble", hint: "Low drone that grows with speed" },
  { id: "hiss", label: "Hiss / whoosh", hint: "Air or steam, often under the hood" },
  { id: "none", label: "No noise", hint: "Light, smell, or feel only" },
];

export const WHEN_OPTIONS: Array<{ id: SymptomWhen; label: string }> = [
  { id: "braking", label: "Braking" },
  { id: "turning", label: "Turning" },
  { id: "accelerating", label: "Accelerating" },
  { id: "idling", label: "Idling / parked" },
  { id: "highway", label: "Highway speed" },
  { id: "cold-start", label: "Cold start" },
  { id: "always", label: "All the time" },
];

export function diagnoseSymptoms(
  noise: SymptomNoise,
  when: SymptomWhen,
  extras: { warningLight: boolean; leak: boolean; pull: boolean },
  specs: VehicleSpecs,
): SymptomFinding[] {
  const vehicle = [specs.year, specs.make, specs.model].filter(Boolean).join(" ") || "your car";
  const findings: SymptomFinding[] = [];

  if (noise === "squeal" && (when === "braking" || when === "always")) {
    findings.push({
      title: "Brake pads wearing to the indicator",
      likelihood: "likely",
      plainEnglish: `A squeal while slowing is often the wear tab on the pads — a thin metal finger designed to scream before metal hits the rotor. On a ${vehicle}, that is a maintenance item, not an emergency, until it turns into grinding.`,
      askTheShop: "Ask them to measure inner and outer pad thickness in millimeters on both sides of that axle, and rotor thickness vs the discard spec.",
      diySafe: false,
    });
  }

  if (noise === "grinding" && when === "braking") {
    findings.push({
      title: "Pads likely gone — rotors at risk",
      likelihood: "likely",
      plainEnglish: "Grinding under the pedal usually means the friction material is gone and the backing plate is cutting the rotor. That turns a pad job into a pad-and-rotor job if you keep driving.",
      askTheShop: "Ask for rotor thickness in mm vs the stamped minimum (often ~22–28 mm depending on the car). If they are above spec, machining or reuse may be valid — don't rubber-stamp 'must replace'.",
      diySafe: false,
    });
  }

  if (noise === "squeal" && (when === "cold-start" || when === "idling" || when === "always")) {
    findings.push({
      title: "Accessory belt or tensioner",
      likelihood: "possible",
      plainEnglish: "A squeal at startup or in rain is often a glazed belt or a weak tensioner, not the engine itself.",
      askTheShop: "Ask them to show belt glazing and the tensioner pulley play with the engine off. A belt is a parts-bin item; a 'full front engine kit' is a different conversation.",
      diySafe: true,
    });
  }

  if (noise === "clicking" && when === "turning") {
    findings.push({
      title: "CV axle joint (front-drive)",
      likelihood: "likely",
      plainEnglish: "A rhythmic click that speeds up in a turn is the classic worn outer CV joint. The boot may already be torn and packed with grease on the inside of the wheel.",
      askTheShop: "Ask to see the torn boot. A complete axle is usually cheaper than a boot kit in labor. Get a price for one side vs both.",
      diySafe: false,
    });
  }

  if (noise === "thumping" || (noise === "rumble" && when === "highway")) {
    findings.push({
      title: "Tire belt, cupping, or wheel bearing",
      likelihood: "possible",
      plainEnglish: "A once-per-rev thump is often a tire. A drone that tracks road speed can be a bearing. These get mis-sold as each other.",
      askTheShop: "Ask them to road-test, then spin each wheel off the ground and check for play at 12-and-6. If they recommend a bearing, ask which corner and why it isn't the tire.",
      diySafe: true,
    });
  }

  if (noise === "hiss" || extras.leak) {
    findings.push({
      title: "Coolant, power steering, or AC leak",
      likelihood: extras.leak ? "likely" : "possible",
      plainEnglish: "A hiss plus steam is coolant until proven otherwise. Colored puddles: green/orange/pink = coolant, red = trans or PS, brown-black = oil, clear oily = AC dye.",
      askTheShop: "Ask for a pressure-test result in PSI and the leaking fitting by name — not 'the radiator system needs a flush.'",
      diySafe: false,
    });
  }

  if (extras.pull && (when === "braking" || when === "always")) {
    findings.push({
      title: "Caliper slide, pad taper, or alignment",
      likelihood: "possible",
      plainEnglish: "A pull under braking is often a sticking caliper or tapered pads, not 'you need an alignment' by itself.",
      askTheShop: "Ask for inside vs outside pad thickness on both front corners. If they differ by more than ~2 mm, that caliper is the story.",
      diySafe: false,
    });
  }

  if (extras.warningLight) {
    findings.push({
      title: "Stored OBD-II code — don't guess from the light color",
      likelihood: "check",
      plainEnglish: "The light is a pointer, not a diagnosis. P0420 is not automatically a catalytic converter. P0300 is a misfire pattern, not a coil pack by default.",
      askTheShop: "Ask for the freeze-frame printout (RPM, load, temp when it set) and the pending vs confirmed codes before you approve parts.",
      diySafe: true,
    });
  }

  if (findings.length === 0) {
    findings.push({
      title: "Needs a directed inspection, not a menu",
      likelihood: "check",
      plainEnglish: "This combination doesn't map to one backyard classic. That's fine — it means you should pay for diagnosis, not a bundled 'we should also…' list.",
      askTheShop: "Authorize a diagnostic hour with a written conclusion. Do not pre-approve related repairs until they show the failed test.",
      diySafe: false,
    });
  }

  return findings;
}
