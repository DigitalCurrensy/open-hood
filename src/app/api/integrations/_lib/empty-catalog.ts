export const EMPTY_SKUS: [] = [];
export const EMPTY_HOURS: [] = [];

export const LICENSED_VENDORS = [
  {
    id: "tecdoc",
    name: "TecDoc / TecAlliance",
    env: "TECALLIANCE_KEY",
    contract: "TecAlliance catalog license",
    homeUrl: "https://www.tecalliance.net/en/contact/",
    desk: "/directory/parts",
  },
  {
    id: "motor",
    name: "MOTOR / Identifix",
    env: "MOTOR_API_KEY",
    contract: "Hearst Aftermarket shop license",
    homeUrl: "https://www.motor.com/",
    desk: "/estimate",
  },
  {
    id: "partstech",
    name: "PartsTech / Nexpart / Worldpac",
    env: "PARTSTECH_API_KEY",
    contract: "PartsTech shop parts book",
    homeUrl: "https://www.partstech.com/contact",
    desk: "/finder",
  },
  {
    id: "chrome",
    name: "Chrome Data (J.D. Power)",
    env: "CHROME_DATA_KEY",
    contract: "J.D. Power Chrome Data",
    homeUrl: "https://www.jdpower.com/business/automotive/chrome-data",
    desk: "/sticker",
  },
  {
    id: "mitchell",
    name: "Mitchell / ProDemand",
    env: "MITCHELL_API_KEY",
    contract: "Mitchell extract",
    homeUrl: "https://www.mitchell.com/contact-us",
    desk: "/estimate",
  },
  {
    id: "alldata",
    name: "ALLDATA",
    env: "ALLDATA_API_KEY",
    contract: "ALLDATA subscription",
    homeUrl: "https://www.alldata.com/us/en/contact",
    desk: "/expert",
  },
] as const;

export type LicensedVendorId = (typeof LICENSED_VENDORS)[number]["id"];

export function emptyCatalogAdapter(id: LicensedVendorId) {
  const vendor = LICENSED_VENDORS.find((row) => row.id === id);
  if (!vendor) {
    return {
      configured: false,
      connected: false,
      probed: "none" as const,
      skus: EMPTY_SKUS,
      hours: EMPTY_HOURS,
      contract: "",
      unlocks: "Licensed catalog stays empty. No dummy SKUs.",
    };
  }
  return {
    configured: false,
    connected: false,
    probed: "none" as const,
    skus: EMPTY_SKUS,
    hours: EMPTY_HOURS,
    vendor: vendor.id,
    name: vendor.name,
    env: vendor.env,
    contract: vendor.contract,
    keyPresent: Boolean(process.env[vendor.env]?.trim()),
    unlocks: `${vendor.contract} would fill this bay after a signed contract. A key sitting in env does not invent SKUs. ROADMAP.`,
    homeUrl: vendor.homeUrl,
    desk: vendor.desk,
    roadmap: "/ROADMAP.md",
  };
}

export function licensedVendorRows() {
  return LICENSED_VENDORS.map((row) => ({
    id: row.id,
    name: row.name,
    env: row.env,
    configured: false,
    connected: false,
    skus: EMPTY_SKUS,
    contract: row.contract,
  }));
}
