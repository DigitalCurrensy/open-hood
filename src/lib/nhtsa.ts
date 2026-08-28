import { chromeDataStatus, type ChromeDataStatus } from "@/lib/chrome-data";
import { fetchComplaintSummary } from "@/lib/directory/nhtsa-safety";
import type { NhtsaComplaintSummary } from "@/lib/directory/types";
import {
  fetchVendorVinRecalls,
  mergeNameplateAndVendorRecalls,
  VENDOR_RECALL_STAMP,
} from "@/lib/history/vendor-recalls";
import { inspectPlateFormat, type PlateFormatResult } from "@/lib/plate-format";
import type { RecallRecord, VehicleSpecs } from "@/lib/types";
import {
  describeVinStructure,
  inspectVinCheckDigit,
  isValidVin,
  type VinCheckDigitReport,
  type VinStructure,
} from "@/lib/vin";

export { VENDOR_RECALL_STAMP };

interface NhtsaVinValues {
  VIN?: string;
  ModelYear?: string;
  Make?: string;
  Model?: string;
  Trim?: string;
  Trim2?: string;
  Series?: string;
  Series2?: string;
  BodyClass?: string;
  VehicleType?: string;
  DriveType?: string;
  TransmissionStyle?: string;
  TransmissionSpeeds?: string;
  DisplacementL?: string;
  EngineModel?: string;
  EngineCylinders?: string;
  EngineConfiguration?: string;
  EngineHP?: string;
  EngineHP_to?: string;
  Turbo?: string;
  ValveTrainDesign?: string;
  FuelTypePrimary?: string;
  FuelTypeSecondary?: string;
  ElectrificationLevel?: string;
  EVDriveUnit?: string;
  BatteryType?: string;
  BatteryKWh?: string;
  BatteryKWh_to?: string;
  ChargerLevel?: string;
  Manufacturer?: string;
  PlantCity?: string;
  PlantState?: string;
  PlantCountry?: string;
  PlantCompanyName?: string;
  Doors?: string;
  BodyCabType?: string;
  GVWR?: string;
  GVWR_to?: string;
  SeatBeltsAll?: string;
  OtherRestraintSystemInfo?: string;
  AirBagLocFront?: string;
  AirBagLocSide?: string;
  AirBagLocCurtain?: string;
  AirBagLocKnee?: string;
  AirBagLocSeatCushion?: string;
  TPMS?: string;
  ABS?: string;
  ESC?: string;
  TractionControl?: string;
  EntertainmentSystem?: string;
  TrailerType?: string;
  TrailerBodyType?: string;
  TrailerLength?: string;
  BrakeSystemType?: string;
  FuelInjectionType?: string;
  EngineManufacturer?: string;
  OtherEngineInfo?: string;
  SteeringLocation?: string;
  ErrorText?: string;
  ErrorCode?: string;
  [key: string]: string | undefined;
}

const SKIP_EXTRA = new Set([
  "ABS",
  "AdditionalErrorText",
  "AirBagLocCurtain",
  "AirBagLocFront",
  "AirBagLocKnee",
  "AirBagLocSeatCushion",
  "AirBagLocSide",
  "BatteryKWh",
  "BatteryKWh_to",
  "BatteryType",
  "BodyCabType",
  "BodyClass",
  "BrakeSystemType",
  "ChargerLevel",
  "DisplacementCC",
  "DisplacementCI",
  "DisplacementL",
  "Doors",
  "DriveType",
  "ElectrificationLevel",
  "EngineConfiguration",
  "EngineCylinders",
  "EngineHP",
  "EngineHP_to",
  "EngineManufacturer",
  "EngineModel",
  "EntertainmentSystem",
  "ErrorCode",
  "ErrorText",
  "ESC",
  "EVDriveUnit",
  "FuelInjectionType",
  "FuelTypePrimary",
  "FuelTypeSecondary",
  "GVWR",
  "GVWR_to",
  "Make",
  "MakeID",
  "Manufacturer",
  "ManufacturerId",
  "Model",
  "ModelID",
  "ModelYear",
  "OtherEngineInfo",
  "OtherRestraintSystemInfo",
  "PlantCity",
  "PlantCompanyName",
  "PlantCountry",
  "PlantState",
  "PossibleValues",
  "SeatBeltsAll",
  "Series",
  "Series2",
  "SteeringLocation",
  "SuggestedVIN",
  "TPMS",
  "TractionControl",
  "TrailerBodyType",
  "TrailerLength",
  "TrailerType",
  "TransmissionSpeeds",
  "TransmissionStyle",
  "Trim",
  "Trim2",
  "Turbo",
  "ValveTrainDesign",
  "VehicleType",
  "VIN",
]);

