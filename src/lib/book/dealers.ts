import type { BookDealerLink } from "@/lib/book/types";

type LinkKind = BookDealerLink["kind"];

interface MakePattern {
  id: string;
  aliases: string[];
  links: Array<{
    id: string;
    label: string;
    kind: LinkKind;
    note: string;
    href: (zip: string) => string;
  }>;
}

function q(zip: string): string {
  return encodeURIComponent(zip.trim());
}

const PATTERNS: MakePattern[] = [
  {
    id: "honda",
    aliases: ["honda"],
    links: [
      {
        id: "honda-locator",
        label: "Honda dealer locator",
        kind: "locator",
        note: "Factory locator. Enter the ZIP if the page does not keep it.",
        href: (zip) => `https://automobiles.honda.com/tools/dealer-locator?zipCode=${q(zip)}`,
      },
      {
        id: "honda-dealers",
        label: "HondaDealers.com",
        kind: "association",
        note: "Dealer association. We do not hold a Honda bay.",
        href: () => "https://www.hondadealers.com/",
      },
      {
        id: "honda-schedule",
        label: "Honda owners — schedule service",
        kind: "schedule",
        note: "Their appointment book. Not ours.",
        href: () => "https://owners.honda.com/service-maintenance/schedule-service",
      },
    ],
  },
  {
    id: "acura",
    aliases: ["acura"],
    links: [
      {
        id: "acura-locator",
        label: "Acura dealer locator",
        kind: "locator",
        note: "Factory locator with ZIP.",
        href: (zip) => `https://www.acura.com/dealer-locator?zip=${q(zip)}`,
      },
    ],
  },
  {
    id: "toyota",
    aliases: ["toyota"],
    links: [
      {
        id: "toyota-locator",
        label: "Toyota dealers",
        kind: "locator",
        note: "toyota.com dealers by ZIP.",
        href: (zip) => `https://www.toyota.com/dealers/?zipcode=${q(zip)}`,
      },
      {
        id: "toyota-service",
        label: "Toyota service",
        kind: "schedule",
        note: "Their service desk. We do not book it.",
        href: () => "https://www.toyota.com/service/",
      },
    ],
  },
  {
    id: "lexus",
    aliases: ["lexus"],
    links: [
      {
        id: "lexus-locator",
        label: "Lexus dealers",
        kind: "locator",
        note: "Factory dealer search.",
        href: (zip) => `https://www.lexus.com/dealers?zipcode=${q(zip)}`,
      },
    ],
  },
  {
    id: "ford",
    aliases: ["ford"],
    links: [
      {
        id: "ford-locator",
        label: "Ford dealerships",
        kind: "locator",
        note: "Ford dealer search.",
        href: (zip) => `https://www.ford.com/dealerships/dealer-search/?search=${q(zip)}`,
      },
      {
        id: "ford-schedule",
        label: "Ford — schedule service",
        kind: "schedule",
        note: "OEM appointment start. Their roof.",
        href: () => "https://www.ford.com/support/schedule-service/",
      },
    ],
  },
  {
    id: "lincoln",
    aliases: ["lincoln"],
    links: [
      {
        id: "lincoln-locator",
        label: "Lincoln retailers",
        kind: "locator",
        note: "Lincoln dealer search.",
        href: (zip) => `https://www.lincoln.com/dealerships/?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "chevrolet",
    aliases: ["chevrolet", "chevy"],
    links: [
      {
        id: "chevy-locator",
        label: "Chevrolet dealer locator",
        kind: "locator",
        note: "GM locator. ZIP on the query.",
        href: (zip) => `https://www.chevrolet.com/dealer-locator?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "gmc",
    aliases: ["gmc"],
    links: [
      {
        id: "gmc-locator",
        label: "GMC dealer locator",
        kind: "locator",
        note: "GM locator.",
        href: (zip) => `https://www.gmc.com/dealer-locator?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "buick",
    aliases: ["buick"],
    links: [
      {
        id: "buick-locator",
        label: "Buick dealer locator",
        kind: "locator",
        note: "GM locator.",
        href: (zip) => `https://www.buick.com/dealer-locator?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "cadillac",
    aliases: ["cadillac"],
    links: [
      {
        id: "cadillac-locator",
        label: "Cadillac dealer locator",
        kind: "locator",
        note: "GM locator.",
        href: (zip) => `https://www.cadillac.com/dealer-locator?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "nissan",
    aliases: ["nissan"],
    links: [
      {
        id: "nissan-locator",
        label: "Nissan dealer locator",
        kind: "locator",
        note: "Enter ZIP on their locator if the query drops.",
        href: (zip) => `https://www.nissanusa.com/dealer-locator.html#zip=${q(zip)}`,
      },
    ],
  },
  {
    id: "infiniti",
    aliases: ["infiniti"],
    links: [
      {
        id: "infiniti-locator",
        label: "INFINITI retailers",
        kind: "locator",
        note: "Factory locator.",
        href: (zip) => `https://www.infinitiusa.com/dealer-locator.html#zip=${q(zip)}`,
      },
    ],
  },
  {
    id: "hyundai",
    aliases: ["hyundai"],
    links: [
      {
        id: "hyundai-locator",
        label: "Hyundai dealer locator",
        kind: "locator",
        note: "Service-flagged locator.",
        href: (zip) => `https://www.hyundaiusa.com/us/en/dealer-locator?service=true&zipCode=${q(zip)}`,
      },
    ],
  },
  {
    id: "kia",
    aliases: ["kia"],
    links: [
      {
        id: "kia-locator",
        label: "Kia find a dealer",
        kind: "locator",
        note: "Factory dealer search.",
        href: (zip) => `https://www.kia.com/us/en/find-a-dealer?zip=${q(zip)}`,
      },
    ],
  },
  {
    id: "genesis",
    aliases: ["genesis"],
    links: [
      {
        id: "genesis-locator",
        label: "Genesis retailers",
        kind: "locator",
        note: "Factory locator.",
        href: (zip) => `https://www.genesis.com/us/en/retailer-locator.html?zip=${q(zip)}`,
      },
    ],
  },
  {
    id: "subaru",
    aliases: ["subaru"],
    links: [
      {
        id: "subaru-locator",
        label: "Subaru retailers",
        kind: "locator",
        note: "Factory retailer search.",
        href: (zip) => `https://www.subaru.com/retailers.html?zipcode=${q(zip)}`,
      },
    ],
  },
  {
    id: "mazda",
    aliases: ["mazda"],
    links: [
      {
        id: "mazda-locator",
        label: "Mazda find a dealer",
        kind: "locator",
        note: "Factory locator.",
        href: (zip) => `https://www.mazdausa.com/find-a-dealer?zipcode=${q(zip)}`,
      },
    ],
  },
  {
    id: "volkswagen",
    aliases: ["volkswagen", "vw"],
    links: [
      {
        id: "vw-locator",
        label: "Volkswagen dealer locator",
        kind: "locator",
        note: "Factory locator.",
        href: (zip) => `https://www.vw.com/en/dealer-locator.html?zip=${q(zip)}`,
      },
    ],
  },
  {
    id: "audi",
    aliases: ["audi"],
    links: [
      {
        id: "audi-locator",
        label: "Audi dealer search",
        kind: "locator",
        note: "Factory dealer search.",
        href: (zip) => `https://www.audiusa.com/us/web/en/dealer-search.html?zip=${q(zip)}`,
      },
    ],
  },
  {
    id: "bmw",
    aliases: ["bmw"],
    links: [
      {
        id: "bmw-locator",
        label: "BMW dealers",
        kind: "locator",
        note: "Factory dealer list. Enter ZIP on their page.",
        href: () => "https://www.bmwusa.com/all-bmw-dealers.html",
      },
    ],
  },
  {
    id: "mini",
    aliases: ["mini", "mini cooper"],
    links: [
      {
        id: "mini-locator",
        label: "MINI dealers",
        kind: "locator",
        note: "Factory locator.",
        href: () => "https://www.miniusa.com/dealers.html",
      },
    ],
  },
  {
    id: "mercedes-benz",
    aliases: ["mercedes", "mercedes-benz", "mercedes benz", "mb"],
    links: [
      {
        id: "mb-locator",
        label: "Mercedes-Benz dealers",
        kind: "locator",
        note: "Factory dealer search.",
        href: (zip) => `https://www.mbusa.com/en/dealers?zipCode=${q(zip)}`,
      },
    ],
  },
  {
    id: "jeep",
    aliases: ["jeep"],
    links: [
      {
        id: "jeep-locator",
        label: "Jeep dealers",
        kind: "locator",
        note: "Stellantis locator.",
        href: (zip) => `https://www.jeep.com/dealers.html?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "ram",
    aliases: ["ram"],
    links: [
      {
        id: "ram-locator",
        label: "Ram dealers",
        kind: "locator",
        note: "Stellantis locator.",
        href: (zip) => `https://www.ramtrucks.com/dealers.html?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "dodge",
    aliases: ["dodge"],
    links: [
      {
        id: "dodge-locator",
        label: "Dodge dealers",
        kind: "locator",
        note: "Stellantis locator.",
        href: (zip) => `https://www.dodge.com/dealers.html?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "chrysler",
    aliases: ["chrysler"],
    links: [
      {
        id: "chrysler-locator",
        label: "Chrysler dealers",
        kind: "locator",
        note: "Stellantis locator.",
        href: (zip) => `https://www.chrysler.com/dealers.html?search=${q(zip)}`,
      },
    ],
  },
  {
    id: "volvo",
    aliases: ["volvo"],
    links: [
      {
        id: "volvo-locator",
        label: "Volvo retailers",
        kind: "locator",
        note: "Factory retailer search.",
        href: (zip) => `https://www.volvocars.com/us/dealers/?zip=${q(zip)}`,
      },
    ],
  },
  {
    id: "porsche",
    aliases: ["porsche"],
    links: [
      {
        id: "porsche-locator",
        label: "Porsche dealer search",
        kind: "locator",
        note: "Factory dealer search.",
        href: () => "https://www.porsche.com/usa/dealersearch/",
      },
    ],
  },
  {
    id: "tesla",
    aliases: ["tesla"],
    links: [
      {
        id: "tesla-service",
        label: "Tesla service",
        kind: "schedule",
        note: "Tesla is not a dealer franchise. Their service centers. We do not book them.",
        href: () => "https://www.tesla.com/support/service",
      },
      {
        id: "tesla-findus",
        label: "Tesla locations",
        kind: "locator",
        note: "Service / body / parts locations.",
        href: () => "https://www.tesla.com/findus",
      },
    ],
  },
];

function normalizeMake(make: string): string {
  return make.trim().toLowerCase().replace(/[._]/g, " ").replace(/\s+/g, " ");
}

function mapsDealerLink(make: string, zip: string): BookDealerLink {
  const who = make.trim() || "dealer";
  const where = zip.trim();
  const query = [who, "dealer service", where].filter(Boolean).join(" ");
  return {
    id: "maps-dealer",
    label: `Maps — ${who} dealer ${where || "near me"}`.trim(),
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    kind: "maps",
    note: "A search you could have typed. Not a booked appointment.",
  };
}

export function matchDealerPattern(make: string): MakePattern | null {
  const key = normalizeMake(make);
  if (!key) return null;
  return (
    PATTERNS.find((row) => row.aliases.some((alias) => alias === key || key.includes(alias))) ?? null
  );
}

export function dealerAppointmentLinks(make: string, zip: string): BookDealerLink[] {
  const pattern = matchDealerPattern(make);
  const zipValue = zip.trim();
  const fromPattern =
    pattern?.links.map((link) => ({
      id: link.id,
      label: link.label,
      href: link.href(zipValue),
      kind: link.kind,
      note: link.note,
    })) ?? [];
  return [...fromPattern, mapsDealerLink(make, zipValue)];
}
