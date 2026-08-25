import type { CheckItem, DiyJobCard, FleetLine, SkuLane } from "@/lib/jobs/types";

export const DIY_CARDS: DiyJobCard[] = [
  {
    id: "brakes",
    title: "Front pads / rotors",
    timeBand: "2–4 hours first time",
    tools: [
      "Jack + two stands + wheel chock",
      "Breaker bar and the lug socket",
      "Caliper bolts / slide-pin sockets (often 14 / 17 / T47)",
      "C-clamp or caliper compressor",
      "Torque wrench (inch-pounds for slides, foot-pounds for lugs and caliper bracket)",
      "Brake cleaner, gloves, wire brush",
    ],
    torqueMindset:
      "Lugs, bracket bolts, and slide pins each have a number. Use a chart for this VIN — do not guess 80 ft-lb on everything. If you do not have the chart, stop and look it up. An impact-only 'snug' is how you stretch studs.",
    safety: [
      "Never work under a car on a jack alone. Stands, then a tug test.",
      "Brake dust: wet wipe, don't blow.",
      "Do not depress the pedal with a caliper hanging.",
      "Bed the pads. Pump the pedal before you roll.",
    ],
    steps: [
      { id: "b1", title: "Chart first", detail: "Lug torque, bracket torque, slide-pin torque. Write them on the box." },
      { id: "b2", title: "Measure the old rotors", detail: "Mic the hat face. Below discard = new rotor, not a machine." },
      { id: "b3", title: "Hang the caliper", detail: "Wire it. Don't stretch the hose." },
      { id: "b4", title: "Compress the piston slowly", detail: "Open the reservoir cap. Watch the level." },
      { id: "b5", title: "Torque, then the pedal", detail: "Chart values. Pump until hard. Then a short test stop." },
    ],
  },
  {
    id: "oil",
    title: "Oil + filter",
    timeBand: "45–90 minutes",
    tools: [
      "Jack stands or ramps (if you need them)",
      "Oil filter wrench that actually fits this filter",
      "Drain plug socket / hex / E-torx — look first",
      "Torque wrench for the plug",
      "Drain pan, funnel, gloves",
    ],
    torqueMindset:
      "The drain plug is not 'gorilla plus a quarter turn.' Crush washers fail from over-torque. Look up the plug torque. Filter: gasket oiled, hand-tight plus the chart (often 3/4 turn) — not a cheater bar.",
    safety: [
      "Hot oil burns. Let it sit or wear real gloves.",
      "The car must be level to read the stick or the electronic gauge.",
      "Dispose of oil. Do not dump it.",
    ],
    steps: [
      { id: "o1", title: "Cap spec", detail: "Viscosity and spec on the cap / door book. Not '5W-30 is 5W-30.'" },
      { id: "o2", title: "Warm, then drain", detail: "New crush washer. Torque the plug to the chart." },
      { id: "o3", title: "Filter", detail: "Old gasket came off the pad? Oil the new one." },
      { id: "o4", title: "Fill, run, recheck", detail: "Start, look for drips, shut off, wait, read it." },
    ],
  },
  {
    id: "plugs",
    title: "Spark plugs",
    timeBand: "1–3 hours (depends on the manifold)",
    tools: [
      "Plug socket + extension + swivel",
      "Torque wrench (plugs are small numbers)",
      "Gap tool if the book says to gap",
      "Dielectric grease for the boot, not the threads unless the book says so",
      "Compressed air to blow the well before you crack the plug",
    ],
    torqueMindset:
      "Plug torque is often in inch-pounds or a small foot-pound number. Guessing 'snug' strips aluminum heads. Use the chart. If you feel the thread start wrong, back out — do not keep going.",
    safety: [
      "Engine cold if the book says so. Hot aluminum plus a cross-thread is a helicoil.",
      "Mark coil connectors. One pin bent is a misfire.",
      "Do not drop hardware down a well.",
    ],
    steps: [
      { id: "s1", title: "Gap / no-gap", detail: "Some iridiums are pre-gapped. The book wins." },
      { id: "s2", title: "One hole at a time", detail: "Coil off, blow the well, crack the plug, new plug, torque, boot on." },
      { id: "s3", title: "Don't anti-seize unless the book says", detail: "Torque values assume clean dry or specified lube." },
    ],
  },
  {
    id: "coolant",
    title: "Coolant drain / fill",
    timeBand: "1–2 hours plus bleed",
    tools: [
      "Drain pan big enough",
      "The right coolant — the book, not 'green'",
      "Funnel, ramps or stands if the petcock is low",
      "Bleed procedure for this VIN (air lock overheats)",
    ],
    torqueMindset:
      "Petcocks and plastic drain plugs snap. Snug plus the chart, not a foot on the breaker bar. Hose clamps: clock them where you can see a leak.",
    safety: [
      "Never open a hot cap. Steam cooks hands.",
      "Hybrids / EVs may have more than one loop. Wrong loop = expensive.",
      "Coolant kills animals. Clean the puddle.",
    ],
    steps: [
      { id: "c1", title: "Which loop", detail: "Engine vs inverter vs cabin. One jug is not all loops." },
      { id: "c2", title: "Drain, fill, bleed", detail: "Follow the bleed. Heater on. Watch temp, not the clock." },
      { id: "c3", title: "Dispose", detail: "Take it to the parts store. Do not hose it into the alley." },
    ],
  },
  {
    id: "filters",
    title: "Cabin / engine air filter",
    timeBand: "15–40 minutes",
    tools: ["Screwdriver or 7/8/10 mm", "Vacuum for the box", "The filter that matches the box, not 'close'"],
    torqueMindset:
      "Air-box screws are plastic. Finger-tight plus a short screwdriver — not an impact. MAF is in this neighborhood: don't manhandle the element.",
    safety: ["Don't spray MAF cleaner unless you mean to, and let it dry.", "Don't start it with the box open in a sandstorm."],
    steps: [
      { id: "f1", title: "Photo the old one", detail: "If it is white, you didn't need it. If it is a brick, you did." },
      { id: "f2", title: "Seat the new one", detail: "The seal faces the way the old one did. Lid clicks." },
    ],
  },
  {
    id: "battery",
    title: "12V battery",
    timeBand: "30–60 minutes",
    tools: ["Wrench set", "Memory saver is optional — know the radio/window relearn", "Terminal brush", "Hold-down hardware"],
    torqueMindset:
      "Terminals are soft lead. The chart is inch-pounds. Over-tight cracks the post. Hold-down is what keeps it from shorting a tray.",
    safety: [
      "Negative first off, last on — unless the book for this car says otherwise (some BMS).",
      "No jewelry. No tools across the posts.",
      "EVs: the 12V is still live and still starts contactors. Don't guess on a high-voltage orange cable.",
    ],
    steps: [
      { id: "t1", title: "Group size and type", detail: "AGM vs flooded. The tray and the BMS care." },
      { id: "t2", title: "Register / relearn if the book says", detail: "Many late cars need a battery registration. Skipping it kills the new one." },
      { id: "t3", title: "Hold-down on", detail: "A loose battery is a short looking for a pothole." },
    ],
  },
];