export const FACTORY_FACT_FIELDS: ReadonlyArray<{ id: keyof VehicleSpecs; label: string }> = [
  { id: "vin", label: "VIN" },
  { id: "year", label: "Year" },
  { id: "make", label: "Make" },
  { id: "model", label: "Model" },
  { id: "trim", label: "Trim" },
  { id: "trim2", label: "Trim 2" },
  { id: "series", label: "Series" },
  { id: "series2", label: "Series 2" },
  { id: "vehicleType", label: "Vehicle type" },
  { id: "bodyClass", label: "Body" },
  { id: "cabType", label: "Cab" },
  { id: "doors", label: "Doors" },
  { id: "driveType", label: "Drive" },
  { id: "transmission", label: "Transmission" },
  { id: "transmissionSpeeds", label: "Speeds" },
  { id: "engineDisplacement", label: "Displacement" },
  { id: "engineHP", label: "Horsepower" },
  { id: "cylinders", label: "Cylinders" },
  { id: "engineConfig", label: "Engine layout" },
  { id: "engineModel", label: "Engine code" },
  { id: "valveTrain", label: "Valvetrain" },
  { id: "turbo", label: "Turbo" },
  { id: "fuelInjection", label: "Injection" },
  { id: "engineManufacturer", label: "Engine maker" },
  { id: "otherEngineInfo", label: "Engine note" },
  { id: "fuelType", label: "Fuel" },
  { id: "fuelTypeSecondary", label: "Secondary fuel" },
  { id: "hybrid", label: "Hybrid" },
  { id: "electrificationLevel", label: "Electrification" },
  { id: "evDriveUnit", label: "EV drive" },
  { id: "batteryType", label: "Battery" },
  { id: "batteryKWh", label: "Battery kWh" },
  { id: "chargerLevel", label: "Charger" },
  { id: "manufacturer", label: "Manufacturer" },
  { id: "plant", label: "Plant" },
  { id: "plantCompany", label: "Plant company" },
  { id: "seatBelts", label: "Seat belts" },
  { id: "restraintInfo", label: "Restraints" },
  { id: "airbags", label: "Airbags" },
  { id: "tpms", label: "TPMS" },
  { id: "abs", label: "ABS" },
  { id: "esc", label: "Stability control" },
  { id: "tractionControl", label: "Traction control" },
  { id: "brakeSystem", label: "Brakes" },
  { id: "entertainment", label: "Entertainment" },
  { id: "trailerType", label: "Trailer hitch" },
  { id: "trailerBody", label: "Trailer body" },
  { id: "trailerLength", label: "Trailer length" },
  { id: "steering", label: "Steering" },
  { id: "gvwr", label: "GVWR" },
  { id: "gvwrTo", label: "GVWR to" },
];

export interface FactoryFact {
  id: string;
  label: string;
  value: string;
}

function blank(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === "Not Applicable") return "";
  return trimmed;
}

function optionFlag(value: string | undefined): string {
  const raw = blank(value);
  if (!raw || /^no$/i.test(raw)) return "";
  return raw;
}

