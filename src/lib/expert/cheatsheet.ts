export interface CheatRow {
  id: string;
  label: string;
  unit: string;
  meaning: string;
}

export const CHEAT_ROWS: CheatRow[] = [
  {
    id: "pads",
    label: "Pad lining",
    unit: "mm",
    meaning: "New often 10–12 mm. Replace talk ~3–4 mm. Indicator squeal ~2–3 mm. Grind = lining gone.",
  },
  {
    id: "rotors",
    label: "Rotor discard",
    unit: "mm",
    meaning: "Hat stamp MIN TH vs measured face. Grooves are not thickness. Pulse is often DTV.",
  },
  {
    id: "tread",
    label: "Tread",
    unit: "32nds",
    meaning: "New ~10–11/32. Wet conversation at 4/32. Wear bars 2/32. DOT week/year on the sidewall.",
  },
  {
    id: "psi",
    label: "Tires",
    unit: "PSI",
    meaning: "Door sticker, cold. ~1 PSI per 10 °F. Sidewall max is not the target. TPMS ~25% under.",
  },
  {
    id: "12v",
    label: "12V rested",
    unit: "V",
    meaning: "~12.6 full, ~12.2 half. Load test beats a pretty rest number. EV contactors still need that test.",
  },
  {
    id: "freeze",
    label: "Freeze-frame",
    unit: "DTC",
    meaning: "RPM, load, mph, ECT °F, STFT/LTFT %. Cold vs hot, idle vs highway. Do not throw parts from the title.",
  },
  {
    id: "trims",
    label: "Fuel trims",
    unit: "%",
    meaning: "Combined STFT+LTFT ≳ +15% idle is a lean story. Negative is rich. Context is load.",
  },
  {
    id: "coolant",
    label: "Coolant",
    unit: "spec / °F",
    meaning: "Chemistry, not color. Measure freeze point. 50/50 is often about −34 °F. No “universal green.”",
  },
];

export const CHEAT_ASK = [
  "What is the measured number — mm, 32nds, PSI, volts, or freeze-frame?",
  "What is the not-to-exceed if you only diagnose?",
  "Call or text the new out-the-door before any extra line.",
  "Photo the old part or I take it home.",
  "Do not clear codes until I have stored / pending / permanent.",
];

export const CHEAT_DONT = [
  "“They’re due” is not a reading.",
  "“Do whatever it needs” is a blank check.",
  "Silence on a voicemail is not a yes.",
  "A code title is not a parts catalog.",
  "We do not book shops. We do not take a cut.",
];
