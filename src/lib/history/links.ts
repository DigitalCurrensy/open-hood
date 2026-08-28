import type { HistoryLink, HistoryLinkOutBlock } from "@/lib/history/types";
import { HISTORY_PHOTO_VIN_HREF } from "@/config/nav/history";

export const NMVTIS_HOME = "https://vehiclehistory.bja.ojp.gov/" as const;
export const NMVTIS_GOV = "https://www.nmvtis.gov/" as const;
export const NMVTIS_CONSUMERS = "https://vehiclehistory.bja.ojp.gov/nmvtis_consumers" as const;
export const CARFAX_PORTAL = "https://www.carfax.com/vehicle-history-reports/" as const;
export const CARFAX_VIN_BASE = "https://www.carfax.com/vin/" as const;
export const AUTOCHECK_PORTAL = "https://www.autocheck.com/vehiclehistory/vehicle-history-reports" as const;
export const AUTOCHECK_VIN_BASE = "https://www.autocheck.com/vehiclehistory/autocheck/en/vin/" as const;
export const NICB_VINCHECK = "https://www.nicb.org/vincheck" as const;
export const NHTSA_RECALLS = "https://www.nhtsa.gov/recalls" as const;
export const NHTSA_DECODER = "https://vpic.nhtsa.dot.gov/decoder" as const;

export const NMVTIS_EXPLAIN = [
  "NMVTIS is the federal title snapshot: brands, junk/salvage, and the latest title jurisdiction the states reported.",
  "This bay does not scrape it. Consumers buy a report from an approved provider on the official pages.",
  "A missing NMVTIS row is not a clean title. It is a missing file.",
] as const;

export function carfaxPurchaseUrl(vin: string): HistoryLink {
  const clean = vin.trim().toUpperCase();
  if (clean.length === 17) {
    return {
      id: "carfax",
      stamp: "Carfax",
      label: "Buy a Carfax with this VIN",
      href: `${CARFAX_VIN_BASE}${encodeURIComponent(clean)}`,
      kind: "vin",
      detail: "Outbound purchase. We do not pull their accident file.",
    };
  }
  return {
    id: "carfax",
    stamp: "Carfax",
    label: "Carfax report portal",
    href: CARFAX_PORTAL,
    kind: "portal",
    detail: "Need the 17 to pre-fill. Portal still sells the report.",
  };
}

export function autocheckPurchaseUrl(vin: string): HistoryLink {
  const clean = vin.trim().toUpperCase();
  if (clean.length === 17) {
    return {
      id: "autocheck",
      stamp: "AutoCheck",
      label: "Buy an AutoCheck with this VIN",
      href: `${AUTOCHECK_VIN_BASE}${encodeURIComponent(clean)}`,
      kind: "vin",
      detail: "Experian AutoCheck purchase. Score and brands stay on their side.",
    };
  }
  return {
    id: "autocheck",
    stamp: "AutoCheck",
    label: "AutoCheck report portal",
    href: AUTOCHECK_PORTAL,
    kind: "portal",
    detail: "VIN deep-link needs 17 characters. Portal still sells the report.",
  };
}

export function nicbVincheckUrl(vin: string): HistoryLink {
  const clean = vin.trim().toUpperCase();
  return {
    id: "nicb",
    stamp: "NICB",
    label: clean.length === 17 ? "NICB VINCheck — type this VIN there" : "NICB VINCheck",
    href: NICB_VINCHECK,
    kind: "portal",
    detail: "Free NICB theft / salvage form. Type the VIN on their site. We do not scrape it.",
  };
}

export function saferCarVinUrl(vin: string): HistoryLink {
  const clean = vin.trim().toUpperCase();
  return {
    id: "safercar-vin",
    stamp: "SaferCar",
    label: clean.length === 17 ? "NHTSA VIN recall check" : "NHTSA recall checker",
    href: clean.length === 17 ? `${NHTSA_RECALLS}?vin=${encodeURIComponent(clean)}` : NHTSA_RECALLS,
    kind: clean.length === 17 ? "vin" : "official",
    detail: "Open vs closed on this VIN lives on nhtsa.gov. Our list is the nameplate campaigns.",
  };
}

export function photoVinLink(): HistoryLink {
  return {
    id: "photo-vin",
    stamp: "Bay",
    label: "Photo the VIN on the bay",
    href: HISTORY_PHOTO_VIN_HREF,
    kind: "official",
    detail: "Door jamb or windshield plate. A plate photo is a note until a commercial decoder is on.",
  };
}

export function nmvtisLinks(): HistoryLink[] {
  return [
    {
      id: "nmvtis-bja",
      stamp: "BJA",
      label: "NMVTIS consumer home",
      href: NMVTIS_HOME,
      kind: "official",
      detail: "Official DOJ / BJA consumer page. Buy from an approved provider.",
    },
    {
      id: "nmvtis-gov",
      stamp: "NMVTIS",
      label: "nmvtis.gov",
      href: NMVTIS_GOV,
      kind: "official",
      detail: "Program site. We do not scrape title records.",
    },
    {
      id: "nmvtis-consumers",
      stamp: "Buy",
      label: "How consumers get a report",
      href: NMVTIS_CONSUMERS,
      kind: "official",
      detail: "What the snapshot covers, and who is allowed to sell it.",
    },
  ];
}

export function buildLinkOut(vin: string): HistoryLinkOutBlock {
  return {
    nmvtis: {
      explain: [...NMVTIS_EXPLAIN],
      links: nmvtisLinks(),
    },
    reports: [carfaxPurchaseUrl(vin), autocheckPurchaseUrl(vin), nicbVincheckUrl(vin)],
    saferCarVin: saferCarVinUrl(vin),
    photoVin: photoVinLink(),
  };
}