function formatDisplacement(value: string | undefined): string {
  const raw = blank(value);
  if (!raw) return "";
  const liters = Number.parseFloat(raw);
  if (!Number.isFinite(liters)) return `${raw}L`;
  const rounded = Math.round(liters * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}.0` : String(rounded);
}

function formatRange(from: string | undefined, to: string | undefined, suffix = ""): string {
  const start = blank(from);
  const end = blank(to);
  const num = (raw: string) => {
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? String(Math.round(parsed)) : raw;
  };
  if (start && end && start !== end) return `${num(start)}–${num(end)}${suffix}`;
  if (start) return `${num(start)}${suffix}`;
  return "";
}

function joinLabeled(pairs: Array<[string, string | undefined]>): string {
  return pairs
    .map(([label, value]) => {
      const raw = blank(value);
      return raw ? `${label}: ${raw}` : "";
    })
    .filter(Boolean)
    .join(" · ");
}

function hybridFrom(result: NhtsaVinValues): string {
  const level = blank(result.ElectrificationLevel);
  const other = blank(result.OtherEngineInfo);
  const hay = `${level} ${other}`;
  if (/\bBEV\b/i.test(level)) return "";
  if (/\b(HEV|PHEV|MHEV|hybrid)\b/i.test(hay)) return level || other;
  return "";
}

function leftoverFacts(result: NhtsaVinValues): Record<string, string> {
  const extra: Record<string, string> = {};
  for (const [key, value] of Object.entries(result)) {
    if (SKIP_EXTRA.has(key)) continue;
    const raw = blank(value);
    if (raw) extra[key] = raw;
  }
  return extra;
}

export function emptyVehicleSpecs(overrides: Partial<VehicleSpecs> = {}): VehicleSpecs {
  return {
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    trim2: "",
    series: "",
    series2: "",
    bodyClass: "",
    vehicleType: "",
    driveType: "",
    transmission: "",
    transmissionSpeeds: "",
    engineDisplacement: "",
    engineModel: "",
    cylinders: "",
    engineConfig: "",
    engineHP: "",
    turbo: "",
    valveTrain: "",
    fuelType: "",
    fuelTypeSecondary: "",
    hybrid: "",
    electrificationLevel: "",
    evDriveUnit: "",
    batteryType: "",
    batteryKWh: "",
    chargerLevel: "",
    manufacturer: "",
    plant: "",
    plantCompany: "",
    doors: "",
    cabType: "",
    gvwr: "",
    gvwrTo: "",
    seatBelts: "",
    restraintInfo: "",
    airbags: "",
    tpms: "",
    abs: "",
    esc: "",
    tractionControl: "",
    entertainment: "",
    trailerType: "",
    trailerBody: "",
    trailerLength: "",
    brakeSystem: "",
    fuelInjection: "",
    engineManufacturer: "",
    otherEngineInfo: "",
    steering: "",
    errorText: "",
    plate: "",
    plateState: "",
    mileage: "",
    concern: "",
    identifiedBy: "ymm",
    vpicExtra: {},
    ...overrides,
  };
}

export function factoryFacts(specs: VehicleSpecs): FactoryFact[] {
  const named = FACTORY_FACT_FIELDS.flatMap(({ id, label }) => {
    const value = typeof specs[id] === "string" ? specs[id].trim() : "";
    return value ? [{ id, label, value }] : [];
  });
  const extras = Object.entries(specs.vpicExtra ?? {}).flatMap(([key, value]) => {
    const raw = value.trim();
    return raw
      ? [{ id: `extra-${key}`, label: key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " "), value: raw }]
      : [];
  });
  return [...named, ...extras];
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

  return emptyVehicleSpecs({
    vin,
    year: blank(result.ModelYear),
    make: blank(result.Make),
    model: blank(result.Model),
    trim: blank(result.Trim),
    trim2: blank(result.Trim2),
    series: blank(result.Series),
    series2: blank(result.Series2),
    bodyClass: blank(result.BodyClass),
    vehicleType: blank(result.VehicleType),
    driveType: blank(result.DriveType),
    transmission: blank(result.TransmissionStyle),
    transmissionSpeeds: blank(result.TransmissionSpeeds),
    engineDisplacement: displacement ? `${displacement}L` : "",
    engineModel: blank(result.EngineModel),
    cylinders: blank(result.EngineCylinders),
    engineConfig: blank(result.EngineConfiguration),
    engineHP: formatRange(result.EngineHP, result.EngineHP_to),
    turbo: optionFlag(result.Turbo),
    valveTrain: blank(result.ValveTrainDesign),
    fuelType: blank(result.FuelTypePrimary),
    fuelTypeSecondary: blank(result.FuelTypeSecondary),
    hybrid: hybridFrom(result),
    electrificationLevel: blank(result.ElectrificationLevel),
    evDriveUnit: blank(result.EVDriveUnit),
    batteryType: blank(result.BatteryType),
    batteryKWh: formatRange(result.BatteryKWh, result.BatteryKWh_to),
    chargerLevel: blank(result.ChargerLevel),
    manufacturer: blank(result.Manufacturer),
    plant,
    plantCompany: blank(result.PlantCompanyName),
    doors: blank(result.Doors),
    cabType: blank(result.BodyCabType),
    gvwr: blank(result.GVWR),
    gvwrTo: blank(result.GVWR_to),
    seatBelts: blank(result.SeatBeltsAll),
    restraintInfo: blank(result.OtherRestraintSystemInfo),
    airbags: joinLabeled([
      ["Front", result.AirBagLocFront],
      ["Side", result.AirBagLocSide],
      ["Curtain", result.AirBagLocCurtain],
      ["Knee", result.AirBagLocKnee],
      ["Cushion", result.AirBagLocSeatCushion],
    ]),
    tpms: blank(result.TPMS),
    abs: optionFlag(result.ABS),
    esc: optionFlag(result.ESC),
    tractionControl: optionFlag(result.TractionControl),
    entertainment: blank(result.EntertainmentSystem),
    trailerType: blank(result.TrailerType),
    trailerBody: blank(result.TrailerBodyType),
    trailerLength: blank(result.TrailerLength),
    brakeSystem: blank(result.BrakeSystemType),
    fuelInjection: blank(result.FuelInjectionType),
    engineManufacturer: blank(result.EngineManufacturer),
    otherEngineInfo: blank(result.OtherEngineInfo),
    steering: blank(result.SteeringLocation),
    errorText,
    identifiedBy: "vin",
    vpicExtra: leftoverFacts(result),
  });
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
  return emptyVehicleSpecs({
    vin: input.vin ?? "",
    year: input.year.trim(),
    make: input.make.trim(),
    model: input.model.trim(),
    trim: input.trim?.trim() ?? "",
    engineModel: input.engine?.trim() ?? "",
    plate: input.plate?.trim().toUpperCase() ?? "",
    plateState: input.plateState?.trim().toUpperCase() ?? "",
    mileage: input.mileage?.trim() ?? "",
    concern: input.concern?.trim() ?? "",
    identifiedBy: input.vin ? "vin" : "ymm",
  });
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

export async function fetchNameplateRecalls(specs: VehicleSpecs): Promise<RecallRecord[]> {
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

export type CampaignSource = "ymm" | "vendor";

export interface RecallBundle {
  rows: RecallRecord[];
  campaignSource: CampaignSource;
  stamp: string;
  stillNotVinTrue: string;
  vendorFile: boolean;
  publicVinApi: "forbidden";
}

export async function fetchRecallBundle(specs: VehicleSpecs): Promise<RecallBundle> {
  const ymm = await fetchNameplateRecalls(specs);
  const vin = specs.vin?.trim() ?? "";
  const vendor = isValidVin(vin) ? await fetchVendorVinRecalls(vin) : { ok: false, provider: null, rows: [] };
  const rows = mergeNameplateAndVendorRecalls(ymm, vendor.rows);
  const vendorFile = vendor.ok;
  return {
    rows,
    campaignSource: vendorFile ? "vendor" : "ymm",
    stamp: vendorFile ? VENDOR_RECALL_STAMP : VIN_OPEN_CLOSED_STAMP,
    stillNotVinTrue: vendorFile ? VENDOR_RECALL_STAMP : STILL_NOT_VIN_TRUE,
    vendorFile,
    publicVinApi: "forbidden",
  };
}

export async function fetchRecalls(specs: VehicleSpecs): Promise<RecallRecord[]> {
  return (await fetchRecallBundle(specs)).rows;
}

export const SAFERCAR_RECALLS_HOME = "https://www.nhtsa.gov/recalls";

export const VIN_OPEN_CLOSED_STAMP =
  "Open vs closed on THIS VIN is SaferCar, not our file. Public recallsByVin is 403.";

export const STILL_NOT_VIN_TRUE =
  "Still not VIN-true: nameplate campaigns are not open vs closed on this VIN. Public recallsByVin is 403. SaferCar is the close-out.";

export const CAMPAIGN_HEURISTIC_AGE_YEARS = 8;

/** Official SaferCar VIN tool. Do not scrape the HTML. */
export function saferCarVinHref(vin: string): string {
  const clean = vin.trim().toUpperCase();
  if (clean.length === 17) {
    return `${SAFERCAR_RECALLS_HOME}?vin=${encodeURIComponent(clean)}`;
  }
  return SAFERCAR_RECALLS_HOME;
}

/** Official campaign search. VIN query is the close-out when we have the 17. */
export function saferCarCampaignHref(campaignNumber: string, vin?: string): string {
  const cleanVin = vin?.trim().toUpperCase() ?? "";
  if (cleanVin.length === 17) return saferCarVinHref(cleanVin);
  const campaign = campaignNumber.trim();
  if (campaign) return `https://www.nhtsa.gov/search?q=${encodeURIComponent(campaign)}`;
  return SAFERCAR_RECALLS_HOME;
}

