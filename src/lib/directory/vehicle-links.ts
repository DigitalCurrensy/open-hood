export const EXAMPLE_VEHICLE = {
  year: "2018",
  make: "Honda",
  model: "Civic",
} as const;

export const EXTERNAL_REL = "noopener noreferrer";

function titleCaseToken(value: string): string {
  return value
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("_");
}

function slug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function vehiclePublicLinks(year: string, make: string, model: string) {
  const y = year.trim();
  const mk = make.trim();
  const md = model.trim();
  const epaName = `${y}_${titleCaseToken(mk)}_${titleCaseToken(md)}`;
  return {
    epaModel: `https://www.fueleconomy.gov/feg/bymodel/${epaName}.shtml`,
    epaFind: "https://www.fueleconomy.gov/feg/findacar.shtml",
    iihs: `https://www.iihs.org/ratings/vehicle/${encodeURIComponent(slug(mk))}/${encodeURIComponent(slug(md))}/${encodeURIComponent(y)}`,
    iihsHome: "https://www.iihs.org/ratings",
    nhtsaVehicle: `https://www.nhtsa.gov/vehicle/${encodeURIComponent(y)}/${encodeURIComponent(mk.toUpperCase())}/${encodeURIComponent(md.toUpperCase())}`,
    nhtsaRecalls: "https://www.nhtsa.gov/recalls",
    nhtsaRatings: "https://www.nhtsa.gov/ratings",
  };
}

export const AUCTION_EXAMPLES = [
  { href: "/auctions?year=2018&make=Honda&model=Civic", label: "2018 Honda Civic", year: "2018", make: "Honda", model: "Civic", q: "" },
  { href: "/auctions?q=1991%20NSX", label: "1991 NSX", year: "", make: "", model: "", q: "1991 NSX" },
] as const;

export function partsExampleHref(part = "oil-filter"): string {
  const params = new URLSearchParams({
    year: EXAMPLE_VEHICLE.year,
    make: EXAMPLE_VEHICLE.make,
    model: EXAMPLE_VEHICLE.model,
    part,
  });
  return `/directory/parts?${params.toString()}`;
}
