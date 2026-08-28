import type { HistorySourceRow, HistoryTitleRow } from "@/lib/history/types";

export const TITLE_BRAND_INTRO =
  "A paid title report is a different file than NHTSA. We will not stamp salvage, wrecks, or owner count from a decoder.";

export const TITLE_BRAND_ROWS: HistoryTitleRow[] = [
  {
    id: "brands",
    label: "Title brands",
    paidReport: "Salvage, junk, rebuilt, flood, lemon, hail, fire, theft recovery — if a state reported it.",
    nhtsa: "None. vPIC is the factory build, not the DMV jacket.",
  },
  {
    id: "accidents",
    label: "Accidents / damage",
    paidReport: "Insurance and auction hits the vendor was sold. Incomplete by design.",
    nhtsa: "We do not invent wrecks. SaferCar complaints are other owners on the nameplate.",
  },
  {
    id: "odometer",
    label: "Odometer / rollback",
    paidReport: "Title and inspection readings, rollback flags when reported.",
    nhtsa: "Miles on this desk are what you typed or stamped in the owner log.",
  },
  {
    id: "owners",
    label: "Owners / use",
    paidReport: "Owner count, personal vs fleet/rental/lease — when the vendor has it.",
    nhtsa: "Not in the decode. Not in a campaign list.",
  },
  {
    id: "theft",
    label: "Theft / lien",
    paidReport: "NMVTIS and insurer feeds, sometimes a lien hint. Not a legal search.",
    nhtsa: "Not available. Do not treat a quiet SaferCar page as a clean theft file.",
  },
  {
    id: "service",
    label: "Service records",
    paidReport: "Shops that report to Carfax / AutoCheck. Most independents never send a line.",
    nhtsa: "Your notebook on this device. Stamp it on /log if you want it in the jacket.",
  },
  {
    id: "recalls",
    label: "Recalls",
    paidReport: "Often a campaign list, still not the VIN open/closed close-out.",
    nhtsa: "Live nameplate campaigns here. VIN open/closed is the SaferCar link-out.",
  },
];

export const HISTORY_SOURCE_LEDGER: HistorySourceRow[] = [
  {
    id: "vpic",
    stamp: "vPIC",
    label: "NHTSA VIN decode",
    lane: "live",
    detail: "Year, make, model, engine, plant, trim/series as decoder fields.",
  },
  {
    id: "recalls",
    stamp: "Recalls",
    label: "SaferCar campaigns",
    lane: "live",
    detail:
      "Nameplate campaigns from api.nhtsa.gov. VIN file is CarsXE /v1/recalls when CARSXE_API_KEY is on — vendor file · not NHTSA public recallsByVin (403). No key → SaferCar link only. We do not scrape nhtsa.gov HTML.",
  },
  {
    id: "complaints",
    stamp: "ODI",
    label: "Owner complaints",
    lane: "live",
    detail: "Counts and crash/fire flags for the nameplate. Not this VIN’s wrecks.",
  },
  {
    id: "ncap",
    stamp: "NCAP",
    label: "5-star ratings",
    lane: "live",
    detail: "Tested variant. A different cab or airbag pack can change the row.",
  },
  {
    id: "owner-log",
    stamp: "Log",
    label: "Owner service log",
    lane: "live",
    detail: "localStorage openhood.service-log on this device. We do not invent dates.",
  },
  {
    id: "plate",
    stamp: "Plate",
    label: "Plate-to-VIN",
    lane: "live",
    detail: "Only if CARSXE_API_KEY or MARKETCHECK_API_KEY is set. Otherwise a note.",
  },
  {
    id: "title",
    stamp: "Title",
    label: "VinAudit / CarsXE history",
    lane: "live",
    detail: "Live only if VINAUDIT_API_KEY or CARSXE_HISTORY_API_KEY (or CARSXE_API_KEY) is on. Off → empty. Not a Carfax file.",
  },
  {
    id: "nmvtis",
    stamp: "NMVTIS",
    label: "Federal title snapshot",
    lane: "link-out",
    detail: "Official consumer pages. We do not scrape vehiclehistory.bja.ojp.gov.",
  },
  {
    id: "carfax",
    stamp: "Carfax",
    label: "Paid history report",
    lane: "link-out",
    detail: "VIN purchase URL when we have 17 characters. Their accident file, not ours.",
  },
  {
    id: "autocheck",
    stamp: "AutoCheck",
    label: "Paid history report",
    lane: "link-out",
    detail: "VIN purchase URL when we have 17 characters. Experian score stays outbound.",
  },
  {
    id: "nicb",
    stamp: "NICB",
    label: "NICB VINCheck",
    lane: "link-out",
    detail: "Free theft / salvage form on nicb.org. Type the VIN there. We do not scrape it.",
  },
];