export interface RecallCampaignGroup {
  campaignNumber: string;
  component: string;
  components: string[];
  consequence: string;
  remedy: string;
  summary: string;
  reportReceivedDate: string;
  openedYear: string;
  openedStamp: string;
  heuristicAsk: boolean;
  heuristicStamp: string;
  rows: RecallRecord[];
}

const MONTH_INDEX: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

function expandTwoDigitYear(raw: string): string {
  if (raw.length !== 2) return raw;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return "";
  return n >= 70 ? `19${raw}` : `20${raw}`;
}

/** Parse NHTSA campaign dates (YYYYMMDD, ISO, 23-JAN-18, M/D/YYYY). Empty if unknown. */
export function campaignOpenedYear(date: string): string {
  const raw = date.trim();
  if (!raw) return "";
  if (/^\d{8}$/.test(raw)) return raw.slice(0, 4);
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso?.[1]) return iso[1];
  const yearFirst = raw.match(/^(\d{4})\b/);
  if (yearFirst?.[1] && !/[A-Za-z]/.test(raw)) return yearFirst[1];
  const mon = raw.match(/(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{2,4})/);
  if (mon?.[2] && mon[3] && MONTH_INDEX[mon[2].toUpperCase()] !== undefined) {
    return mon[3].length === 2 ? expandTwoDigitYear(mon[3]) : mon[3];
  }
  const us = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (us?.[3]) return us[3].length === 2 ? expandTwoDigitYear(us[3]) : us[3];
  return "";
}