export const TECH_CUSTOMER_ASKS: { job: string; questions: string[] }[] = [
  {
    job: "Brakes",
    questions: [
      "How many millimeters are on the rotors and the pads, and what is the minimum?",
      "Are you machining or replacing, and will the machined rotor stay above discard?",
      "Is a caliper seized, or is this even wear?",
      "Can I have the old pads?",
    ],
  },
  {
    job: "Check-engine",
    questions: [
      "What is the exact code, not 'the cat'?",
      "What test picked the part — graph, smoke, pressure?",
      "If this is P0420 or P0300, why isn't it a sensor or a leak?",
      "What happens if I drive it to Friday?",
    ],
  },
  {
    job: "Transmission",
    questions: [
      "Is this fluid, a solenoid, or clutches — and which test?",
      "Can I see the fluid on a rag?",
      "Is P0700 the only code? What is the companion?",
      "Rebuild vs used vs reman — warranty in writing.",
    ],
  },
  {
    job: "NVH / noise",
    questions: [
      "When did you duplicate it — speed, temp, load?",
      "Is this a road-test note or a parts guess?",
      "If NTF, what did you try?",
    ],
  },
];

export const TECH_MEASURES: { id: string; title: string; unit: string; hint: string }[] = [
  { id: "rotor", title: "Rotor thickness", unit: "mm", hint: "Hat discard is on the casting or in the book. Write measured and minimum." },
  { id: "pad", title: "Pad friction left", unit: "mm", hint: "Backing plate to face. '4 mm, min 2 mm' is a sentence. 'Due' is not." },
  { id: "tread", title: "Tire tread", unit: "32nds", hint: "Same corner every time. Wear bars are ~2/32." },
  { id: "runout", title: "Rotor runout", unit: "mm", hint: "Dial indicator. Hub vs rotor — clean the face first." },
  { id: "psi", title: "Tire pressure", unit: "PSI", hint: "Door sticker, cold. Not the sidewall max." },
  { id: "oil-psi", title: "Oil pressure (mechanical)", unit: "PSI", hint: "Hot idle. A sender code is not this number." },
];

