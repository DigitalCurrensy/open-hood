import type { BookSearchLink } from "@/lib/value/types";

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function bookSearchLinks(year: string, make: string, model: string): BookSearchLink[] {
  const y = year.trim();
  const mk = slug(make);
  const md = slug(model);
  const ymm = Boolean(y && mk && md);
  const kbbYmm = ymm ? `https://www.kbb.com/${mk}/${md}/${y}/` : "https://www.kbb.com/whats-my-car-worth/";
  const edmundsYmm = ymm ? `https://www.edmunds.com/${mk}/${md}/${y}/` : "https://www.edmunds.com/appraisal/";
  const nadaYmm = ymm
    ? `https://www.nadaguides.com/Cars/${encodeURIComponent(y)}/${encodeURIComponent(make.trim())}/${encodeURIComponent(model.trim())}`
    : "https://www.nadaguides.com/Cars";

  return [
    {
      id: "kbb",
      stamp: "KBB",
      name: "Kelley Blue Book",
      href: kbbYmm,
      blurb: "Consumer what’s-my-car-worth desk. Their book. Not a feed we pulled.",
    },
    {
      id: "edmunds",
      stamp: "EDM",
      name: "Edmunds",
      href: edmundsYmm,
      blurb: "Edmunds appraisal / TMV search for this nameplate.",
    },
    {
      id: "nada",
      stamp: "NADA",
      name: "NADA / J.D. Power",
      href: nadaYmm,
      blurb: "NADA Guides consumer cars. J.D. Power owns the book now.",
    },
    {
      id: "kbb-worth",
      stamp: "Worth",
      name: "KBB what’s-my-car-worth",
      href: "https://www.kbb.com/whats-my-car-worth/",
      blurb: "Start at their VIN / plate form if the year-make-model path misses a trim.",
    },
    {
      id: "edmunds-appraise",
      stamp: "Appraise",
      name: "Edmunds appraisal",
      href: "https://www.edmunds.com/appraisal/",
      blurb: "Their appraisal start page — options and condition are on their form.",
    },
    {
      id: "jdpower",
      stamp: "JDP",
      name: "J.D. Power cars",
      href: "https://www.jdpower.com/cars",
      blurb: "J.D. Power used-car values sit next to NADA Guides.",
    },
  ];
}

export function kbbKeyConfigured(): boolean {
  return Boolean(process.env.KBB_API_KEY?.trim() || process.env.COX_KBB_API_KEY?.trim());
}

export function valueFeedLabel(kbbConfigured: boolean): string {
  return kbbConfigured
    ? "A KBB key is on this bay. We still do not paint a Cox number we did not fetch. Open their search for their book."
    : "Illustration, not a Cox/KBB feed.";
}
