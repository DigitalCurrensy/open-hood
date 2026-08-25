import type { DtcEntry, DtcSeverity, RecallRecord } from "@/lib/types";

const BOOK: Record<string, DtcEntry> = {
  P0010: entry("P0010", "Camshaft position actuator circuit", "The computer cannot control the variable-valve actuator on one bank. Often a dirty oil-control valve or low oil, not a dead engine.", "Oil-control solenoid, oil level/quality, wiring", "Ask them to check oil level and the screen on the VVT solenoid before quoting a cam or timing job.", "$120–$450 solenoid; $80–$160 diagnosis", "soon", true),
  P0011: entry("P0011", "Camshaft timing over-advanced", "The cam is arriving earlier than commanded. Sludged oil or a stuck actuator is more common than a jumped chain on a first visit.", "Oil, VVT solenoid, timing chain stretch", "Ask for a cam-correlation test and oil condition notes before authorizing a chain.", "$150–$1,800 depending on solenoid vs chain", "soon", false),
  P0016: entry("P0016", "Crank / cam correlation", "The computer sees the crank and cam sensors disagree. That can be a $40 sensor — or a jumped timing chain. The test decides.", "Sensor, reluctor, timing chain/belt", "Ask which sensor waveform failed and whether chain slack was measured. Do not pre-approve a motor.", "$80–$2,500", "urgent", false),
  P0087: entry("P0087", "Fuel rail pressure too low", "The rail is starving. On a gasoline GDI car this is often a pump or filter. On diesel it can be air in the system.", "Fuel pump, filter, leak, pressure regulator", "Ask for commanded vs actual rail PSI on a scan printout.", "$200–$1,400", "urgent", false),
  P0101: entry("P0101", "MAF sensor range / performance", "The airflow meter is reporting a value that does not match RPM and load. A dirty MAF or an intake leak is the usual first look.", "MAF contamination, intake boot crack, unmetered air", "Ask them to graph MAF g/s at idle and 2500 RPM against the spec sheet — not just 'replace the sensor.'", "$80–$380", "soon", true),
  P0102: entry("P0102", "MAF sensor low input", "The meter is seeing almost no air, or the wire is broken. Unplugged connectors after an air-filter job are common.", "MAF, connector, air box", "Ask them to wiggle-test the connector with the meter live.", "$80–$320", "soon", true),
  P0113: entry("P0113", "Intake air temperature high", "The IAT circuit is open or the sensor thinks the air is impossibly hot. A $20 sensor or a chewed wire.", "IAT / MAF combo sensor, wiring", "Ask for the live temperature reading vs a thermometer at the air box.", "$20–$180", "monitor", true),
  P0128: entry("P0128", "Coolant thermostat (temp below range)", "The engine is not reaching full temperature. Almost always a thermostat stuck open — not a water pump and not a 'flush package.'", "Thermostat, coolant level, ECT sensor", "Ask for a temperature graph to 195–210°F. A flush is not the repair unless they found rust or oil in the coolant.", "$150–$380", "soon", false),
  P0133: entry("P0133", "O2 sensor slow response", "The upstream oxygen sensor is lazy. It may be old, or a small exhaust leak is fooling it.", "O2 sensor, exhaust leak before the sensor", "Ask them to smoke or listen for a manifold leak before selling a catalytic converter.", "$120–$420", "soon", false),
  P0135: entry("P0135", "O2 sensor heater circuit", "The heater inside the oxygen sensor failed. The car will run, but fuel trim will drift. This is a parts-bin sensor, not a cat.", "O2 heater, fuse, wiring", "Ask for the heater-circuit ohms and which bank/sensor (B1S1 vs B1S2).", "$110–$360", "soon", false),
  P0171: entry("P0171", "System too lean (Bank 1)", "The computer is adding extra fuel because the mixture looks skinny. Vacuum leaks and dirty MAF beat 'bad injectors' on most first visits.", "Vacuum leak, MAF, fuel pressure, PCV", "Ask for short- and long-term fuel trims at idle vs 2500 RPM. A leak often shows only at idle.", "$80–$450; injectors only after a pressure/leak test", "soon", true),
  P0172: entry("P0172", "System too rich (Bank 1)", "The computer is pulling fuel out. A leaking injector, bad fuel-pressure regulator, or a stuck purge valve is more likely than 'needs a tune-up.'", "Injector leak, purge valve, fuel pressure", "Ask for a fuel-pressure hold test and a smoke test of the EVAP purge path.", "$120–$700", "soon", false),
  P0174: entry("P0174", "System too lean (Bank 2)", "Same lean story on the other bank. Both banks lean usually means unmetered air or low fuel pressure, not two failed cats.", "Vacuum leak, MAF, fuel pump", "If P0171 and P0174 are together, ask them to start at the intake boot and fuel pressure — not four O2 sensors.", "$80–$500", "soon", true),
  P0300: entry("P0300", "Random / multiple misfire", "Cylinders are stumbling with no single favorite. Coils, plugs, vacuum leaks, and low fuel pressure are the short list. A 'tune-up package' is not a diagnosis.", "Plugs, coils, leak, fuel, compression", "Ask for a misfire count per cylinder and a power-balance or compression check before a parts cannon.", "$150–$1,200", "urgent", false),
  P0301: entry("P0301", "Cylinder 1 misfire", "Cylinder 1 is the one stumbling. Swap the coil to another hole before you buy four coils.", "Coil, plug, injector, compression on cyl 1", "Ask them to swap the #1 coil with #3 (or another) and see if the code follows.", "$80–$400 for coil/plug; more if injector or mechanical", "soon", false),
  P0302: entry("P0302", "Cylinder 2 misfire", "Same as a single-cylinder misfire, just hole 2. The swap test still applies.", "Coil, plug, injector, compression", "Ask for the swap test and the misfire counts, not a full ignition kit by default.", "$80–$400 typical coil/plug", "soon", false),
  P0303: entry("P0303", "Cylinder 3 misfire", "Cylinder 3 is misfiring. Treat it like P0301 — isolate the hole before replacing a set.", "Coil, plug, injector, compression", "Ask which test proved the part, not 'these coils fail a lot on this car.'", "$80–$400 typical", "soon", false),
  P0304: entry("P0304", "Cylinder 4 misfire", "Cylinder 4 is misfiring. Same isolate-then-replace rule.", "Coil, plug, injector, compression", "Ask for misfire counts and a coil swap before a four-pack.", "$80–$400 typical", "soon", false),
  P0305: entry("P0305", "Cylinder 5 misfire", "A V6/V8 hole is stumbling. Still a single-cylinder problem until proven otherwise.", "Coil, plug, injector, compression", "Ask them not to quote six coils because one hole failed.", "$80–$450 typical", "soon", false),
  P0306: entry("P0306", "Cylinder 6 misfire", "Cylinder 6 misfire. Isolate first.", "Coil, plug, injector, compression", "Ask for the swap or power-balance result in writing.", "$80–$450 typical", "soon", false),
  P0316: entry("P0316", "Misfire during first 1,000 revolutions", "It stumbled right after start. Coolant in a cylinder (head gasket) or a weak coil when cold are both on the list — they are not the same repair.", "Cold coil, flooded start, head gasket", "Ask for a chemical block test or exhaust-gas-in-coolant test if it only happens cold and uses coolant.", "$80–$2,000", "soon", false),
  P0325: entry("P0325", "Knock sensor circuit", "The knock sensor circuit is open or noisy. The computer may pull timing and the car will feel dull. It is not automatically a spun bearing.", "Knock sensor, harness, connector", "Ask for a circuit test before an engine estimate.", "$120–$480", "soon", false),
  P0335: entry("P0335", "Crankshaft position sensor", "The computer lost the crank signal. No-start or stall is common. A $40–$150 sensor is the usual ending — after they confirm the tone ring is intact.", "CKP sensor, connector, reluctor wheel", "Ask whether it is a hard no-signal or an intermittent drop, and if the reluctor is damaged.", "$80–$350", "urgent", false),
  P0340: entry("P0340", "Camshaft position sensor", "Cam sensor circuit fault. Can be the sensor, the oil-soaked connector, or (less often) the tone ring on the cam.", "CMP sensor, wiring, cam tone ring", "Ask them to scope the signal before quoting a timing job.", "$80–$380", "soon", false),
  P0401: entry("P0401", "EGR insufficient flow", "Exhaust gas is not entering the intake as commanded. A carboned EGR valve or a clogged passage is typical — not a new catalytic converter.", "EGR valve, passages, DPFE/sensor", "Ask for a commanded-vs-actual EGR PID and whether they cleaned passages or only swapped the valve.", "$120–$550", "soon", false),
  P0420: entry("P0420", "Catalyst efficiency below threshold (Bank 1)", "The downstream O2 sensor looks too much like the upstream one. That can be a dying catalyst — or an exhaust leak, a lazy upstream sensor, or a misfire that poisoned the brick.", "Cat, O2 sensors, exhaust leak, misfire", "Ask them to verify no misfires, no exhaust leaks, and to graph both O2 sensors before quoting a converter. A converter is $800–$2,500; a sensor is not.", "$200–$2,500", "soon", false),
  P0430: entry("P0430", "Catalyst efficiency below threshold (Bank 2)", "Same catalyst-efficiency story on the other bank. Same rule: prove the brick, don't assume it.", "Cat, O2, leak, misfire", "Ask for the same graph-and-leak check as P0420.", "$200–$2,500", "soon", false),
  P0440: entry("P0440", "EVAP system fault", "The vapor-recovery system failed a self-test. A loose gas cap still causes this. Do not authorize a charcoal-canister job from the code alone.", "Gas cap, purge/vent valves, hose, canister", "Ask them to smoke-test the EVAP system and tell you the leak location in inches from a named part.", "$0 (cap) – $450", "monitor", true),
  P0442: entry("P0442", "EVAP small leak", "A small leak in the vapor system — often a cap, a cracked hose, or a purge valve. Not an engine problem.", "Cap, hose, purge/vent", "Ask for the smoke-test photo of the leak. 'Needs a canister' without a leak location is a stall.", "$0–$380", "monitor", true),
  P0446: entry("P0446", "EVAP vent control", "The vent valve (usually near the canister / spare-tire well) is stuck or unplugged. Common after rodent damage.", "Vent valve, wiring, canister", "Ask where the vent solenoid lives on this VIN and whether they found chewed wires.", "$120–$420", "monitor", false),
  P0455: entry("P0455", "EVAP large leak", "A big vapor leak. Loose cap, unclipped hose after a filter job, or a split canister. The car is safe to drive; the light is a leak flag, not a breakdown.", "Cap, hose, filler neck, canister", "Ask them to start at the cap and filler neck before quoting the canister.", "$0–$450", "monitor", true),
  P0456: entry("P0456", "EVAP very small leak", "A pinhole leak. These take time to find. Paying for a proper smoke test is cheaper than three guess-parts.", "Cap seal, pinhole hose, purge", "Authorize a smoke/diagnostic hour. Do not pre-approve a parts list.", "$80–$350", "monitor", false),
  P0480: entry("P0480", "Cooling fan circuit", "The fan control circuit failed. Overheating risk if the fan never comes on — that is the urgency, not the code number.", "Fan motor, relay, control module", "Ask them to command the fan on with a scan tool and tell you if it spins.", "$80–$480", "soon", false),
  P0500: entry("P0500", "Vehicle speed sensor", "The computer lost road-speed. Speedometer, cruise, and shift quality can all suffer. ABS wheel-speed sensors sometimes share the signal.", "VSS, tone ring, ABS sensor, wiring", "Ask whether the cluster and the scan-tool speed agree, and which sensor they are replacing.", "$80–$380", "soon", false),
  P0506: entry("P0506", "Idle RPM lower than expected", "Idle is dragging. A dirty throttle body, a vacuum leak, or a failing IAC/ETB motor. 'Throttle service' as a $200 menu item is only fair if they show the carbon.", "Throttle body, vacuum leak, IAC", "Ask to see the throttle plate and the idle PID before/after a clean.", "$80–$420", "monitor", true),
  P0507: entry("P0507", "Idle RPM higher than expected", "Idle is hunting high. Vacuum leak or a stuck idle control is the usual pair.", "Vacuum leak, throttle, PCV", "Ask for a smoke test if they want to replace the throttle body on the first visit.", "$80–$380", "monitor", true),
  P0520: entry("P0520", "Oil pressure sensor circuit", "The oil-pressure switch or sender circuit failed. Confirm actual oil pressure with a mechanical gauge before you authorize an engine.", "Sender, wiring, actual oil pressure", "Ask for a mechanical gauge reading in PSI at hot idle. A $25 sender is not a spun bearing.", "$40–$1,800", "urgent", false),
  P0562: entry("P0562", "System voltage low", "The electrical system is sagging. Battery, cables, or alternator — in that order. A 'computer' is last.", "Battery, grounds, alternator", "Ask for battery CCA / voltage during crank and charging voltage at 2,000 RPM.", "$20 (cables) – $380 (alternator)", "soon", true),
  P0606: entry("P0606", "ECM / PCM processor", "The engine computer failed an internal check. Sometimes it is a low-voltage event, not a $1,200 module.", "Power/grounds, software, ECM", "Ask them to verify battery/grounds and TSBs for a reflash before quoting a new ECM.", "$0 (reflash) – $1,400", "soon", false),
  P0700: entry("P0700", "Transmission control — request MIL", "This is a pointer, not a diagnosis. The transmission module stored a more specific code (P07xx / P27xx). Do not authorize a rebuild from P0700 alone.", "Whatever the TCM companion code says", "Ask them to read the TCM codes and give you that number. P0700 by itself is incomplete.", "Diagnosis $80–$160; repair varies", "soon", false),
  P0715: entry("P0715", "Input / turbine speed sensor", "The transmission cannot see input speed. Harsh shifts or limp mode follow. Sensor or harness first; rebuild last.", "ISS sensor, harness, TCM", "Ask for ISS vs OSS live data during a road test.", "$150–$650 sensor; more if internal", "soon", false),
  P0720: entry("P0720", "Output speed sensor", "The transmission cannot see output speed. Speedometer and shift scheduling suffer.", "OSS sensor, tone wheel, harness", "Ask whether the cluster speed still works and if the tone wheel is cracked.", "$150–$650", "soon", false),
  P0730: entry("P0730", "Incorrect gear ratio", "Commanded gear and output speed do not match. That can be a solenoid, low fluid, or worn clutches. Fluid condition is the first photo you want.", "Fluid level/condition, solenoid, clutches", "Ask for fluid photos and a stall or clutch-pack test before a $4,000 rebuild quote.", "$80–$4,500", "urgent", false),
  P0740: entry("P0740", "Torque converter clutch circuit", "The lock-up clutch in the converter is not applying or the solenoid circuit failed. A shudder at highway speed is the usual complaint.", "TCC solenoid, fluid, converter", "Ask whether they are quoting a solenoid, a fluid service, or a converter — and which test picked it.", "$200–$1,800", "soon", false),
  P0750: entry("P0750", "Shift solenoid A", "A shift solenoid circuit failed. Sometimes the solenoid; sometimes the valve-body connector. Not automatically a rebuilt transmission.", "Solenoid, valve body, harness", "Ask for the solenoid ohm test and whether the pan came down. A rebuild quote from this code alone is a reach.", "$250–$1,200 typical solenoid/valve-body", "soon", false),
  P0A80: entry("P0A80", "Hybrid battery degradation", "The hybrid pack can no longer hold the commanded charge. This is a real, expensive repair — get a capacity printout, not a verbal 'the battery is bad.'", "Hybrid battery modules, cooling fan", "Ask for the block-voltage printout and whether individual modules can be balanced vs a full pack.", "$1,200–$4,500 typical; confirm core/warranty", "soon", false),
  P0A93: entry("P0A93", "Inverter cooling system", "The hybrid/EV inverter is not being cooled. A pump, a radiator, or low coolant in the inverter loop — not engine coolant by default.", "Inverter pump, radiator, specific coolant", "Ask which loop they tested and the pump's commanded vs actual flow.", "$200–$900", "urgent", false),
  P1101: entry("P1101", "MAF / air-intake performance (maker)", "A manufacturer-specific airflow rationality code. Treat it like P0101 until they name a different test.", "MAF, intake leak, PCV", "Ask for the maker TSB and the MAF g/s numbers.", "$80–$380", "soon", true),
  P2002: entry("P2002", "Diesel particulate filter efficiency", "The DPF is not cleaning itself. Short trips, a failed pressure sensor, or a clogged filter. A 'delete' is illegal on a street vehicle in the US.", "DPF, pressure sensor, regen strategy", "Ask for soot-load % and last successful regen. Forced regen is cheaper than a filter if the brick is intact.", "$150 (regen) – $2,800 (filter)", "soon", false),
  P2015: entry("P2015", "Intake manifold runner position", "The swirl/runner flap is not where the computer commanded. Carbon or a cheap actuator motor.", "Runner actuator, carbon, sensor", "Ask whether they are cleaning the runners or only replacing the motor.", "$180–$700", "soon", false),
  P2096: entry("P2096", "Post-catalyst fuel trim lean", "The computer is trimming based on the downstream sensor. Often a small exhaust leak or a lazy O2 — not an automatic converter.", "Exhaust leak, O2, cat", "Ask for a leak check at the manifold and flex pipe before a converter.", "$80–$2,200", "soon", false),
  P2119: entry("P2119", "Throttle closed-position performance", "The electronic throttle did not return to the learned closed stop. Carbon or a failing throttle body.", "Throttle body, adaptation, carbon", "Ask if they performed a throttle relearn after cleaning before quoting a new ETB.", "$80–$520", "soon", false),
  P2135: entry("P2135", "Throttle / pedal sensor correlation", "The two throttle-position signals disagree. The car may go to limp mode. This is a safety circuit — do not ignore it, but it is usually the throttle body or pedal sensor, not the ECM.", "Throttle body, accelerator pedal sensor, wiring", "Ask which pair failed (TPS vs APP) and for the dual-signal graph.", "$180–$520", "urgent", false),
  P2181: entry("P2181", "Cooling system performance", "The engine is not heating or cooling on schedule. Thermostat and coolant level first.", "Thermostat, coolant, radiator, ECT", "Same rule as P0128: show the temperature curve.", "$150–$600", "soon", false),
  P2195: entry("P2195", "O2 sensor stuck lean", "The upstream sensor is pinned lean. That can be the sensor or a real lean condition (leak / fuel).", "O2, vacuum leak, fuel", "Ask them to force the mixture rich with propane or a scan-tool test and see if the sensor moves.", "$80–$420", "soon", false),
  P2270: entry("P2270", "O2 sensor stuck lean (post)", "The downstream sensor is stuck. Often the sensor; sometimes an exhaust leak after the cat.", "Rear O2, leak", "Ask whether the rear sensor switches at all during a road test.", "$110–$360", "monitor", false),
  C0035: entry("C0035", "Left front wheel-speed sensor", "ABS / traction lost the left-front tone. A sensor, a damaged tone ring, or debris. The car still brakes — ABS may not.", "WSS, tone ring, harness", "Ask which corner and whether the ring is cracked. A full ABS module is rare on this code.", "$80–$320", "soon", true),
  C0040: entry("C0040", "Right front wheel-speed sensor", "Same wheel-speed story, right front.", "WSS, tone ring, harness", "Ask for the live wheel-speed PIDs while rolling the car.", "$80–$320", "soon", true),
  C0110: entry("C0110", "ABS pump motor circuit", "The ABS hydraulic pump circuit failed. You may lose ABS/ESC, not necessarily normal braking.", "Pump motor, relay, module", "Ask if the pump commands on and if the fuse/relay is good before a $1,000 module.", "$80–$1,100", "soon", false),
  C0265: entry("C0265", "EBCM / ABS module", "The ABS module failed an internal or pump-circuit test. Confirm power, grounds, and pump before the module.", "EBCM, pump, power/grounds", "Ask for a power/ground voltage-drop test and any TSB for a reflash.", "$200–$1,200", "soon", false),
  B0028: entry("B0028", "Right passenger airbag deployment circuit", "An airbag circuit is open or shorted. The light means the bag on that circuit may not fire. This is a safety item — not a stereo shop guess.", "Clockspring/connector, bag, module", "Ask which circuit and whether they found a yellow connector unplugged after a seat or dash job. Do not probe airbag circuits yourself.", "Diagnosis $80–$160; repair $150–$1,200", "urgent", false),
  B0051: entry("B0051", "Seat-belt pretensioner circuit", "A pretensioner circuit fault. After a prior wreck this is common. The belt may not cinch in a crash.", "Pretensioner, connector, SRS module", "Ask for the exact circuit and a quote that includes the module scan after repair.", "$150–$700", "urgent", false),
  B1325: entry("B1325", "Control-module power / battery", "A body module is seeing low or unstable voltage. Charge system first.", "Battery, grounds, module power", "Ask for charging-system numbers before a module replacement.", "$20–$380", "soon", true),
  U0073: entry("U0073", "Control-module communication bus off", "Modules cannot talk to each other on the CAN bus. A shorted module, a damaged harness, or low voltage. This is electrical diagnosis time, not a parts list.", "CAN wiring, a shorted module, voltage", "Authorize a diagnostic hour. Ask which high/low CAN pair is shorted and at which splice.", "$80–$600 typical diagnosis; parts extra", "urgent", false),
  U0100: entry("U0100", "Lost communication with ECM / PCM", "The network cannot hear the engine computer. Power, grounds, or a dead ECM — start at fuses.", "ECM power/grounds, CAN, ECM", "Ask for voltage at the ECM power pins and whether other modules are also silent.", "$80–$1,400", "urgent", false),
  U0101: entry("U0101", "Lost communication with TCM", "The transmission module is silent. Same rule as U0100: power and network first.", "TCM power, CAN, TCM", "Ask whether the trans has power and if U-codes are clustered (bus-wide) or lone.", "$80–$1,200", "soon", false),
  U0121: entry("U0121", "Lost communication with ABS", "The ABS module is offline. Wheel-speed and stability control will drop out.", "ABS power, CAN, module", "Ask for fuse/power at the ABS module before a replacement.", "$80–$1,100", "soon", false),
  U0140: entry("U0140", "Lost communication with BCM", "The body computer is silent. Lights, locks, and security can all act haunted. Voltage and a sleeping BCM are common.", "BCM power, CAN, battery", "Ask them to check battery state-of-charge and BCM power pins before quoting the module.", "$80–$900", "soon", false),
  U0155: entry("U0155", "Lost communication with instrument cluster", "The cluster is offline. Speedo/gauges dark. Often the cluster itself or its network splice.", "Cluster, CAN, power", "Ask if other U-codes came with it — a single U0155 is more likely the cluster than the whole bus.", "$80–$700", "soon", false),
};

