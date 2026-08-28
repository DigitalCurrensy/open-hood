import type { HistoryOptionField } from "@/lib/history/types";
import type { VehicleSpecs } from "@/lib/types";

export const DECODER_TRIM_NOTE = "Decoder trim, not window sticker";
export const DECODER_SERIES_NOTE = "Decoder series, not window sticker";

const DECODER_ONLY = "NHTSA vPIC field. Not an RPO list.";

export function decoderOptions(specs: VehicleSpecs): HistoryOptionField[] {
  const rows: HistoryOptionField[] = [
    { id: "trim", label: "Trim", value: specs.trim, note: DECODER_TRIM_NOTE },
    { id: "series", label: "Series", value: specs.series, note: DECODER_SERIES_NOTE },
    { id: "body", label: "Body", value: specs.bodyClass, note: DECODER_ONLY },
    { id: "drive", label: "Drive", value: specs.driveType, note: DECODER_ONLY },
    { id: "trans", label: "Transmission", value: specs.transmission, note: DECODER_ONLY },
    { id: "doors", label: "Doors", value: specs.doors, note: DECODER_ONLY },
    {
      id: "engine",
      label: "Engine",
      value: [specs.engineDisplacement, specs.engineConfig, specs.cylinders ? `${specs.cylinders} cyl` : "", specs.engineModel]
        .filter(Boolean)
        .join(" · "),
      note: DECODER_ONLY,
    },
    { id: "fuel", label: "Fuel", value: specs.fuelType, note: DECODER_ONLY },
    { id: "hp", label: "Horsepower", value: specs.engineHP ?? "", note: DECODER_ONLY },
    { id: "hybrid", label: "Hybrid", value: specs.hybrid ?? "", note: DECODER_ONLY },
    { id: "ev", label: "Electrification", value: specs.electrificationLevel ?? "", note: DECODER_ONLY },
    { id: "belts", label: "Seat belts", value: specs.seatBelts ?? "", note: DECODER_ONLY },
    { id: "airbags", label: "Airbags", value: specs.airbags ?? "", note: DECODER_ONLY },
    { id: "tpms", label: "TPMS", value: specs.tpms ?? "", note: DECODER_ONLY },
    { id: "abs", label: "ABS", value: specs.abs ?? "", note: DECODER_ONLY },
    { id: "gvwr", label: "GVWR", value: specs.gvwr, note: DECODER_ONLY },
    { id: "plant", label: "Plant", value: specs.plant, note: DECODER_ONLY },
  ];
  return rows.filter((row) => row.value.trim());
}

export function optionsNote(fields: HistoryOptionField[]): string {
  if (!fields.length) {
    return "NHTSA did not return trim or series for this VIN. That is not a window-sticker package list.";
  }
  const hasTrim = fields.some((row) => row.id === "trim" || row.id === "series");
  return hasTrim
    ? "Decoder trim, not window sticker. Packages and RPO codes are not in vPIC."
    : "Factory fields from the decoder. Still not a window sticker.";
}

export function vehicleHeadline(specs: VehicleSpecs): string {
  const ymm = [specs.year, specs.make, specs.model].filter(Boolean).join(" ");
  const trim = specs.trim || specs.series;
  return [ymm, trim].filter(Boolean).join(" · ") || "Decoded vehicle";
}
