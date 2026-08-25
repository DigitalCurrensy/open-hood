import type { FlaggedQuoteItem, QuoteAnalysisResult, VehicleSpecs } from "@/lib/types";

interface CatalogPart {
  pattern: RegExp;
  fairLow: number;
  fairHigh: number;
  label: string;
  upsellHint?: string;
}

const PART_BOOK: CatalogPart[] = [
  {
    pattern: /cabin\s*(air)?\s*filter/i,
    fairLow: 20,
    fairHigh: 45,
    label: "Cabin air filter",
    upsellHint: "This is a glove-box DIY on most cars. $80+ is almost always padding.",
  },
  {
    pattern: /engine\s*air\s*filter|air\s*filter(?!\s*cabin)/i,
    fairLow: 20,
    fairHigh: 50,
    label: "Engine air filter",
  },
  {
    pattern: /oil\s*(and\s*)?(filter\s*)?change|lube/i,
    fairLow: 70,
    fairHigh: 140,
    label: "Synthetic oil change",
  },
  {
    pattern: /wiper/i,
    fairLow: 25,
    fairHigh: 55,
    label: "Wiper blades",
  },
  {
    pattern: /fuel\s*(injector|system)\s*(clean|flush|service)/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Fuel system flush",
    upsellHint: "Rarely indicated. Ask what test failed before you authorize a bottled additive at shop prices.",
  },
  {
    pattern: /transmission\s*(flush|service)/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Transmission flush",
    upsellHint: "Many OEMs specify drain-and-fill, not a pressurized flush. Ask for the page in the service schedule.",
  },
  {
    pattern: /throttle\s*body/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Throttle body service",
    upsellHint: "Not a scheduled item on most late-model cars. Ask what symptom it fixes.",
  },
  {
    pattern: /cabin|pollen|micron/i,
    fairLow: 20,
    fairHigh: 45,
    label: "Cabin filter",
  },
  {
    pattern: /brake\s*pad/i,
    fairLow: 180,
    fairHigh: 420,
    label: "Brake pads (axle, parts + labor)",
  },
  {
    pattern: /rotor|disc/i,
    fairLow: 250,
    fairHigh: 550,
    label: "Rotors (axle, parts + labor)",
  },
  {
    pattern: /battery/i,
    fairLow: 150,
    fairHigh: 280,
    label: "Battery",
  },
  {
    pattern: /spark\s*plug/i,
    fairLow: 120,
    fairHigh: 320,
    label: "Spark plugs (set)",
  },
];