function entry(
  code: string,
  title: string,
  plainEnglish: string,
  typicalCause: string,
  askTheShop: string,
  costBand: string,
  severity: DtcSeverity,
  diySafe: boolean,
): DtcEntry {
  return { code, title, plainEnglish, typicalCause, askTheShop, costBand, severity, diySafe };
}

const SYSTEM_NAME = {
  P: "powertrain (engine / transmission)",
  C: "chassis (ABS / brakes / suspension)",
  B: "body (airbags, seats, comfort)",
  U: "network (modules talking to each other)",
} as const;

const P0_SUBSYSTEM: Record<string, string> = {
  "0": "fuel and air metering",
  "1": "fuel and air metering",
  "2": "fuel and air (injector circuit)",
  "3": "ignition or misfire",
  "4": "auxiliary emissions (EVAP, EGR, catalyst)",
  "5": "speed, idle, or auxiliary inputs",
  "6": "computer or output circuit",
  "7": "transmission",
  "8": "transmission",
  "9": "input / output, transmission or hybrid",
  A: "hybrid / electric drive",
};

export function normalizeDtc(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function isPlausibleDtc(code: string): boolean {
  return /^[PCBU][0-3][0-9A-F]{3}$/.test(code);
}

export interface GenericDtc {
  system: string;
  generic: boolean;
  subsystem: string;
  hint: string;
}

export function decodeGeneric(code: string): GenericDtc | null {
  if (!isPlausibleDtc(code)) return null;
  const letter = code[0] as keyof typeof SYSTEM_NAME;
  const generic = code[1] === "0" || code[1] === "2";
  const subsystemKey = code[2];
  const subsystem =
    letter === "P"
      ? P0_SUBSYSTEM[subsystemKey] ?? "unspecified powertrain circuit"
      : letter === "C"
        ? "ABS, brake, or suspension circuit"
        : letter === "B"
          ? "body / SRS / comfort circuit"
          : "module communication";

  return {
    system: SYSTEM_NAME[letter],
    generic,
    subsystem,
    hint: generic
      ? "This is an SAE-generic layout. The number is real even if our dictionary has no paragraph yet."
      : "This is a manufacturer-specific code. The shop's factory software will have the official title — ask them to print it.",
  };
}

export interface DtcLookupResult {
  code: string;
  valid: boolean;
  entry: DtcEntry | null;
  generic: GenericDtc | null;
  relatedRecalls: RecallRecord[];
  error?: string;
}

export function lookupDtc(raw: string, recalls: RecallRecord[] = []): DtcLookupResult {
  const code = normalizeDtc(raw);
  if (!code) {
    return { code, valid: false, entry: null, generic: null, relatedRecalls: [], error: "Type a code like P0420 or C0035." };
  }
  if (!isPlausibleDtc(code)) {
    return {
      code,
      valid: false,
      entry: null,
      generic: null,
      relatedRecalls: [],
      error: "Use the 5-character form from the scanner: letter P/C/B/U plus four characters (example P0300).",
    };
  }

  const entryHit = BOOK[code] ?? null;
  const relatedRecalls = recalls.filter((recall) => recallMatchesCode(recall, code, entryHit));

  return {
    code,
    valid: true,
    entry: entryHit,
    generic: decodeGeneric(code),
    relatedRecalls,
  };
}

function recallMatchesCode(recall: RecallRecord, code: string, entry: DtcEntry | null): boolean {
  const blob = `${recall.component} ${recall.summary} ${recall.consequence}`.toLowerCase();
  if (code.startsWith("P042") || code.startsWith("P043")) return /catalyst|converters?|exhaust/.test(blob);
  if (code.startsWith("P030") || code === "P0316") return /ignition|misfire|fuel|engine/.test(blob);
  if (code.startsWith("P04") || code.startsWith("P044") || code.startsWith("P045")) {
    return /fuel|evap|vapor|canister|emission/.test(blob);
  }
  if (code.startsWith("C") || /brake|abs/.test(entry?.title ?? "")) return /brake|abs|stability|steering/.test(blob);
  if (code.startsWith("B00") || code.startsWith("B005")) return /air bag|airbag|seat belt|pretension/.test(blob);
  if (code.startsWith("U")) return /software|module|instrument|electrical/.test(blob);
  if (entry) {
    const words = entry.title.toLowerCase().split(/\s+/).filter((word) => word.length > 4);
    return words.some((word) => blob.includes(word));
  }
  return false;
}

export const SAMPLE_DTCS = ["P0420", "P0171", "P0300", "P0128", "P0455", "P0700", "C0035", "U0100"] as const;