export const SKU_LANES: SkuLane[] = [
  {
    id: "oem",
    title: "OEM / dealer box",
    useWhen: "The VIN has a campaign, a fitment fork (hybrid vs gas), or the owner wants the factory part number on the invoice.",
    sayThis: "This is the dealer-boxed part for that VIN. I'll write the part number and the supersession if there is one.",
    doNotClaim: "Do not say 'OEM is the only safe part' on a filter or a CAPA-certified panel. That is a preference, not physics.",
  },
  {
    id: "aftermarket",
    title: "Aftermarket",
    useWhen: "A quality tier exists (budget / mid / premium). Fitment is confirmed by year, engine, and options — not 'it's a Camry.'",
    sayThis: "Here is the mid-grade and the premium. The cheap one skips the sensor or the coating — I'll say which.",
    doNotClaim: "Do not say 'same as OEM' unless you have the same part number. Do not hide a missing pad-wear sensor.",
  },
  {
    id: "capa",
    title: "CAPA body",
    useWhen: "Insurance wants a certified aftermarket bumper, fender, or lamp. CAPA is a certification, not a brand.",
    sayThis: "CAPA means a certified aftermarket body part — test-fit and materials against a standard. You can still choose OEM. I'll write which on the estimate.",
    doNotClaim: "Do not tell the owner CAPA is 'illegal' or that OEM is 'required by law' on a cosmetic cover. Write the choice.",
  },
];

export const PARTS_ASK: CheckItem[] = [
  { id: "vin8", title: "Year / make / model / last 8 of VIN", detail: "The catalog forks on the VIN more than the owner thinks." },
  { id: "engine", title: "Engine and fuel", detail: "2.0T vs hybrid vs diesel. Filters and coils are not interchangeable." },
  { id: "options", title: "Options that change the SKU", detail: "Tow, AWD, Brembo, LED vs halogen, sunroof drain, TPMS." },
  { id: "old-part", title: "Old part number or a photo of the box", detail: "Supersessions lie. The box on the shelf last time is a clue." },
  { id: "job", title: "Who is installing", detail: "DIY needs the sensor and the hardware. A shop may have the grease." },
];

export const FLEET_LINES: FleetLine[] = [
  {
    id: "oil",
    title: "Oil + filter",
    interval: "OEM time/miles or oil-life monitor — whichever the book says. Severe service if short trips.",
    upsell: "Flush, induction, 'high-mileage package,' cabin filter bundled without a look.",
    askFor: "Viscosity and spec. Monitor reset. Decline the menu unless they show the old cabin filter.",
  },
  {
    id: "brakes",
    title: "Brakes",
    interval: "Replace at discard thickness, not at an MPI '50%.' Fluid on years or a test strip.",
    upsell: "Four corners because one axle is low. Flush every oil change. Loaded calipers on even wear.",
    askFor: "mm per corner and the minimum. Photo if they want a caliper.",
  },
  {
    id: "tires",
    title: "Tires",
    interval: "Rotate on the door-book interval. Replace at 2–3/32 or a wear-bar plus a reason (weather, fleet policy).",
    upsell: "Alignment on every rotation. Nitrogen. Four TPMS sensors because one stem leaked.",
    askFor: "32nds and a wear pattern. Alignment printout only if the pattern says pull or feather.",
  },
  {
    id: "trans",
    title: "Transmission fluid",
    interval: "The book — some are 'lifetime' until a leak; some have a mile number. Drain-and-fill vs flush is a decision.",
    upsell: "Flush machine on a high-mile untouched unit sold as 'required.'",
    askFor: "Which procedure, which spec, filter this time, photo of the old fluid.",
  },
  {
    id: "coolant",
    title: "Coolant",
    interval: "Years/miles in the book. Specific chemistry. Hybrid/EV extra loops.",
    upsell: "'Flush package' every visit. Universal coolant in a spec car.",
    askFor: "Which loop and which jug. A test strip or the interval page.",
  },
  {
    id: "cabin",
    title: "Cabin filter",
    interval: "Often 15–30k or 'when dirty.' Look at it.",
    upsell: "Replaced every LOF at dealer list without showing the old one.",
    askFor: "Photo of the old filter. Then yes or no.",
  },
];

export const ADVISOR_LINES: { id: string; writerSays: string; ownerHears: string; better: string }[] = [
  {
    id: "lof",
    writerSays: "LOF and we recommend a multi-point.",
    ownerHears: "Oil change plus a sales walk.",
    better: "Oil and filter at the cap spec. MPI is optional; measurements are not adjectives.",
  },
  {
    id: "align",
    writerSays: "It needs an alignment.",
    ownerHears: "The rack is bad or I have to buy it.",
    better: "We print before/after in degrees. If a bushing is sloppy, that part is first.",
  },
  {
    id: "trans",
    writerSays: "Trans service.",
    ownerHears: "Flush or rebuild — unclear.",
    better: "Drain-and-fill (or pan/filter). Not a flush unless we show contamination.",
  },
  {
    id: "due",
    writerSays: "Brakes are due.",
    ownerHears: "Fail. Do it now.",
    better: "LF pad 4 mm, min 2 mm. You can schedule. Below min is a fail.",
  },
  {
    id: "codes",
    writerSays: "It's the catalytic converter.",
    ownerHears: "$2,000 today.",
    better: "P0420 is efficiency. We graph O2s and check leaks before we order a brick.",
  },
];
