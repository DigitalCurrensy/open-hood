import type { VehicleAdjust } from "@/lib/labor/types";

const LUXURY_EURO = new Set([
  "bmw",
  "mercedes-benz",
  "mercedes",
  "audi",
  "porsche",
  "jaguar",
  "land rover",
  "landrover",
  "mini",
  "volvo",
  "alfa romeo",
  "maserati",
]);

const LUXURY_JP = new Set(["lexus", "infiniti", "acura", "genesis"]);

const EV_MAKES = new Set(["tesla", "rivian", "polestar", "lucid"]);

const TRUCK_MAKES = new Set(["ram", "gmc"]);

const TRUCK_MODELS =
  /\b(f-?150|f-?250|f-?350|silverado|sierra|tundra|tacoma|2500|3500|wrangler|gladiator|bronco|tahoe|suburban|yukon|expedition|sequoia|titan|frontier|colorado|canyon|ranger)\b/i;

const EV_MODELS = /\b(model [3sxy]|cybertruck|ioniq|ev6|id\.?4|mach-?e|lyriq|blazer ev|equinox ev|ariya|bolt)\b/i;

function key(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function adjustVehicle(year: string, make: string, model: string): VehicleAdjust {
  const notes: string[] = [];
  let partsMult = 1;
  let hoursMult = 1;
  const makeKey = key(make);
  const yearNum = Number.parseInt(year, 10);
  const ev = EV_MAKES.has(makeKey) || EV_MODELS.test(model);

  if (!makeKey) {
    notes.push("Priced as a common passenger car. Year and make tighten parts and hours.");
  } else if (LUXURY_EURO.has(makeKey)) {
    partsMult *= 1.25;
    hoursMult *= 1.15;
    notes.push("European luxury: parts and access time run higher than a civic-class book.");
  } else if (LUXURY_JP.has(makeKey)) {
    partsMult *= 1.12;
    hoursMult *= 1.05;
    notes.push("Near-luxury Japanese: parts a step above the mainstream band.");
  }

  if (TRUCK_MAKES.has(makeKey) || TRUCK_MODELS.test(model)) {
    hoursMult *= 1.08;
    notes.push("Truck / body-on-frame: figure a little more time for rust and reach.");
  }

  if (Number.isFinite(yearNum) && yearNum > 0 && yearNum <= 2004) {
    hoursMult *= 1.08;
    notes.push("Pre-2005: seized hardware and rust add time.");
  }

  if (ev) {
    notes.push("This make is electric. Oil, plugs, starter, alternator, and timing are not this car.");
  }

  return {
    year: year.trim(),
    make: make.trim(),
    model: model.trim(),
    partsMult: roundMult(partsMult),
    hoursMult: roundMult(hoursMult),
    ev,
    notes,
  };
}

function roundMult(value: number): number {
  return Math.round(value * 100) / 100;
}

export function iceJobOnEv(iceOnly: boolean, ev: boolean): boolean {
  return iceOnly && ev;
}
