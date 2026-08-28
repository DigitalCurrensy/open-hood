import { retailerSearchHrefs } from "@/lib/directory/sku-search";
import type { IdentifiedVehicle, PartBuyRow } from "@/lib/types";

export interface BuyLinks {
  rockauto: string;
  autozone: string;
  oreilly: string;
  napa: string;
  amazon: string;
}

export function buyLinks(query: string): BuyLinks {
  const stamps = retailerSearchHrefs(query);
  const byId = Object.fromEntries(stamps.map((row) => [row.id, row.href]));
  const encoded = encodeURIComponent(query.trim());
  return {
    rockauto: byId.rockauto ?? `https://www.rockauto.com/en/partsearch/?partnum=${encoded}`,
    autozone: byId.autozone ?? `https://www.autozone.com/searchresult?searchText=${encoded}`,
    oreilly: byId.oreilly ?? `https://www.oreillyauto.com/search?q=${encoded}`,
    napa: byId.napa ?? `https://www.napaonline.com/en/search?text=${encoded}`,
    amazon: `https://www.amazon.com/s?k=${encoded}`,
  };
}

function vehicleQuery(vehicle: IdentifiedVehicle, extra: string): string {
  const { year, make, model } = vehicle.specs;
  return [year, make, model, extra].filter(Boolean).join(" ");
}

export function partsForVehicle(vehicle: IdentifiedVehicle): PartBuyRow[] {
  const { fluids, specs } = vehicle;
  const ev = /electric/i.test(specs.fuelType) || specs.make.toUpperCase() === "TESLA";

  const rows: PartBuyRow[] = [];

  if (!ev && fluids.oilFilterSku && fluids.oilFilterSku !== "—") {
    rows.push({
      name: "Oil filter",
      sku: fluids.oilFilterSku,
      note: `${fluids.oilViscosity} · ${fluids.oilCapacityQt}`,
      shopBand: "$70–$140 oil change at an independent",
      diyBand: "$25–$55 filter + oil at retail",
      query: fluids.oilFilterSku,
    });
  }

  if (fluids.airFilterSku && fluids.airFilterSku !== "—") {
    rows.push({
      name: ev ? "Cabin / HEPA intake filter" : "Engine air filter",
      sku: fluids.airFilterSku,
      note: "Pop the air box and photograph the old one before you buy.",
      shopBand: "$40–$90 installed",
      diyBand: "$15–$40 part",
      query: fluids.airFilterSku,
    });
  }

  if (fluids.cabinFilterSku && fluids.cabinFilterSku !== "—") {
    rows.push({
      name: "Cabin air filter",
      sku: fluids.cabinFilterSku,
      note: "Glove-box DIY on most cars. $80 labor is almost always padding.",
      shopBand: "$70–$120 at a dealer",
      diyBand: "$15–$35 part, 10 minutes",
      query: fluids.cabinFilterSku,
    });
  }

  if (!ev) {
    rows.push({
      name: "Engine oil",
      sku: `${fluids.oilViscosity} ${fluids.oilSpec}`,
      note: "Buy the spec on the cap, not 'full synthetic whatever is on sale.'",
      shopBand: "Included in a $70–$140 oil change",
      diyBand: "$22–$45 for a 5-qt jug that matches the spec",
      query: vehicleQuery(vehicle, `${fluids.oilViscosity} motor oil ${fluids.oilSpec.split(/[,/]/)[0] ?? ""}`),
    });
  }

  rows.push({
    name: "Wiper blades",
    sku: vehicleQuery(vehicle, "wiper blades"),
    note: "Measure the old blades. Beam vs frame matters more than the brand on the box.",
    shopBand: "$40–$80 installed",
    diyBand: "$18–$40 pair",
    query: vehicleQuery(vehicle, "wiper blades"),
  });

  rows.push({
    name: "Brake pads (axle)",
    sku: vehicleQuery(vehicle, "brake pads"),
    note: "Do not buy rotors until someone measures thickness vs the discard spec.",
    shopBand: "$180–$420 pads + labor per axle",
    diyBand: "$40–$90 quality pad set",
    query: vehicleQuery(vehicle, "front brake pads"),
  });

  rows.push({
    name: "12V battery",
    sku: vehicleQuery(vehicle, "battery"),
    note: ev
      ? "This is the 12-volt support battery, not the traction pack. A dead 12V makes an EV look bricked."
      : "Match group size and CCA on the door-jamb / old battery label.",
    shopBand: "$180–$320 installed",
    diyBand: "$140–$240 at a parts store, often free install",
    query: vehicleQuery(vehicle, ev ? "12V battery" : "car battery"),
  });

  if (!ev && fluids.sparkPlugGap && fluids.sparkPlugGap !== "—") {
    rows.push({
      name: "Spark plugs (set)",
      sku: vehicleQuery(vehicle, "spark plugs"),
      note: `Gap callout: ${fluids.sparkPlugGap}. Iridium plugs are usually do-not-regap.`,
      shopBand: "$120–$320 set + labor",
      diyBand: "$48–$140 for a set of OEM-equivalent iridium",
      query: vehicleQuery(vehicle, "iridium spark plugs"),
    });
  }

  return rows;
}

export const PARTS_DISCLAIMER =
  "These are search URLs, not live inventory or prices. RockAuto / AutoZone / O’Reilly / NAPA hrefs only. We do not earn a commission and we do not grow a cart.";
