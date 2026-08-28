import type { IdentifiedVehicle, MechanicTalkingPoint, QuoteAnalysisResult } from "@/lib/types";

export function talkingPoints(vehicle: IdentifiedVehicle, quote?: QuoteAnalysisResult | null): MechanicTalkingPoint[] {
  const { specs, fluids } = vehicle;
  const name = [specs.year, specs.make, specs.model].filter(Boolean).join(" ") || "this vehicle";
  const ev = /electric/i.test(specs.fuelType) || specs.make.toUpperCase() === "TESLA";
  const points: MechanicTalkingPoint[] = [];

  if (quote?.mechanicScript.length) {
    for (const line of quote.mechanicScript.slice(0, 3)) {
      points.push({ title: "From the marked-up ticket", sayThis: line });
    }
  }

  if (ev) {
    points.push({
      title: "Wrong-car fiction",
      sayThis: `This VIN is a ${name} with an electric powertrain. If the RO lists engine oil, spark plugs, or a transmission flush, you are looking at the wrong car. Please reprint against this VIN.`,
    });
  } else {
    points.push({
      title: "Oil spec on this VIN",
      sayThis: `This ${name} calls for ${fluids.oilViscosity} meeting ${fluids.oilSpec}, ${fluids.oilCapacityQt}. I do not want a 'full synthetic' substitute unless you show me it meets that spec.`,
    });
  }

  points.push({
    title: "Rotors and pads — numbers, not adjectives",
    sayThis: `Please measure inner and outer pad thickness on both sides of the axle, and rotor thickness in millimeters next to the discard spec for the ${name}. I will authorize from the numbers, not from "they're due."`,
  });

  if (fluids.cabinFilterSku && fluids.cabinFilterSku !== "—") {
    points.push({
      title: "Cabin filter",
      sayThis: `The cabin filter SKU on our card is ${fluids.cabinFilterSku}. If you are over $45 for that part and a glove-box swap, I will decline and do it in the driveway.`,
    });
  }

  points.push({
    title: "No extras without a call",
    sayThis: "If anything extra shows up after you open it, call me before you add it. Do not go past the written estimate.",
  });

  if (fluids.tirePsiFront) {
    points.push({
      title: "Tire pressure",
      sayThis: `Door-sticker pressure on our card is ${fluids.tirePsiFront} front / ${fluids.tirePsiRear} rear. The sidewall number is a maximum, not the spec.`,
    });
  }

  return points;
}

export function scriptAsText(vehicle: IdentifiedVehicle, points: MechanicTalkingPoint[]): string {
  const { specs } = vehicle;
  const title = [specs.year, specs.make, specs.model, specs.vin].filter(Boolean).join(" · ");
  const lines = points.map((point, index) => `${index + 1}. ${point.sayThis}`);
  return [`Open Hood counter script`, title, "", ...lines].join("\n");
}