export function campaignOpenedStamp(year: string): string {
  return year
    ? `campaign opened ${year} — SaferCar is the close-out.`
    : "campaign opened year unknown — SaferCar is the close-out.";
}

export function campaignHeuristicAsk(openedYear: string, now = new Date()): boolean {
  const year = Number.parseInt(openedYear, 10);
  if (!Number.isFinite(year) || year < 1966 || year > now.getFullYear()) return false;
  return now.getFullYear() - year >= CAMPAIGN_HEURISTIC_AGE_YEARS;
}

export const CAMPAIGN_HEURISTIC_STAMP =
  "Heuristic — older campaign, ask SaferCar. Not open/closed on this VIN.";

function firstFilled(rows: RecallRecord[], key: keyof RecallRecord): string {
  for (const row of rows) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

export function groupRecallsByCampaign(recalls: RecallRecord[]): RecallCampaignGroup[] {
  const map = new Map<string, RecallRecord[]>();
  for (const row of recalls) {
    const campaign = row.campaignNumber.trim();
    const key = campaign || `__anon:${row.component}:${row.summary.slice(0, 48)}`;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return [...map.entries()].map(([key, rows]) => {
    const campaignNumber = key.startsWith("__anon:") ? "" : key;
    const components = [...new Set(rows.map((row) => row.component.trim()).filter(Boolean))];
    const reportReceivedDate = firstFilled(rows, "reportReceivedDate");
    const openedYear = campaignOpenedYear(reportReceivedDate);
    const heuristicAsk = campaignHeuristicAsk(openedYear);
    return {
      campaignNumber,
      component: components.join(" · ") || "Unspecified",
      components,
      consequence: firstFilled(rows, "consequence"),
      remedy: firstFilled(rows, "remedy"),
      summary: firstFilled(rows, "summary"),
      reportReceivedDate,
      openedYear,
      openedStamp: campaignOpenedStamp(openedYear),
      heuristicAsk,
      heuristicStamp: heuristicAsk ? CAMPAIGN_HEURISTIC_STAMP : "",
      rows,
    };
  });
}

export function engineLineFromSpecs(specs: VehicleSpecs): string {
  return [
    specs.engineDisplacement,
    specs.engineHP && `${specs.engineHP} hp`,
    specs.cylinders && `${specs.cylinders} cyl`,
    specs.engineConfig,
    specs.engineModel,
  ]
    .filter(Boolean)
    .join(" · ");
}

export interface VpicCompletenessLane {
  id: string;
  label: string;
  filled: number;
  of: number;
}

export interface VpicCompleteness {
  populated: number;
  considered: number;
  percent: number;
  lanes: VpicCompletenessLane[];
  stamp: string;
}

const COMPLETENESS_LANES: ReadonlyArray<{ id: string; label: string; ids: ReadonlyArray<keyof VehicleSpecs> }> = [
  { id: "identity", label: "Identity", ids: ["vin", "year", "make", "model"] },
  { id: "trim", label: "Trim / series", ids: ["trim", "trim2", "series", "series2"] },
  { id: "powertrain", label: "Powertrain", ids: ["engineDisplacement", "engineHP", "cylinders", "engineConfig", "engineModel", "fuelType", "fuelTypeSecondary", "hybrid"] },
  { id: "body", label: "Body / drive", ids: ["bodyClass", "vehicleType", "doors", "driveType", "cabType", "transmission"] },
  { id: "plant", label: "Plant", ids: ["manufacturer", "plant", "plantCompany"] },
  { id: "restraint", label: "Restraints / chassis", ids: ["airbags", "seatBelts", "tpms", "abs", "esc", "tractionControl", "brakeSystem"] },
];

function specFilled(specs: VehicleSpecs, id: keyof VehicleSpecs): boolean {
  const value = specs[id];
  return typeof value === "string" && Boolean(value.trim());
}

/** How many vPIC variables we printed. Identification score — not a Chrome catalog. */
export function vpicCompleteness(specs: VehicleSpecs | null | undefined): VpicCompleteness {
  const considered = FACTORY_FACT_FIELDS.length;
  if (!specs) {
    return {
      populated: 0,
      considered,
      percent: 0,
      lanes: COMPLETENESS_LANES.map((lane) => ({ id: lane.id, label: lane.label, filled: 0, of: lane.ids.length })),
      stamp: "vPIC completeness 0 — no decoder row. Identification score, not a Chrome catalog.",
    };
  }
  const populated = FACTORY_FACT_FIELDS.filter(({ id }) => specFilled(specs, id)).length;
  const extra = Object.values(specs.vpicExtra ?? {}).filter((value) => value.trim()).length;
  const scored = populated + extra;
  const denom = considered + extra;
  const percent = denom ? Math.round((scored / denom) * 100) : 0;
  const lanes = COMPLETENESS_LANES.map((lane) => ({
    id: lane.id,
    label: lane.label,
    filled: lane.ids.filter((id) => specFilled(specs, id)).length,
    of: lane.ids.length,
  }));
  return {
    populated: scored,
    considered: denom,
    percent,
    lanes,
    stamp: `vPIC completeness ${percent} (${scored}/${denom} fields). Identification score — not a Chrome catalog.`,
  };
}

export interface IdentificationPacket {
  vin: string;
  headline: string;
  specs: VehicleSpecs;
  engine: {
    displacement: string;
    model: string;
    cylinders: string;
    config: string;
    hp: string;
    line: string;
  };
  campaigns: RecallCampaignGroup[];
  campaignCount: number;
  saferCarUrl: string;
  complaints: NhtsaComplaintSummary;
  chrome: ChromeDataStatus;
  stamp: string;
  stillNotVinTrue: string;
  checkDigit: VinCheckDigitReport;
  wmi: VinStructure;
  completeness: VpicCompleteness;
  plateFormat: PlateFormatResult | null;
  campaignSource: CampaignSource;
  publicVinApi: "forbidden";
  vendorFile: boolean;
}

const EMPTY_COMPLAINTS: NhtsaComplaintSummary = {
  count: 0,
  crash: 0,
  fire: 0,
  injured: 0,
  deaths: 0,
  topComponents: [],
};

export function buildIdentificationPacket(
  specs: VehicleSpecs,
  recalls: RecallRecord[],
  complaints: NhtsaComplaintSummary | null = null,
  source?: Partial<Pick<RecallBundle, "campaignSource" | "stamp" | "stillNotVinTrue" | "vendorFile">>,
): IdentificationPacket {
  const campaigns = groupRecallsByCampaign(recalls);
  const plateFormat =
    specs.plate.trim() || specs.plateState.trim()
      ? inspectPlateFormat({ plate: specs.plate, state: specs.plateState })
      : null;
  const vendorFile = source?.vendorFile === true;
  return {
    vin: specs.vin,
    headline: [specs.year, specs.make, specs.model, specs.trim || specs.series].filter(Boolean).join(" "),
    specs,
    engine: {
      displacement: specs.engineDisplacement,
      model: specs.engineModel,
      cylinders: specs.cylinders,
      config: specs.engineConfig,
      hp: specs.engineHP,
      line: engineLineFromSpecs(specs),
    },
    campaigns,
    campaignCount: campaigns.length,
    saferCarUrl: saferCarVinHref(specs.vin),
    complaints: complaints ?? EMPTY_COMPLAINTS,
    chrome: chromeDataStatus(),
    stamp: source?.stamp ?? (vendorFile ? VENDOR_RECALL_STAMP : VIN_OPEN_CLOSED_STAMP),
    stillNotVinTrue: source?.stillNotVinTrue ?? (vendorFile ? VENDOR_RECALL_STAMP : STILL_NOT_VIN_TRUE),
    checkDigit: inspectVinCheckDigit(specs.vin),
    wmi: describeVinStructure(specs.vin),
    completeness: vpicCompleteness(specs),
    plateFormat,
    campaignSource: source?.campaignSource ?? (vendorFile ? "vendor" : "ymm"),
    publicVinApi: "forbidden",
    vendorFile,
  };
}

export async function assembleIdentificationPacket(vin: string): Promise<IdentificationPacket> {
  const specs = await decodeVin(vin);
  const [bundle, complaints] = await Promise.all([
    fetchRecallBundle(specs),
    fetchComplaintSummary(specs.year, specs.make, specs.model),
  ]);
  return buildIdentificationPacket(specs, bundle.rows, complaints, bundle);
}

/** Public REST is year/make/model. VIN open/closed lives on nhtsa.gov/recalls (403 on recallsByVin). */
export interface VinCampaignLookup {
  vin: string;
  publicVinApi: "forbidden";
  campaignSource: CampaignSource;
  vendorFile: boolean;
  campaigns: RecallRecord[];
  grouped: RecallCampaignGroup[];
  saferCarUrl: string;
  stamp: string;
  note: string;
  complaints: NhtsaComplaintSummary;
}

export async function fetchVinCampaignLookup(vin: string): Promise<VinCampaignLookup> {
  const packet = await assembleIdentificationPacket(vin);
  return {
    vin,
    publicVinApi: "forbidden",
    campaignSource: packet.campaignSource,
    vendorFile: packet.vendorFile,
    campaigns: packet.campaigns.flatMap((group) => group.rows),
    grouped: packet.campaigns,
    saferCarUrl: packet.saferCarUrl,
    stamp: packet.stamp,
    note: packet.vendorFile
      ? `${VENDOR_RECALL_STAMP} SaferCar remains the official close-out. We do not scrape nhtsa.gov HTML.`
      : `api.nhtsa.gov/recalls/recallsByVin returns 403. ${STILL_NOT_VIN_TRUE} The list below is year/make/model campaigns — a nameplate row is not a close-out.`,
    complaints: packet.complaints,
  };
}
