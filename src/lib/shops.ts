export const SHOP_JOBS = [
  { id: "independent", label: "Independent repair" },
  { id: "brakes", label: "Brake inspection" },
  { id: "diagnostic", label: "Check-engine diagnosis" },
  { id: "dealer-recall", label: "Dealer recall desk" },
  { id: "alignment", label: "Alignment" },
  { id: "tires", label: "Tires" },
] as const;

export function mapsShopUrl(zip: string, job: string, make?: string): string {
  const where = zip.trim() || "near me";
  const who = make ? `${make} ` : "";
  const query =
    job === "dealer-recall"
      ? `${make ?? ""} dealer service recall ${where}`
      : `${who}${job} auto repair ${where}`;
  return `https://www.google.com/maps/search/${encodeURIComponent(query.trim())}`;
}

export const SHOP_QUESTIONS = [
  "Do you charge a diagnostic hour, and does it apply to the repair if I stay?",
  "Will you write labor hours and OEM or aftermarket part numbers on the RO before you start?",
  "Can I see the old parts and the rotor / pad measurements in millimeters?",
  "If something extra shows up, will you call before you add it?",
  "Are you the shop that will do the work, or do you subcontract?",
];
