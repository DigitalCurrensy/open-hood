import type { RecallRecord, VehicleSpecs } from "@/lib/types";

interface NhtsaVinValues {
  VIN?: string;
  ModelYear?: string;
  Make?: string;
  Model?: string;
  Trim?: string;
  Series?: string;
  BodyClass?: string;
  DriveType?: string;
  TransmissionStyle?: string;
  DisplacementL?: string;
  EngineModel?: string;
  EngineCylinders?: string;
  EngineConfiguration?: string;
  FuelTypePrimary?: string;
  Manufacturer?: string;
  PlantCity?: string;
  PlantState?: string;
  PlantCountry?: string;
  Doors?: string;
  GVWR?: string;
  ErrorText?: string;
  ErrorCode?: string;
}

function blank(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === "Not Applicable") return "";
  return trimmed;
}

function formatDisplacement(value: string | undefined): string {
  const raw = blank(value);
  if (!raw) return "";
  const liters = Number.parseFloat(raw);
  if (!Number.isFinite(liters)) return `${raw}L`;
  const rounded = Math.round(liters * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}.0` : String(rounded);
}

export async function decodeVin(vin: string): Promise<VehicleSpecs> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) {
    throw new Error(`NHTSA vPIC returned ${response.status}`);
  }

  const payload = (await response.json()) as { Results?: NhtsaVinValues[] };
  const result = payload.Results?.[0];
  if (!result) {
    throw new Error("NHTSA vPIC returned no decode results");
  }

  const errorText = blank(result.ErrorText);
  const hasIdentity = Boolean(blank(result.Make) && blank(result.ModelYear));
  if (!hasIdentity) {
    throw new Error(errorText || "VIN could not be decoded");
  }

  const plant = [blank(result.PlantCity), blank(result.PlantState), blank(result.PlantCountry)]
    .filter(Boolean)
    .join(", ");

  const displacement = formatDisplacement(result.DisplacementL);

  return {
    vin,
    year: blank(result.ModelYear),
    make: blank(result.Make),
    model: blank(result.Model),
    trim: blank(result.Trim),
    series: blank(result.Series),
    bodyClass: blank(result.BodyClass),
    driveType: blank(result.DriveType),
    transmission: blank(result.TransmissionStyle),
    engineDisplacement: displacement ? `${displacement}L` : "",
    engineModel: blank(result.EngineModel),
    cylinders: blank(result.EngineCylinders),
    engineConfig: blank(result.EngineConfiguration),
    fuelType: blank(result.FuelTypePrimary),
    manufacturer: blank(result.Manufacturer),
    plant,
    doors: blank(result.Doors),
    gvwr: blank(result.GVWR),
    errorText,
    plate: "",
    plateState: "",
    mileage: "",
    concern: "",
    identifiedBy: "vin",
  };
}

export function specsFromYearMakeModel(input: {
  year: string;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
  plate?: string;
  plateState?: string;
  mileage?: string;
  concern?: string;
  vin?: string;
}): VehicleSpecs {
  return {
    vin: input.vin ?? "",
    year: input.year.trim(),
    make: input.make.trim(),
    model: input.model.trim(),
    trim: input.trim?.trim() ?? "",
    series: "",
    bodyClass: "",
    driveType: "",
    transmission: "",
    engineDisplacement: "",
    engineModel: input.engine?.trim() ?? "",
    cylinders: "",
    engineConfig: "",
    fuelType: "",
    manufacturer: "",
    plant: "",
    doors: "",
    gvwr: "",
    errorText: "",
    plate: input.plate?.trim().toUpperCase() ?? "",
    plateState: input.plateState?.trim().toUpperCase() ?? "",
    mileage: input.mileage?.trim() ?? "",
    concern: input.concern?.trim() ?? "",
    identifiedBy: input.vin ? "vin" : "ymm",
  };
}

export async function fetchMakesForYear(year: string): Promise<string[]> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) return [];
  const payload = (await response.json()) as { Results?: Array<{ MakeName?: string }> };
  const makes = (payload.Results ?? [])
    .map((row) => row.MakeName?.trim() ?? "")
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  void year;
  return makes;
}

export async function fetchModelsForMakeYear(make: string, year: string): Promise<string[]> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${encodeURIComponent(year)}?format=json`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) {
    throw new Error(`NHTSA models returned ${response.status}`);
  }
  const payload = (await response.json()) as { Results?: Array<{ Model_Name?: string }> };
  return [...new Set((payload.Results ?? []).map((row) => row.Model_Name?.trim() ?? "").filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

interface NhtsaRecallRow {
  NHTSACampaignNumber?: string;
  Component?: string;
  Summary?: string;
  Conequence?: string;
  Consequence?: string;
  Remedy?: string;
  ReportReceivedDate?: string;
}

export async function fetchRecalls(specs: VehicleSpecs): Promise<RecallRecord[]> {
  if (!specs.make || !specs.model || !specs.year) return [];

  const params = new URLSearchParams({
    make: specs.make,
    model: specs.model,
    modelYear: specs.year,
  });
  const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) return [];

  const payload = (await response.json()) as { results?: NhtsaRecallRow[] };
  return (payload.results ?? []).slice(0, 40).map((row) => ({
    campaignNumber: row.NHTSACampaignNumber ?? "",
    component: row.Component ?? "Unspecified",
    summary: row.Summary ?? "",
    consequence: row.Consequence ?? row.Conequence ?? "",
    remedy: row.Remedy ?? "",
    reportReceivedDate: row.ReportReceivedDate ?? "",
  }));
}
