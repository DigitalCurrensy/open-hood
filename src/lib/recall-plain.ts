import type { RecallRecord } from "@/lib/types";

export type RecallUrgency = "safety" | "fire-or-leak" | "emissions" | "notice";

export interface RecallExplain {
  urgency: RecallUrgency;
  meaning: string;
  atTheCounter: string;
  nhtsaSearch: string;
}

const URGENCY_LABEL: Record<RecallUrgency, string> = {
  safety: "Safety — schedule this",
  "fire-or-leak": "Fire / leak risk",
  emissions: "Emissions / drivability",
  notice: "Notice — still free at the dealer",
};

export function urgencyLabel(urgency: RecallUrgency): string {
  return URGENCY_LABEL[urgency];
}

export function explainRecall(recall: RecallRecord, vin?: string): RecallExplain {
  const blob = `${recall.component} ${recall.summary} ${recall.consequence} ${recall.remedy}`.toLowerCase();

  let urgency: RecallUrgency = "notice";
  let meaning =
    "The manufacturer will repair this at no charge if your VIN is still open. A recall is not a shop upsell — it is a free dealer campaign.";
  let atTheCounter =
    "Please check this campaign number against my VIN and tell me if it is open. I want the remedy, not a related repair unless you show me why.";

  if (/air bag|airbag|seat belt|pretension|occupant/.test(blob)) {
    urgency = "safety";
    meaning =
      "A restraint may not protect you in a crash. This is not optional maintenance. The dealer must fix an open campaign for free.";
    atTheCounter =
      "This is an open restraint campaign. I want it scheduled this week. Do not bundle it with an alignment or cabin filter.";
  } else if (/steer|loss of control|rollaway|park|brake|abs |stability/.test(blob)) {
    urgency = "safety";
    meaning =
      "Steering, brakes, or park could fail in a way you feel — or in a way you only notice in a panic stop. Treat it as a safety appointment, not a 'next oil change' note.";
    atTheCounter =
      "Please confirm the campaign is open on this VIN and how long I will be without the car. I am here for the recall, not a menu.";
  } else if (/fire|fuel leak|gasoline|cnc|cng|propane|overheat/.test(blob)) {
    urgency = "fire-or-leak";
    meaning =
      "The campaign mentions fire, fuel, or overheating. Park with a way out, don't ignore a fuel smell, and get the dealer date on the calendar.";
    atTheCounter =
      "The NHTSA file mentions fire or leak risk. I want the remedy performed. If you find extra damage, call me before you add it to the RO.";
  } else if (/emission|catalyst|oxygen sensor|evap|obd|check engine/.test(blob)) {
    urgency = "emissions";
    meaning =
      "This is usually a free software flash or a parts swap so the car can pass an emissions test and keep the light honest. It is still no-charge if the VIN is open.";
    atTheCounter =
      "Please check for an open emissions campaign and any related TSB. I do not want a converter quote until you confirm the campaign does not cover it.";
  } else if (/software|module|reprogram|update/.test(blob)) {
    urgency = "notice";
    meaning =
      "Most of these are a dealer flash. Ask how long they need the car and whether you can wait. Software recalls still close the campaign on your VIN.";
    atTheCounter =
      "If this is a flash, how long is the car here, and do I need an appointment or can you do it while I wait?";
  }

  if (recall.consequence.trim()) {
    meaning = `${meaning} NHTSA says the risk is: ${clip(recall.consequence, 220)}`;
  }

  const q = encodeURIComponent(recall.campaignNumber || `${vin ?? ""} recall`);
  return {
    urgency,
    meaning,
    atTheCounter,
    nhtsaSearch: `https://www.nhtsa.gov/search?q=${q}`,
  };
}

export function nhtsaVinUrl(vin: string): string {
  return `https://www.nhtsa.gov/recalls?vin=${encodeURIComponent(vin)}`;
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}
