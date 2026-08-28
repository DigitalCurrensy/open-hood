export interface FreezeFrameAsk {
  id: string;
  label: string;
  why: string;
}

/** Mode 02 snapshot from when the code set — not the live PIDs on this desk. */
export const FREEZE_FRAME_ASK: FreezeFrameAsk[] = [
  {
    id: "status",
    label: "Stored / pending / permanent",
    why: "Permanent survives a clear until the monitor runs clean. “I reset it this morning” is not a scan.",
  },
  {
    id: "rpm",
    label: "RPM when it set",
    why: "Idle vs 2,500 vs cruise. A cat code at 90 °F idle is a different story than 2,200 RPM hot.",
  },
  {
    id: "load",
    label: "Calculated load %",
    why: "Load is the context for fuel trims. A lean trim at idle often is a leak. Highway lean is fuel.",
  },
  {
    id: "vss",
    label: "Vehicle speed (mph)",
    why: "0 mph is a stopped-in-gear or idle set. 65 mph is a cruise set. Print the number.",
  },
  {
    id: "ect",
    label: "Coolant (ECT) °F",
    why: "Open-loop / warmup vs 195–220 °F closed-loop. If they will not say the ECT, they have not looked.",
  },
  {
    id: "trims",
    label: "STFT / LTFT %",
    why: "Combined ≳ +15% idle is a lean story. Negative is rich. The title of P0420 is not a converter.",
  },
  {
    id: "loop",
    label: "Fuel system status",
    why: "Open vs closed loop. A code that only sets open-loop is a warmup fault, not a highway cat.",
  },
];

export const FREEZE_FRAME_LINE =
  "Please print the freeze-frame — RPM, load, mph, ECT, and fuel trims when the code set. I will not authorize a part from the title.";
