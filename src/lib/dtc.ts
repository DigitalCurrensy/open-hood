import { dtcSayThis, mergeCoreBook } from "@/lib/dtc-catalog";
import type { DtcEntry, DtcSeverity, RecallRecord } from "@/lib/types";

const CORE_BOOK: Record<string, DtcEntry> = {
  P0010: entry("P0010", "Camshaft position actuator circuit", "The computer cannot control the variable-valve actuator on one bank. Often a dirty oil-control valve or low oil, not a dead engine.", "Oil-control solenoid, oil level/quality, wiring", "Ask them to check oil level and the screen on the VVT solenoid before quoting a cam or timing job.", "$120–$450 solenoid; $80–$160 diagnosis", "soon", true),
  P0011: entry("P0011", "Camshaft timing over-advanced", "The cam is arriving earlier than commanded. Sludged oil or a stuck actuator is more common than a jumped chain on a first visit.", "Oil, VVT solenoid, timing chain stretch", "Ask for a cam-correlation test and oil condition notes before authorizing a chain.", "$150–$1,800 depending on solenoid vs chain", "soon", false),
  P0012: entry("P0012", "Camshaft timing over-retarded", "The cam is arriving late. Sludged oil or a stuck oil-control valve first; chain stretch is the expensive branch.", "Oil, VVT actuator, timing chain", "Ask for the cam-correlation degrees before anyone opens the front of the engine.", "$150–$1,800", "soon", false),
  P0014: entry("P0014", "Exhaust camshaft timing over-advanced", "The exhaust cam is early. Oil control and that bank's exhaust VVT unit are the short list.", "Oil, exhaust VVT solenoid, actuator", "Ask them not to replace intake and exhaust actuators as a pair unless both failed a test.", "$150–$900", "soon", false),
  P0016: entry("P0016", "Crank / cam correlation", "The computer sees the crank and cam sensors disagree. That can be a $40 sensor — or a jumped timing chain. The test decides.", "Sensor, reluctor, timing chain/belt", "Ask which sensor waveform failed and whether chain slack was measured. Do not pre-approve a motor.", "$80–$2,500", "urgent", false),
  P0017: entry("P0017", "Crank / cam correlation (exhaust side)", "Crank and exhaust cam disagree. Sensor versus mechanical is still the fork in the road.", "CMP sensor, tone ring, timing set", "Ask for the scope print before anyone quotes a chain.", "$80–$2,500", "urgent", false),
  P0021: entry("P0021", "Camshaft timing over-advanced (Bank 2)", "Bank 2's cam is early. If Bank 1 is clean, that bank's oil-control valve is the cheap end of this.", "Oil, Bank 2 VVT solenoid, timing set", "Ask why both banks need hardware when only one bank set a code.", "$150–$1,800", "soon", false),
  P0030: entry("P0030", "O2 heater control circuit (B1S1)", "The computer cannot drive the heater inside the upstream oxygen sensor. Fuel control stays sloppy until the sensor warms up. This is not a converter.", "O2 heater, fuse, heater driver circuit", "Ask for the heater ohms and which bank/sensor before any parts order.", "$110–$360", "soon", false),
  P0031: entry("P0031", "O2 heater circuit low (B1S1)", "The upstream sensor's heater circuit reads low or shorted. Often the sensor, sometimes a chafed wire.", "O2 heater, wiring, connector", "Ask them to unplug the sensor and re-measure at the harness before buying the part.", "$110–$360", "soon", false),
  P0032: entry("P0032", "O2 heater circuit high (B1S1)", "The upstream heater circuit reads high or open. A blown fuse counts, and so does a broken wire.", "Fuse, O2 heater, wiring", "Ask for the fuse and the harness reading before the sensor goes on the ticket.", "$40–$360", "soon", false),
  P0037: entry("P0037", "O2 heater circuit low (B1S2)", "The rear sensor's heater is shorted or low. Emissions monitors may not finish. It is not a drivability crisis.", "Downstream O2 heater, wiring", "Ask which sensor position (B1S2) so nobody replaces all four.", "$110–$340", "monitor", false),
  P0051: entry("P0051", "O2 heater circuit low (B2S1)", "Same heater story on the other bank's upstream sensor.", "O2 heater Bank 2, fuse, wiring", "Ask which side of this engine is Bank 2 on paper — it is not always the side you would guess.", "$110–$380", "soon", false),
  P0087: entry("P0087", "Fuel rail pressure too low", "The rail is starving. On a gasoline GDI car this is often a pump or filter. On diesel it can be air in the system.", "Fuel pump, filter, leak, pressure regulator", "Ask for commanded vs actual rail PSI on a scan printout.", "$200–$1,400", "urgent", false),
  P0088: entry("P0088", "Fuel rail pressure too high", "The rail is over-pressured. A stuck regulator or a blocked return line — not a tune-up.", "Pressure regulator, return line, pump control", "Ask for commanded vs actual rail PSI at idle and under load before a pump and a regulator both land on the ticket.", "$200–$1,200", "urgent", false),
  P0100: entry("P0100", "MAF sensor circuit", "The airflow signal is missing or out of range entirely. Connector and power come before the sensor.", "MAF, connector, wiring", "Ask whether the sensor has power and ground before anyone buys the sensor.", "$80–$380", "soon", true),
  P0101: entry("P0101", "MAF sensor range / performance", "The airflow meter is reporting a value that does not match RPM and load. A dirty MAF or an intake leak is the usual first look.", "MAF contamination, intake boot crack, unmetered air", "Ask them to graph MAF g/s at idle and 2500 RPM against the spec sheet — not just 'replace the sensor.'", "$80–$380", "soon", true),
  P0102: entry("P0102", "MAF sensor low input", "The meter is seeing almost no air, or the wire is broken. Unplugged connectors after an air-filter job are common.", "MAF, connector, air box", "Ask them to wiggle-test the connector with the meter live.", "$80–$320", "soon", true),
  P0106: entry("P0106", "MAP sensor range / performance", "Manifold pressure does not match the throttle opening. A cracked vacuum hose or a lazy sensor.", "MAP sensor, vacuum hose, intake leak", "Ask for key-on engine-off MAP vs barometric pressure, then a smoke test.", "$60–$320", "soon", true),
  P0113: entry("P0113", "Intake air temperature high", "The IAT circuit is open or the sensor thinks the air is impossibly hot. A $20 sensor or a chewed wire.", "IAT / MAF combo sensor, wiring", "Ask for the live temperature reading vs a thermometer at the air box.", "$20–$180", "monitor", true),
  P0118: entry("P0118", "Coolant temperature circuit high / open", "The coolant-temp circuit looks open. Gauge, fan, and fuel strategy can all misbehave. This is electrical until proven otherwise.", "ECT sensor, wiring, connector", "Ask for live coolant temp against a probe reading before a thermostat lands on the invoice.", "$40–$260", "soon", true),
  P0121: entry("P0121", "Throttle position sensor range / performance", "The throttle-position signal does not match pedal or airflow. Limp mode is common.", "Throttle body, TPS circuit, pedal sensor", "Ask for the dual-signal graph. A new computer is not the first move.", "$120–$520", "soon", false),
  P0128: entry("P0128", "Coolant thermostat (temp below range)", "The engine is not reaching full temperature. Almost always a thermostat stuck open — not a water pump and not a 'flush package.'", "Thermostat, coolant level, ECT sensor", "Ask for a temperature graph to 195–210°F. A flush is not the repair unless they found rust or oil in the coolant.", "$150–$380", "soon", false),
  P0130: entry("P0130", "O2 sensor circuit (B1S1)", "The upstream oxygen-sensor circuit is unhappy. Fuel trim will drift.", "Upstream O2, exhaust leak, wiring", "Ask for the heater ohms and a leak check before a converter is even mentioned.", "$110–$400", "soon", false),
  P0131: entry("P0131", "O2 sensor low voltage (B1S1)", "The upstream sensor is pinned low — or the engine is genuinely lean. Those are two different repairs.", "O2 sensor, unmetered air, wiring", "Ask them to force the mixture rich and watch the sensor. If it never moves, it is the sensor.", "$110–$420", "soon", false),
  P0132: entry("P0132", "O2 sensor high voltage (B1S1)", "The upstream sensor reads pinned rich. A soaked connector or a real rich condition.", "O2 sensor, connector, fuel pressure", "Ask for the fuel-trim numbers next to the sensor reading. One without the other proves nothing.", "$110–$420", "soon", false),
  P0133: entry("P0133", "O2 sensor slow response", "The upstream oxygen sensor is lazy. It may be old, or a small exhaust leak is fooling it.", "O2 sensor, exhaust leak before the sensor", "Ask them to smoke or listen for a manifold leak before selling a catalytic converter.", "$120–$420", "soon", false),
  P0134: entry("P0134", "O2 sensor no activity (B1S1)", "The upstream sensor is asleep — the signal is flat. Often the sensor after high mileage, sometimes just the heater fuse.", "O2 sensor, heater fuse, wiring", "Ask whether the heater fuse is good. A dead heater makes a healthy sensor look dead.", "$110–$400", "soon", false),
  P0135: entry("P0135", "O2 sensor heater circuit", "The heater inside the oxygen sensor failed. The car will run, but fuel trim will drift. This is a parts-bin sensor, not a cat.", "O2 heater, fuse, wiring", "Ask for the heater-circuit ohms and which bank/sensor (B1S1 vs B1S2).", "$110–$360", "soon", false),
  P0136: entry("P0136", "O2 sensor circuit (B1S2)", "The downstream sensor circuit failed. This sensor watches the converter; it does not convict it.", "Downstream O2, wiring, connector", "Ask them to fix the sensor and re-run the monitor before quoting a brick.", "$110–$340", "soon", false),
  P0137: entry("P0137", "O2 sensor low voltage (B1S2)", "The rear sensor reads low. An exhaust leak after the converter can do exactly this.", "Rear O2, exhaust leak after the cat", "Ask for a leak check at the flex pipe and rear flange.", "$80–$340", "monitor", false),
  P0138: entry("P0138", "O2 sensor high voltage (B1S2)", "The downstream sensor is pinned rich or shorted. Sometimes the sensor; sometimes a soaked connector.", "Downstream O2, wiring, catalyst", "Ask them to prove the brick separately. A high rear sensor is not a converter invoice.", "$110–$340", "soon", false),
  P0139: entry("P0139", "O2 sensor slow response (B1S2)", "The rear sensor is lazy. Age is the usual answer, and it is not a catalyst verdict.", "Rear O2 sensor, exhaust leak", "Ask what the rear sensor is supposed to do on this monitor and whether it switched at all.", "$110–$340", "monitor", false),
  P0140: entry("P0140", "O2 sensor no activity (B1S2)", "The rear sensor is flat-lined. Sensor or heater circuit. The converter is a separate test.", "Rear O2, heater fuse, wiring", "Ask them not to bundle a converter into a rear-sensor repair.", "$110–$340", "monitor", false),
  P0141: entry("P0141", "O2 heater circuit (B1S2)", "The rear oxygen-sensor heater failed. Emissions monitors may not set. Not a drivability emergency.", "Downstream O2 heater, fuse", "Ask for the heater ohms on B1S2 only.", "$110–$340", "monitor", false),
  P0150: entry("P0150", "O2 sensor circuit (B2S1)", "Bank 2's upstream sensor circuit failed. Same rules as Bank 1 — just the other side of the engine.", "Upstream O2 Bank 2, wiring, exhaust leak", "Ask which side of this engine is Bank 2 on paper before parts are ordered.", "$110–$420", "soon", false),
  P0151: entry("P0151", "O2 sensor low voltage (B2S1)", "Bank 2 upstream reads pinned lean. The sensor, or a real lean condition on that bank.", "O2 Bank 2, intake leak, fuel supply", "Ask for both banks' fuel trims side by side.", "$110–$450", "soon", false),
  P0155: entry("P0155", "O2 heater circuit (B2S1)", "Bank 2's upstream heater failed. A sensor and maybe a fuse — not a converter.", "O2 heater Bank 2, fuse, wiring", "Ask for the heater reading and the bank identification in writing.", "$110–$400", "soon", false),
  P0157: entry("P0157", "O2 sensor low voltage (B2S2)", "Bank 2's rear sensor reads low. Exhaust leaks after the cat mimic this exactly.", "Rear O2 Bank 2, exhaust leak", "Ask for a leak check before a second converter gets quoted.", "$80–$340", "monitor", false),
  P0161: entry("P0161", "O2 heater circuit (B2S2)", "Bank 2's rear heater failed. Monitor readiness suffers; the car drives.", "Rear O2 heater Bank 2, fuse", "Ask for the specific sensor position in writing so the right one gets replaced.", "$110–$340", "monitor", false),
  P0171: entry("P0171", "System too lean (Bank 1)", "The computer is adding extra fuel because the mixture looks skinny. Vacuum leaks and dirty MAF beat 'bad injectors' on most first visits.", "Vacuum leak, MAF, fuel pressure, PCV", "Ask for short- and long-term fuel trims at idle vs 2500 RPM. A leak often shows only at idle.", "$80–$450; injectors only after a pressure/leak test", "soon", true),
  P0172: entry("P0172", "System too rich (Bank 1)", "The computer is pulling fuel out. A leaking injector, bad fuel-pressure regulator, or a stuck purge valve is more likely than 'needs a tune-up.'", "Injector leak, purge valve, fuel pressure", "Ask for a fuel-pressure hold test and a smoke test of the EVAP purge path.", "$120–$700", "soon", false),
  P0174: entry("P0174", "System too lean (Bank 2)", "Same lean story on the other bank. Both banks lean usually means unmetered air or low fuel pressure, not two failed cats.", "Vacuum leak, MAF, fuel pump", "If P0171 and P0174 are together, ask them to start at the intake boot and fuel pressure — not four O2 sensors.", "$80–$500", "soon", true),
  P0175: entry("P0175", "System too rich (Bank 2)", "Bank 2 is pulling fuel out. A leaking injector, high fuel pressure, or a stuck purge valve.", "Injector leak, fuel pressure, purge valve", "Ask for a fuel-pressure hold test and the purge command before a set of injectors.", "$120–$700", "soon", false),
  P0201: entry("P0201", "Injector circuit — cylinder 1", "The computer cannot drive injector 1. A misfire on that hole usually rides along.", "Injector 1, harness, ECM driver", "Ask for injector resistance and power at the connector before anyone mentions an ECM.", "$120–$650", "soon", false),
  P0202: entry("P0202", "Injector circuit — cylinder 2", "The computer cannot drive injector 2. Expect a misfire on that hole.", "Injector 2, harness, ECM driver", "Ask for the injector's resistance and its power feed before a computer.", "$120–$650", "soon", false),
  P0203: entry("P0203", "Injector circuit — cylinder 3", "Injector 3 is not being driven. One hole, one circuit — not a fuel-system package.", "Injector 3, harness, ECM driver", "Ask which measurement picked the injector over the wiring.", "$120–$650", "soon", false),
  P0204: entry("P0204", "Injector circuit — cylinder 4", "Injector 4 is not being driven. Isolate the circuit before buying a set of four.", "Injector 4, harness, ECM driver", "Ask them to swap-test or ohm the injector before a full set is quoted.", "$120–$650", "soon", false),
  P0205: entry("P0205", "Injector circuit — cylinder 5", "Injector 5 is not being driven. On a V6 that means one bank, one hole.", "Injector 5, harness, ECM driver", "Ask for the resistance and the power feed on cylinder 5 only.", "$120–$700", "soon", false),
  P0206: entry("P0206", "Injector circuit — cylinder 6", "Injector 6 is not being driven. Still a single-circuit problem until proven otherwise.", "Injector 6, harness, ECM driver", "Ask why six injectors are on the estimate when one circuit failed.", "$120–$700", "soon", false),
  P0207: entry("P0207", "Injector circuit — cylinder 7", "Injector 7 is not being driven. Intake-manifold labor is usually the bigger number on a V8.", "Injector 7, harness, ECM driver", "Ask for the labor split: is the intake coming off anyway, or just one injector?", "$150–$900", "soon", false),
  P0208: entry("P0208", "Injector circuit — cylinder 8", "Injector 8 is not being driven. One circuit, but check the labor picture before you agree.", "Injector 8, harness, ECM driver", "Ask whether a set makes sense only because the manifold is already off — and get that in writing.", "$150–$900", "soon", false),
  P0234: entry("P0234", "Turbo / supercharger overboost", "Boost went past the limit. A stuck wastegate or a hose off the control solenoid is more common than a dead turbo.", "Wastegate/bypass, boost solenoid, charge pipes", "Ask for commanded vs actual boost and whether the wastegate actually moves.", "$120–$1,600", "urgent", false),
  P0299: entry("P0299", "Turbo / supercharger underboost", "The engine is not making the boost it was told to make. A leaking charge pipe beats a new turbo on most first visits.", "Charge pipes, wastegate stuck open, turbo", "Ask for a pressurized boost-leak test before anyone quotes a cartridge.", "$120–$2,200", "soon", false),
  P0300: entry("P0300", "Random / multiple misfire", "Cylinders are stumbling with no single favorite. Coils, plugs, vacuum leaks, and low fuel pressure are the short list. A 'tune-up package' is not a diagnosis.", "Plugs, coils, leak, fuel, compression", "Ask for a misfire count per cylinder and a power-balance or compression check before a parts cannon.", "$150–$1,200", "urgent", false),
  P0301: entry("P0301", "Cylinder 1 misfire", "Cylinder 1 is the one stumbling. Swap the coil to another hole before you buy four coils.", "Coil, plug, injector, compression on cyl 1", "Ask them to swap the #1 coil with #3 (or another) and see if the code follows.", "$80–$400 for coil/plug; more if injector or mechanical", "soon", false),
  P0302: entry("P0302", "Cylinder 2 misfire", "Same as a single-cylinder misfire, just hole 2. The swap test still applies.", "Coil, plug, injector, compression", "Ask for the swap test and the misfire counts, not a full ignition kit by default.", "$80–$400 typical coil/plug", "soon", false),
  P0303: entry("P0303", "Cylinder 3 misfire", "Cylinder 3 is misfiring. Treat it like P0301 — isolate the hole before replacing a set.", "Coil, plug, injector, compression", "Ask which test proved the part, not 'these coils fail a lot on this car.'", "$80–$400 typical", "soon", false),
  P0304: entry("P0304", "Cylinder 4 misfire", "Cylinder 4 is misfiring. Same isolate-then-replace rule.", "Coil, plug, injector, compression", "Ask for misfire counts and a coil swap before a four-pack.", "$80–$400 typical", "soon", false),
  P0305: entry("P0305", "Cylinder 5 misfire", "A V6/V8 hole is stumbling. Still a single-cylinder problem until proven otherwise.", "Coil, plug, injector, compression", "Ask them not to quote six coils because one hole failed.", "$80–$450 typical", "soon", false),
  P0306: entry("P0306", "Cylinder 6 misfire", "Cylinder 6 misfire. Isolate first.", "Coil, plug, injector, compression", "Ask for the swap or power-balance result in writing.", "$80–$450 typical", "soon", false),
  P0307: entry("P0307", "Cylinder 7 misfire", "Cylinder 7 on a V8 is stumbling. Same single-hole rule as any other misfire.", "Coil, plug, injector, compression", "Ask why a set of eight is on the estimate when one counter incremented.", "$80–$500 typical", "soon", false),
  P0308: entry("P0308", "Cylinder 8 misfire", "Cylinder 8 misfire. Isolate first; a set is a sales habit, not a test.", "Coil, plug, injector, compression", "Ask for the swap or compression result on cylinder 8.", "$80–$500 typical", "soon", false),
  P0309: entry("P0309", "Cylinder 9 misfire", "A V10/V12 hole is stumbling. Still one cylinder until a test says otherwise.", "Coil, plug, injector, compression", "Ask for misfire counts per hole before any set pricing.", "$100–$600 typical", "soon", false),
  P0310: entry("P0310", "Cylinder 10 misfire", "Cylinder 10 misfire on a big engine. Isolate the hole; the labor is the expensive part.", "Coil, plug, injector, compression", "Ask what has to come off to reach that cylinder before you agree to anything.", "$100–$600 typical", "soon", false),
  P0311: entry("P0311", "Cylinder 11 misfire", "Cylinder 11 misfire. One hole, one test.", "Coil, plug, injector, compression", "Ask for the power-balance numbers, not a full ignition quote.", "$100–$650 typical", "soon", false),
  P0312: entry("P0312", "Cylinder 12 misfire", "Cylinder 12 misfire. Same rule, bigger labor estimate.", "Coil, plug, injector, compression", "Ask for the misfire counts and the access labor separately.", "$100–$650 typical", "soon", false),
  P0316: entry("P0316", "Misfire during first 1,000 revolutions", "It stumbled right after start. Coolant in a cylinder (head gasket) or a weak coil when cold are both on the list — they are not the same repair.", "Cold coil, flooded start, head gasket", "Ask for a chemical block test or exhaust-gas-in-coolant test if it only happens cold and uses coolant.", "$80–$2,000", "soon", false),
  P0325: entry("P0325", "Knock sensor circuit", "The knock sensor circuit is open or noisy. The computer may pull timing and the car will feel dull. It is not automatically a spun bearing.", "Knock sensor, harness, connector", "Ask for a circuit test before an engine estimate.", "$120–$480", "soon", false),
  P0335: entry("P0335", "Crankshaft position sensor", "The computer lost the crank signal. No-start or stall is common. A $40–$150 sensor is the usual ending — after they confirm the tone ring is intact.", "CKP sensor, connector, reluctor wheel", "Ask whether it is a hard no-signal or an intermittent drop, and if the reluctor is damaged.", "$80–$350", "urgent", false),
  P0340: entry("P0340", "Camshaft position sensor", "Cam sensor circuit fault. Can be the sensor, the oil-soaked connector, or (less often) the tone ring on the cam.", "CMP sensor, wiring, cam tone ring", "Ask them to scope the signal before quoting a timing job.", "$80–$380", "soon", false),
  P0341: entry("P0341", "Camshaft position sensor range / performance", "The cam signal is present but implausible. Wiring, a damaged tone ring, or a stretched chain.", "CMP sensor, tone ring, timing set", "Ask for the waveform first, then the correlation degrees. Those are two different bills.", "$80–$1,800", "soon", false),
  P0350: entry("P0350", "Ignition coil primary / secondary circuit", "A coil circuit failed, but the computer did not name the hole. Isolate before buying a set.", "Coil, connector, ECM driver", "Ask which cylinder incremented the misfire counter.", "$80–$450", "soon", false),
  P0351: entry("P0351", "Ignition coil A primary", "The computer cannot drive coil A — usually cylinder 1, but ask them to confirm the coil order on this engine.", "Coil A, connector, ECM driver", "Ask them to swap coil A to another hole and see if the code follows.", "$80–$450", "soon", false),
  P0352: entry("P0352", "Ignition coil B primary", "Coil B's circuit failed. Which cylinder that is depends on the engine — get it named.", "Coil B, connector, ECM driver", "Ask which physical cylinder coil B feeds before parts are ordered.", "$80–$450", "soon", false),
  P0353: entry("P0353", "Ignition coil C primary", "Coil C's circuit failed. One circuit, one coil, until a test says otherwise.", "Coil C, connector, ECM driver", "Ask for the swap test result, not a set price.", "$80–$450", "soon", false),
  P0354: entry("P0354", "Ignition coil D primary", "Coil D's circuit failed. The connector and the driver wire are free to check.", "Coil D, connector, ECM driver", "Ask whether power and the trigger wire were both verified at the coil.", "$80–$450", "soon", false),
  P0355: entry("P0355", "Ignition coil E primary", "Coil E's circuit failed. On a V6/V8 this is one bank, one hole.", "Coil E, connector, ECM driver", "Ask which cylinder coil E serves and for the swap result.", "$80–$480", "soon", false),
  P0356: entry("P0356", "Ignition coil F primary", "Coil F's circuit failed. Isolate before a bank of coils gets quoted.", "Coil F, connector, ECM driver", "Ask why more than one coil is on the estimate.", "$80–$480", "soon", false),
  P0357: entry("P0357", "Ignition coil G primary", "Coil G's circuit failed — a V8 hole. Same isolate-first rule.", "Coil G, connector, ECM driver", "Ask for the misfire counter and the swap test.", "$80–$500", "soon", false),
  P0358: entry("P0358", "Ignition coil H primary", "Coil H's circuit failed. One circuit. A set of eight is a convenience, not a diagnosis.", "Coil H, connector, ECM driver", "Ask for the test that picked coil H specifically.", "$80–$500", "soon", false),
  P0400: entry("P0400", "EGR flow malfunction", "Exhaust-gas recirculation is not flowing on command. Carbon in the passages is the usual answer — not a converter.", "EGR valve, passages, control solenoid", "Ask whether they cleaned the passages or only swapped the valve.", "$120–$550", "soon", false),
  P0401: entry("P0401", "EGR insufficient flow", "Exhaust gas is not entering the intake as commanded. A carboned EGR valve or a clogged passage is typical — not a new catalytic converter.", "EGR valve, passages, DPFE/sensor", "Ask for a commanded-vs-actual EGR PID and whether they cleaned passages or only swapped the valve.", "$120–$550", "soon", false),
  P0402: entry("P0402", "EGR excessive flow detected", "Too much exhaust is getting into the intake — usually a valve held off its seat by carbon. Rough idle and stalling follow.", "EGR valve stuck open, carbon, gasket", "Ask for the commanded-vs-actual EGR numbers at idle.", "$120–$550", "soon", false),
  P0403: entry("P0403", "EGR control circuit", "The EGR solenoid or motor circuit failed. Electrical first, carbon second.", "EGR solenoid/motor, wiring, connector", "Ask for the circuit test result, not a menu-priced 'EGR service.'", "$120–$500", "soon", false),
  P0404: entry("P0404", "EGR control circuit range / performance", "The EGR valve is not landing where it was commanded. A sticky valve or a lying position sensor.", "EGR valve, position sensor, carbon", "Ask for a position sweep on the scan tool before the valve is replaced twice.", "$150–$600", "soon", false),
  P0405: entry("P0405", "EGR position sensor low", "The EGR position signal reads low or open. A connector, a wire, or the sensor inside the valve.", "EGR position sensor, wiring, connector", "Ask them to wiggle-test the connector with the PID live.", "$100–$500", "soon", false),
  P0420: entry("P0420", "Catalyst efficiency below threshold (Bank 1)", "The downstream O2 sensor looks too much like the upstream one. That can be a dying catalyst — or an exhaust leak, a lazy upstream sensor, or a misfire that poisoned the brick.", "Cat, O2 sensors, exhaust leak, misfire", "Ask them to verify no misfires, no exhaust leaks, and to graph both O2 sensors before quoting a converter. A converter is $800–$2,500; a sensor is not.", "$200–$2,500", "soon", false),
  P0430: entry("P0430", "Catalyst efficiency below threshold (Bank 2)", "Same catalyst-efficiency story on the other bank. Same rule: prove the brick, don't assume it.", "Cat, O2, leak, misfire", "Ask for the same graph-and-leak check as P0420.", "$200–$2,500", "soon", false),
  P0440: entry("P0440", "EVAP system fault", "The vapor-recovery system failed a self-test. A loose gas cap still causes this. Do not authorize a charcoal-canister job from the code alone.", "Gas cap, purge/vent valves, hose, canister", "Ask them to smoke-test the EVAP system and tell you the leak location in inches from a named part.", "$0 (cap) – $450", "monitor", true),
  P0441: entry("P0441", "EVAP purge flow incorrect", "Vapor is not moving through the purge path the way it was commanded. A stuck purge valve or a disconnected hose.", "Purge valve, hoses, canister path", "Ask them to command the purge valve, confirm flow, then smoke the path.", "$100–$450", "monitor", true),
  P0442: entry("P0442", "EVAP small leak", "A small leak in the vapor system — often a cap, a cracked hose, or a purge valve. Not an engine problem.", "Cap, hose, purge/vent", "Ask for the smoke-test photo of the leak. 'Needs a canister' without a leak location is a stall.", "$0–$380", "monitor", true),
  P0443: entry("P0443", "EVAP purge valve circuit", "The purge solenoid circuit failed. The valve usually lives on the engine. The car is safe to drive.", "Purge solenoid, wiring, connector", "Ask them not to replace the canister for a purge-circuit code.", "$100–$400", "monitor", true),
  P0446: entry("P0446", "EVAP vent control", "The vent valve (usually near the canister / spare-tire well) is stuck or unplugged. Common after rodent damage.", "Vent valve, wiring, canister", "Ask where the vent solenoid lives on this VIN and whether they found chewed wires.", "$120–$420", "monitor", false),
  P0449: entry("P0449", "EVAP vent valve / solenoid circuit", "The vent solenoid circuit failed. It lives near the canister — a favorite spot for rodents and road salt.", "Vent solenoid, wiring, canister area", "Ask where the vent valve lives on this VIN and whether the wires are chewed.", "$120–$420", "monitor", false),
  P0455: entry("P0455", "EVAP large leak", "A big vapor leak. Loose cap, unclipped hose after a filter job, or a split canister. The car is safe to drive; the light is a leak flag, not a breakdown.", "Cap, hose, filler neck, canister", "Ask them to start at the cap and filler neck before quoting the canister.", "$0–$450", "monitor", true),
  P0456: entry("P0456", "EVAP very small leak", "A pinhole leak. These take time to find. Paying for a proper smoke test is cheaper than three guess-parts.", "Cap seal, pinhole hose, purge", "Authorize a smoke/diagnostic hour. Do not pre-approve a parts list.", "$80–$350", "monitor", false),
  P0457: entry("P0457", "EVAP leak — fuel cap loose or off", "The computer thinks the fuel cap was left loose. Tighten it, clear it, drive it, retest — before any parts.", "Gas cap, filler-neck seal", "Ask for a retest after a drive cycle before a canister quote.", "$0–$120", "monitor", true),
  P0461: entry("P0461", "Fuel level sensor range / performance", "The tank sender is reading implausibly. The gauge lies and some emissions monitors will not run.", "Fuel level sender in the tank, wiring", "Ask for the live fuel-level PID vs an actual fill. Dropping a tank is labor — get the reading first.", "$150–$700", "monitor", false),
  P0463: entry("P0463", "Fuel level sensor high input", "The tank sender reads impossibly full. Usually the sender or its wiring, not the whole pump module.", "Fuel level sender, wiring, connector", "Ask whether the sender is sold separately from the pump on this VIN.", "$150–$800", "monitor", false),
  P0480: entry("P0480", "Cooling fan circuit", "The fan control circuit failed. Overheating risk if the fan never comes on — that is the urgency, not the code number.", "Fan motor, relay, control module", "Ask them to command the fan on with a scan tool and tell you if it spins.", "$80–$480", "soon", false),
  P0500: entry("P0500", "Vehicle speed sensor", "The computer lost road-speed. Speedometer, cruise, and shift quality can all suffer. ABS wheel-speed sensors sometimes share the signal.", "VSS, tone ring, ABS sensor, wiring", "Ask whether the cluster and the scan-tool speed agree, and which sensor they are replacing.", "$80–$380", "soon", false),
  P0505: entry("P0505", "Idle air control system", "The computer cannot hold the idle it commanded. Carbon, a vacuum leak, or an idle motor.", "Throttle body / IAC, vacuum leak, PCV", "Ask to see the throttle plate and the idle PID before and after a clean.", "$80–$420", "monitor", true),
  P0506: entry("P0506", "Idle RPM lower than expected", "Idle is dragging. A dirty throttle body, a vacuum leak, or a failing IAC/ETB motor. 'Throttle service' as a $200 menu item is only fair if they show the carbon.", "Throttle body, vacuum leak, IAC", "Ask to see the throttle plate and the idle PID before/after a clean.", "$80–$420", "monitor", true),
  P0507: entry("P0507", "Idle RPM higher than expected", "Idle is hunting high. Vacuum leak or a stuck idle control is the usual pair.", "Vacuum leak, throttle, PCV", "Ask for a smoke test if they want to replace the throttle body on the first visit.", "$80–$380", "monitor", true),
  P0520: entry("P0520", "Oil pressure sensor circuit", "The oil-pressure switch or sender circuit failed. Confirm actual oil pressure with a mechanical gauge before you authorize an engine.", "Sender, wiring, actual oil pressure", "Ask for a mechanical gauge reading in PSI at hot idle. A $25 sender is not a spun bearing.", "$40–$1,800", "urgent", false),
  P0562: entry("P0562", "System voltage low", "The electrical system is sagging. Battery, cables, or alternator — in that order. A 'computer' is last.", "Battery, grounds, alternator", "Ask for battery CCA / voltage during crank and charging voltage at 2,000 RPM.", "$20 (cables) – $380 (alternator)", "soon", true),
  P0606: entry("P0606", "ECM / PCM processor", "The engine computer failed an internal check. Sometimes it is a low-voltage event, not a $1,200 module.", "Power/grounds, software, ECM", "Ask them to verify battery/grounds and TSBs for a reflash before quoting a new ECM.", "$0 (reflash) – $1,400", "soon", false),
  P0700: entry("P0700", "Transmission control — request MIL", "This is a pointer, not a diagnosis. The transmission module stored a more specific code (P07xx / P27xx). Do not authorize a rebuild from P0700 alone.", "Whatever the TCM companion code says", "Ask them to read the TCM codes and give you that number. P0700 by itself is incomplete.", "Diagnosis $80–$160; repair varies", "soon", false),
  P0705: entry("P0705", "Transmission range sensor circuit (PRNDL)", "The computer cannot tell which gear you selected. No-start in Park, wrong-gear starts, or a dark shift indicator.", "Range sensor / neutral switch, linkage, wiring", "Ask for the range PID in each gear position. This is a switch job far more often than a transmission job.", "$150–$650", "soon", false),
  P0715: entry("P0715", "Input / turbine speed sensor", "The transmission cannot see input speed. Harsh shifts or limp mode follow. Sensor or harness first; rebuild last.", "ISS sensor, harness, TCM", "Ask for ISS vs OSS live data during a road test.", "$150–$650 sensor; more if internal", "soon", false),
  P0720: entry("P0720", "Output speed sensor", "The transmission cannot see output speed. Speedometer and shift scheduling suffer.", "OSS sensor, tone wheel, harness", "Ask whether the cluster speed still works and if the tone wheel is cracked.", "$150–$650", "soon", false),
  P0730: entry("P0730", "Incorrect gear ratio", "Commanded gear and output speed do not match. That can be a solenoid, low fluid, or worn clutches. Fluid condition is the first photo you want.", "Fluid level/condition, solenoid, clutches", "Ask for fluid photos and a stall or clutch-pack test before a $4,000 rebuild quote.", "$80–$4,500", "urgent", false),
  P0740: entry("P0740", "Torque converter clutch circuit", "The lock-up clutch in the converter is not applying or the solenoid circuit failed. A shudder at highway speed is the usual complaint.", "TCC solenoid, fluid, converter", "Ask whether they are quoting a solenoid, a fluid service, or a converter — and which test picked it.", "$200–$1,800", "soon", false),
  P0741: entry("P0741", "Torque converter clutch stuck off", "The converter is not locking up. Highway shudder, higher RPM at cruise, and extra heat. Fluid and the solenoid come before a converter.", "TCC solenoid, fluid level/condition, converter", "Ask for the TCC slip PID at steady cruise and a photo of the fluid.", "$200–$1,800", "soon", false),
  P0750: entry("P0750", "Shift solenoid A", "A shift solenoid circuit failed. Sometimes the solenoid; sometimes the valve-body connector. Not automatically a rebuilt transmission.", "Solenoid, valve body, harness", "Ask for the solenoid ohm test and whether the pan came down. A rebuild quote from this code alone is a reach.", "$250–$1,200 typical solenoid/valve-body", "soon", false),
  P0755: entry("P0755", "Shift solenoid B", "A second shift-solenoid circuit failed. Sometimes the solenoid, sometimes the valve-body connector.", "Shift solenoid B, valve body, harness", "Ask for the ohm test and whether the pan came down. One solenoid code is not a rebuild.", "$250–$1,200", "soon", false),
  P0A0F: entry("P0A0F", "Engine failed to start (hybrid)", "The hybrid system asked the gas engine to start and it did not. That can be the 12-volt battery, a hybrid start fault, or an ordinary engine problem.", "12V battery, hybrid start circuit, engine fuel/mechanical", "Ask for the 12V battery test and the freeze-frame before anyone says 'the hybrid battery.'", "$150–$3,000", "urgent", false),
  P0A7F: entry("P0A7F", "Hybrid battery pack deterioration", "The pack is measurably weaker than spec. This is a real, expensive repair — but ask for numbers, not adjectives.", "Hybrid battery modules, pack cooling fan/duct", "Ask for the block-voltage printout and whether the pack fan and its filter were cleaned first.", "$1,200–$4,500; confirm warranty and core", "soon", false),
  P0A80: entry("P0A80", "Hybrid battery degradation", "The hybrid pack can no longer hold the commanded charge. This is a real, expensive repair — get a capacity printout, not a verbal 'the battery is bad.'", "Hybrid battery modules, cooling fan", "Ask for the block-voltage printout and whether individual modules can be balanced vs a full pack.", "$1,200–$4,500 typical; confirm core/warranty", "soon", false),
  P0A93: entry("P0A93", "Inverter cooling system", "The hybrid/EV inverter is not being cooled. A pump, a radiator, or low coolant in the inverter loop — not engine coolant by default.", "Inverter pump, radiator, specific coolant", "Ask which loop they tested and the pump's commanded vs actual flow.", "$200–$900", "urgent", false),
  P1101: entry("P1101", "MAF / air-intake performance (maker)", "A manufacturer-specific airflow rationality code. Treat it like P0101 until they name a different test.", "MAF, intake leak, PCV", "Ask for the maker TSB and the MAF g/s numbers.", "$80–$380", "soon", true),
  P2002: entry("P2002", "Diesel particulate filter efficiency", "The DPF is not cleaning itself. Short trips, a failed pressure sensor, or a clogged filter. A 'delete' is illegal on a street vehicle in the US.", "DPF, pressure sensor, regen strategy", "Ask for soot-load % and last successful regen. Forced regen is cheaper than a filter if the brick is intact.", "$150 (regen) – $2,800 (filter)", "soon", false),
  P2015: entry("P2015", "Intake manifold runner position", "The swirl/runner flap is not where the computer commanded. Carbon or a cheap actuator motor.", "Runner actuator, carbon, sensor", "Ask whether they are cleaning the runners or only replacing the motor.", "$180–$700", "soon", false),
  P2096: entry("P2096", "Post-catalyst fuel trim lean", "The computer is trimming based on the downstream sensor. Often a small exhaust leak or a lazy O2 — not an automatic converter.", "Exhaust leak, O2, cat", "Ask for a leak check at the manifold and flex pipe before a converter.", "$80–$2,200", "soon", false),
  P2101: entry("P2101", "Throttle actuator motor circuit range", "The electronic throttle motor is not moving the way it was commanded. Limp mode is common.", "Throttle body motor, connector, wiring", "Ask for the commanded-vs-actual throttle graph. A relearn after cleaning is part of the job, not an extra.", "$180–$650", "urgent", false),
  P2119: entry("P2119", "Throttle closed-position performance", "The electronic throttle did not return to the learned closed stop. Carbon or a failing throttle body.", "Throttle body, adaptation, carbon", "Ask if they performed a throttle relearn after cleaning before quoting a new ETB.", "$80–$520", "soon", false),
  P2122: entry("P2122", "Accelerator pedal sensor D low input", "One of the two pedal signals reads low. The car may cap power. Usually the pedal assembly or its connector.", "Accelerator pedal sensor, connector, wiring", "Ask for both pedal signals graphed together, then the pedal — not the ECM.", "$150–$450", "urgent", false),
  P2135: entry("P2135", "Throttle / pedal sensor correlation", "The two throttle-position signals disagree. The car may go to limp mode. This is a safety circuit — do not ignore it, but it is usually the throttle body or pedal sensor, not the ECM.", "Throttle body, accelerator pedal sensor, wiring", "Ask which pair failed (TPS vs APP) and for the dual-signal graph.", "$180–$520", "urgent", false),
  P2176: entry("P2176", "Throttle actuator — idle position not learned", "The throttle never re-learned its closed stop, often after a battery change or a cleaning. A relearn is a procedure, not a part.", "Missed relearn, carbon, throttle body", "Ask whether the idle relearn was performed. Do not pay for a throttle body until it has been.", "$0 (relearn) – $520", "soon", false),
  P2181: entry("P2181", "Cooling system performance", "The engine is not heating or cooling on schedule. Thermostat and coolant level first.", "Thermostat, coolant, radiator, ECT", "Same rule as P0128: show the temperature curve.", "$150–$600", "soon", false),
  P2195: entry("P2195", "O2 sensor stuck lean", "The upstream sensor is pinned lean. That can be the sensor or a real lean condition (leak / fuel).", "O2, vacuum leak, fuel", "Ask them to force the mixture rich with propane or a scan-tool test and see if the sensor moves.", "$80–$420", "soon", false),
  P2270: entry("P2270", "O2 sensor stuck lean (post)", "The downstream sensor is stuck. Often the sensor; sometimes an exhaust leak after the cat.", "Rear O2, leak", "Ask whether the rear sensor switches at all during a road test.", "$110–$360", "monitor", false),
  P2610: entry("P2610", "ECM / PCM internal engine-off timer", "The computer's 'how long has it been off' clock failed a check. EVAP and readiness monitors can stall. Often follows a dead battery.", "ECM power, battery, software", "Ask for a battery test and a reflash TSB check before an ECM.", "$0 (reflash) – $1,200", "monitor", false),
  C0035: entry("C0035", "Left front wheel-speed sensor", "ABS / traction lost the left-front tone. A sensor, a damaged tone ring, or debris. The car still brakes — ABS may not.", "WSS, tone ring, harness", "Ask which corner and whether the ring is cracked. A full ABS module is rare on this code.", "$80–$320", "soon", true),
  C0040: entry("C0040", "Right front wheel-speed sensor", "Same wheel-speed story, right front.", "WSS, tone ring, harness", "Ask for the live wheel-speed PIDs while rolling the car.", "$80–$320", "soon", true),
  C0045: entry("C0045", "Left rear wheel-speed sensor", "The left-rear tone is gone. Common after a hub or parking-brake job if the harness got pinched.", "WSS, tone ring, hub bearing", "Ask for the live wheel-speed PID and the harness routing at the hub. An ABS pump is not the fix for one corner.", "$80–$420", "soon", true),
  C0050: entry("C0050", "Right rear wheel-speed sensor", "Right-rear tone lost. Same isolate-the-corner rule.", "WSS, tone ring, hub", "Four new sensors is a habit, not a test. Ask which corner actually failed.", "$80–$420", "soon", true),
  C0110: entry("C0110", "ABS pump motor circuit", "The ABS hydraulic pump circuit failed. You may lose ABS/ESC, not necessarily normal braking.", "Pump motor, relay, module", "Ask if the pump commands on and if the fuse/relay is good before a $1,000 module.", "$80–$1,100", "soon", false),
  C0121: entry("C0121", "ABS valve / isolation circuit", "An ABS isolation or dump-valve circuit failed. The pedal may feel odd when ABS engages.", "ABS hydraulic unit, valve coil, EBCM", "Ask which valve PID failed and for power at the hydraulic unit before the assembly.", "$150–$1,400", "soon", false),
  C0265: entry("C0265", "EBCM / ABS module", "The ABS module failed an internal or pump-circuit test. Confirm power, grounds, and pump before the module.", "EBCM, pump, power/grounds", "Ask for a power/ground voltage-drop test and any TSB for a reflash.", "$200–$1,200", "soon", false),
  C0561: entry("C0561", "ABS / stability system disabled", "Stability control shut itself off because another code or an implausible sensor upset it. This is a pointer, not a diagnosis.", "Companion C-codes, steering-angle, yaw/WSS", "Ask for the companion codes. Do not pay for an alignment or a rack from C0561 alone.", "Diagnosis $80–$160; repair varies", "soon", false),
  B0001: entry("B0001", "Driver airbag deployment circuit", "The driver-bag circuit is open or shorted. That bag may not fire. Safety item.", "Clockspring, driver bag, SRS module", "Ask which circuit, and whether a clockspring or wheel job came first. Do not probe airbag circuits yourself.", "Diagnosis $80–$160; repair $150–$1,200", "urgent", false),
  B0012: entry("B0012", "Passenger airbag deployment circuit", "The passenger-bag circuit is faulted. The light names the bag that may not fire.", "Passenger bag, connector under seat/dash, SRS module", "Ask which circuit and for a post-repair SRS scan in writing.", "$150–$1,200", "urgent", false),
  B0028: entry("B0028", "Right passenger airbag deployment circuit", "An airbag circuit is open or shorted. The light means the bag on that circuit may not fire. This is a safety item — not a stereo shop guess.", "Clockspring/connector, bag, module", "Ask which circuit and whether they found a yellow connector unplugged after a seat or dash job. Do not probe airbag circuits yourself.", "Diagnosis $80–$160; repair $150–$1,200", "urgent", false),
  B0051: entry("B0051", "Seat-belt pretensioner circuit", "A pretensioner circuit fault. After a prior wreck this is common. The belt may not cinch in a crash.", "Pretensioner, connector, SRS module", "Ask for the exact circuit and a quote that includes the module scan after repair.", "$150–$700", "urgent", false),
  B0092: entry("B0092", "Impact / occupant sensor circuit", "A crash or occupant-classification sensor circuit failed. The airbag strategy may be wrong even though the car drives fine.", "Occupant/impact sensor, wiring under the seat, SRS module", "Ask which sensor and whether the seat connector was disturbed. Do not accept 'just clear it.'", "$150–$1,000", "urgent", false),
  B1000: entry("B1000", "Body / SRS control module fault", "A body or airbag module failed an internal check. Voltage events create a lot of these.", "Module power/grounds, software, module", "Ask for system voltage and a TSB check for a reflash before a module.", "$80–$1,200", "soon", false),
  B1325: entry("B1325", "Control-module power / battery", "A body module is seeing low or unstable voltage. Charge system first.", "Battery, grounds, module power", "Ask for charging-system numbers before a module replacement.", "$20–$380", "soon", true),
  B1428: entry("B1428", "A/C compressor / inverter circuit (hybrid and EV)", "The electric air-conditioning compressor or its inverter circuit failed. On a hybrid or EV this is high-voltage work.", "Electric A/C compressor, HV inverter loop, A/C control", "Ask for a shop with high-voltage training. A can of refrigerant from the parts store is not the repair here.", "$200–$2,000", "soon", false),
  U0001: entry("U0001", "High-speed CAN communication bus", "The high-speed network is unhappy and the modules cannot agree. Low voltage plus one shorted module is the usual pair.", "CAN bus wiring, a shorted module, battery", "Authorize a network diagnostic hour. Ask which CAN pair is shorted and where.", "$80–$600 diagnosis; parts extra", "urgent", false),
  U0073: entry("U0073", "Control-module communication bus off", "Modules cannot talk to each other on the CAN bus. A shorted module, a damaged harness, or low voltage. This is electrical diagnosis time, not a parts list.", "CAN wiring, a shorted module, voltage", "Authorize a diagnostic hour. Ask which high/low CAN pair is shorted and at which splice.", "$80–$600 typical diagnosis; parts extra", "urgent", false),
  U0100: entry("U0100", "Lost communication with ECM / PCM", "The network cannot hear the engine computer. Power, grounds, or a dead ECM — start at fuses.", "ECM power/grounds, CAN, ECM", "Ask for voltage at the ECM power pins and whether other modules are also silent.", "$80–$1,400", "urgent", false),
  U0101: entry("U0101", "Lost communication with TCM", "The transmission module is silent. Same rule as U0100: power and network first.", "TCM power, CAN, TCM", "Ask whether the trans has power and if U-codes are clustered (bus-wide) or lone.", "$80–$1,200", "soon", false),
  U0102: entry("U0102", "Lost communication with transfer case module", "The 4WD/AWD transfer-case module is silent. Four-wheel drive may not engage.", "Transfer-case module power, CAN, module", "Ask for the module's fuse and power pins before a replacement is quoted.", "$80–$900", "soon", false),
  U0121: entry("U0121", "Lost communication with ABS", "The ABS module is offline. Wheel-speed and stability control will drop out.", "ABS power, CAN, module", "Ask for fuse/power at the ABS module before a replacement.", "$80–$1,100", "soon", false),
  U0140: entry("U0140", "Lost communication with BCM", "The body computer is silent. Lights, locks, and security can all act haunted. Voltage and a sleeping BCM are common.", "BCM power, CAN, battery", "Ask them to check battery state-of-charge and BCM power pins before quoting the module.", "$80–$900", "soon", false),
  U0151: entry("U0151", "Lost communication with SRS / airbag module", "The network cannot hear the airbag module, so the SRS light stays on. Safety item.", "SRS power/fuse, CAN, SRS module", "Ask why the module is silent before anyone clears the code and hands back the keys.", "$80–$1,200", "urgent", false),
  U0155: entry("U0155", "Lost communication with instrument cluster", "The cluster is offline. Speedo/gauges dark. Often the cluster itself or its network splice.", "Cluster, CAN, power", "Ask if other U-codes came with it — a single U0155 is more likely the cluster than the whole bus.", "$80–$700", "soon", false),
  U0164: entry("U0164", "Lost communication with HVAC control module", "The climate module is offline. Fan and temperature control may die. This is not an engine problem.", "HVAC module power, CAN, module", "Ask them not to recharge the A/C because a module went quiet.", "$80–$700", "monitor", false),
  U0401: entry("U0401", "Invalid data from ECM / PCM", "A module heard the engine computer but did not believe the data. Software, voltage, or a failing ECM.", "ECM data, software, system voltage", "Ask which PID was invalid and whether a reflash TSB exists.", "$80–$1,200", "soon", false),
};

const BOOK: Record<string, DtcEntry> = mergeCoreBook(CORE_BOOK);

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

export const DTC_BOOK_COUNT = Object.keys(BOOK).length;

export { dtcSayThis };

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
  if (code.startsWith("P030") || code.startsWith("P031")) return /ignition|misfire|fuel|engine/.test(blob);
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
