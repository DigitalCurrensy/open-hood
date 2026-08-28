import type { ReportPacket } from "@/lib/report/packet";

export type FluidsLane = "catalog" | "heuristic" | "model";

export interface ConfidenceChip {
  id: string;
  stamp: string;
  meaning: string;
  warn?: boolean;
}

/** Every source this packet can wear. OSM is the rooftop lane even when shops are not on this copy. */
export const SOURCE_LEGEND = [
  { id: "nhtsa", stamp: "NHTSA", meaning: "VIN / year-make-model from vPIC. Recalls are SaferCar nameplate, not VIN closeout." },
  { id: "catalog", stamp: "CATALOG", meaning: "Year / make / model row in our fluids book. Still confirm the cap." },
  { id: "heuristic", stamp: "HEURISTIC", meaning: "No catalog row. Heuristic specs can be wrong. Door jamb wins." },
  { id: "regex", stamp: "REGEX", meaning: "Quote line vs a local price book, then a typical independent ZIP band. Not Motor." },
  { id: "osm", stamp: "OSM", meaning: "Rooftops from Nominatim + Overpass. Not a certified shop network." },
] as const;

export const SOURCE_LANE_IDS = ["nhtsa", "catalog", "heuristic", "regex"] as const;

/** Standing method. Same sentences on the yellow copy and the text download. */
export const PACKET_METHOD_LINES = [
  "Quote line: typical independent band for the ZIP (plus a local regex book). Not Motor, Mitchell, or ALLDATA hours.",
  "Recalls, when you pull them: SaferCar year / make / model. Nameplate, not a VIN open/closed file.",
  "Fluids: catalog row first, heuristic last. Heuristic specs can be wrong. The door jamb wins.",
  "Rooftops: OpenStreetMap Nominatim + Overpass. Not a certified shop network.",
] as const;

export function confidenceChips(packet: ReportPacket, fluidsLane?: FluidsLane): ConfidenceChip[] {
  const chips: ConfidenceChip[] = [];

  if (packet.vehicle.vin || packet.vehicle.year || packet.vehicle.make) {
    chips.push({
      id: "nhtsa",
      stamp: "NHTSA",
      meaning: "Identity from vPIC. Year / make / model. Not Chrome Data. Not a build sheet.",
    });
  }

  if (packet.fluids) {
    if (fluidsLane === "heuristic") {
      chips.push({
        id: "heuristic",
        stamp: "HEURISTIC",
        meaning: "No catalog row for this nameplate. Heuristic specs can be wrong. Read the cap and the jamb.",
        warn: true,
      });
    } else if (fluidsLane === "catalog") {
      chips.push({
        id: "catalog",
        stamp: "CATALOG",
        meaning: "Year / make / model row in our fluids book. Still confirm the under-hood label.",
      });
    } else if (fluidsLane === "model") {
      chips.push({
        id: "model",
        stamp: "MODEL",
        meaning: "Model-family card. Not a trim-true OEM TIS line.",
      });
    } else {
      chips.push({
        id: "specs",
        stamp: "SPECS",
        meaning: "Fluids card. Catalog or heuristic — door jamb still wins.",
      });
    }
  }

  if (packet.quote) {
    chips.push({
      id: "regex",
      stamp: "REGEX",
      meaning: "Line match against a local price book, then a typical independent ZIP band. Not Motor.",
    });
  }

  return chips;
}

export function fluidsLaneFromSheet(fluids: { source?: string } | null | undefined): FluidsLane | undefined {
  const source = fluids?.source;
  if (source === "catalog" || source === "heuristic" || source === "model") return source;
  return undefined;
}