function dollars(text: string): number[] {
  return [...text.matchAll(/\$?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g)]
    .map((match) => Number.parseFloat(match[1].replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value >= 8);
}

function parseLineItems(quoteText: string): Array<{ item: string; price: number | null }> {
  const lines = quoteText
    .split(/\r?\n|;|\u2022/)
    .map((line) => line.trim())
    .filter((line) => line.length > 3);

  if (lines.length <= 1) {
    return PART_BOOK.filter((part) => part.pattern.test(quoteText)).map((part) => {
      const prices = dollars(quoteText);
      return { item: part.label, price: prices[0] ?? null };
    });
  }

  return lines.map((line) => {
    const prices = dollars(line);
    return { item: line.replace(/\$[\d,.]+/g, "").trim(), price: prices.at(-1) ?? null };
  });
}

function flagItem(item: string, quotedPrice: number | null): FlaggedQuoteItem | null {
  const book = PART_BOOK.find((entry) => entry.pattern.test(item));
  if (!book) return null;

  if (book.fairHigh === 0) {
    return {
      item: book.label,
      quotedPrice,
      fairPriceRange: "Usually $0 unless a test failed",
      warning: book.upsellHint ?? "Ask for the OEM service-interval page.",
      category: "upsell",
    };
  }

  if (quotedPrice != null && quotedPrice > book.fairHigh * 1.35) {
    return {
      item: book.label,
      quotedPrice,
      fairPriceRange: `$${book.fairLow.toFixed(0)} – $${book.fairHigh.toFixed(0)}`,
      warning: book.upsellHint ?? `Quoted well above typical retail + independent-shop labor.`,
      category: "markup",
    };
  }

  if (book.upsellHint && quotedPrice != null && quotedPrice > book.fairHigh) {
    return {
      item: book.label,
      quotedPrice,
      fairPriceRange: `$${book.fairLow.toFixed(0)} – $${book.fairHigh.toFixed(0)}`,
      warning: book.upsellHint,
      category: "markup",
    };
  }

  return {
    item: book.label,
    quotedPrice,
    fairPriceRange: `$${book.fairLow.toFixed(0)} – $${book.fairHigh.toFixed(0)}`,
    warning: "Within a normal independent-shop band. Still ask to see the old part.",
    category: "ok",
  };
}

function scriptsFor(flags: FlaggedQuoteItem[], specs: VehicleSpecs): string[] {
  const vehicle = [specs.year, specs.make, specs.model].filter(Boolean).join(" ") || "this vehicle";
  const lines: string[] = [];

  for (const flag of flags.filter((item) => item.category !== "ok")) {
    if (flag.quotedPrice != null) {
      lines.push(
        `I noticed ${flag.item} is quoted at $${flag.quotedPrice.toFixed(2)}. Typical range is ${flag.fairPriceRange}. I'll hold off on that today.`,
      );
    } else {
      lines.push(`Could you show me the manufacturer page that requires ${flag.item} on a ${vehicle}?`);
    }
  }

  if (flags.some((item) => /rotor|brake/i.test(item.item))) {
    lines.push(
      `Please measure the rotor thickness in millimeters and show me the reading. I want the number next to the ${vehicle} discard spec, not just "they're due."`,
    );
  }

  if (lines.length === 0) {
    lines.push(
      `Before you start, please write the labor hours and the OEM part numbers on the RO. I want to see the old parts when you're done.`,
    );
  }

  lines.push(`If anything extra shows up after you open it up, call me before you add it. Don't go past the written estimate.`);
  return lines.slice(0, 5);
}

export function analyzeQuoteText(quoteText: string, specs: VehicleSpecs): QuoteAnalysisResult {
  const items = parseLineItems(quoteText);
  const flaggedItems = items
    .map((row) => flagItem(row.item, row.price))
    .filter((row): row is FlaggedQuoteItem => Boolean(row));

  const problems = flaggedItems.filter((item) => item.category !== "ok");
  const prices = items.map((row) => row.price).filter((price): price is number => price != null);
  const totalQuoted = prices.length ? prices.reduce((sum, price) => sum + price, 0) : null;

  return {
    isQuoteFair: problems.length === 0 && flaggedItems.length > 0,
    shopName: null,
    laborRateEstimate: null,
    totalQuoted,
    flaggedItems: flaggedItems.length
      ? flaggedItems
      : [
          {
            item: "Unparsed estimate",
            quotedPrice: totalQuoted,
            fairPriceRange: "Need line items",
            warning: "I couldn't map this to known jobs. Add OPENAI_API_KEY for photo/handwriting analysis, or paste each line (part + price).",
            category: "ok",
          },
        ],
    mechanicScript: scriptsFor(problems, specs),
    summary:
      problems.length === 0
        ? "Nothing jumped out as a classic upsell. Still ask for OEM part numbers and to see the old parts."
        : `${problems.length} line item${problems.length === 1 ? "" : "s"} look high or optional. Use the counter script before you authorize work.`,
    usedVisionModel: false,
  };
}

export function demoQuote(specs: VehicleSpecs): QuoteAnalysisResult {
  const flaggedItems: FlaggedQuoteItem[] = [
    {
      item: "Cabin Air Filter Replacement",
      quotedPrice: 85,
      fairPriceRange: "$20.00 – $35.00",
      warning: "Extreme markup for labor. This part is about $15 and is a glove-box swap on most cars.",
      category: "markup",
    },
    {
      item: "Transmission Flush",
      quotedPrice: 249,
      fairPriceRange: "Usually $0 unless the schedule says drain-and-fill",
      warning: "Flush services are a frequent add-on. Ask for the OEM interval page for this VIN's mileage.",
      category: "upsell",
    },
  ];

  return {
    isQuoteFair: false,
    shopName: "Bay 3 Express",
    laborRateEstimate: "$195/hr implied — above typical independent ($120–150)",
    totalQuoted: 334,
    flaggedItems,
    mechanicScript: scriptsFor(flaggedItems, specs),
    summary: "Demo ticket: a cheap cabin filter padded to $85 plus an unscheduled flush. This is the pattern AutoShield is built to catch.",
    usedVisionModel: false,
  };
}
