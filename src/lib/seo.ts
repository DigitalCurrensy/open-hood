import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

export const SITE_UPDATED = new Date("2026-08-27T00:00:00.000Z");

export const DEMO_VIN = "1HGCM82633A004352";
export const DEMO_VIN_LABEL = "2003 Honda Accord";
export const DEMO_OIL = "5W-20";
export const DEMO_ZIP = "90210";

export const SEO_KEYWORDS = [
  "Open Hood",
  "know the car then the window",
  "repair estimate advocate",
  "VIN decode",
  "mechanic quote",
  "cabin filter markup",
  "repair order markup",
  "counter script",
  "NHTSA VIN",
  "factory fluids",
] as const;

export const CRAWLER_ALLOWLIST = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-SearchBot",
  "PerplexityBot",
  "Applebot",
  "DuckDuckBot",
  "Bytespider",
] as const;

/** Read-only public APIs. Write and paid-compute routes stay under Disallow: /api/. */
export const ROBOTS_API_ALLOW = [
  "/api/openapi",
  "/api/fluids",
  "/api/integrations/status",
  "/api/integrations/nhtsa",
  "/api/finder/jobs",
  "/api/finder/status",
  "/api/expert/playbooks",
  "/api/guides",
  "/api/jobs/roles",
  "/api/jobs/terms",
  "/api/directory/catalog",
] as const;

export const ROBOTS_DISALLOW = ["/offline", "/api/"] as const;

export type FaqItem = {
  q: string;
  a: string;
};

export const HOW_IT_WORKS_FAQ: FaqItem[] = [
  {
    q: "What is Open Hood?",
    a: "Open Hood is the owner's car book and a free shop-ticket advocate. You identify a car by VIN or year/make/model, get a factory-typical spec card, mark up a repair order, and leave with sentences you can say at the counter. Know the car. Then the window. We do not book shops or take a cut of the repair. We are not a Saturday meetup.",
  },
  {
    q: "What is Open Hood not?",
    a: "Open Hood is not RepairPal, Openbay, or a dealer booking app. It is not Carfax or accident history. It is not a scan tool or Bluetooth dongle. It is not a warranty, not a Saturday meetup, and not a parts marketplace. It does not sell licensed Motor, TecDoc, or Mitchell labor times. Those products exist. This bay is the person standing next to you at the window.",
  },
  {
    q: "How do I try the Honda demo VIN?",
    a: `Use VIN ${DEMO_VIN} (${DEMO_VIN_LABEL}). The fluids card prints ${DEMO_OIL} for that car. Displacement from NHTSA is rounded the way a ticket should read — 3.0L, not 3.00. Open the bay, paste the VIN, then walk Garage → Quote → script.`,
  },
  {
    q: "What does a ZIP 90210 estimate mean?",
    a: `The estimate desk takes a job and a ZIP — ${DEMO_ZIP} is the Beverly Hills demo — and shows a parts-plus-independent-labor range from regional door-rate bands. It is not a licensed Motor or AllData hour. Dealer is the same job at that region’s higher rate. We stamp the disclaimer on the ticket.`,
  },
  {
    q: "What should I do with a P0420 code?",
    a: "P0420 means catalyst efficiency below threshold. It is a pointer, not a parts list. Graph both oxygen sensors and check for exhaust leaks before anyone prices a converter. Open Hood’s Fix Finder holds the cat on diagnose-first. Do not throw the converter from the code alone.",
  },
  {
    q: "Do you book shops or take a cut?",
    a: "No. The directory lists OpenStreetMap rooftops near a ZIP. We do not certify shops, take a booking fee, or route you into a network. You call. You decide. Maps links are search URLs, not appointments we sold.",
  },
  {
    q: "Is Motor, TecDoc, or Carfax included?",
    a: "No. Those are licensed products we do not pretend to own. History is NHTSA decode, recalls, complaints, and NCAP — plus official paid link-outs for title brands. Parts are search URLs, not shelf count. Labor hours are regional averages, not a stolen guide.",
  },
  {
    q: "Is Open Hood free? Is there an account?",
    a: "The bay is free. There is no account, password, or profile. VIN decode, the spec card, quote markup, OBD translation, guides, and the counter script work without a key. Optional photo reading and mail need operator keys; if a key is missing, the desk says so.",
  },
  {
    q: "What is Beginner vs Expert?",
    a: "Beginner is short steps and the sentence you say out loud. Expert is the spec, the code, and the millimeter. Same desks. Two altitudes. We do not ship a third “AI” or “shop-talk” voice. Pick one and stay there while you read the ticket.",
  },
  {
    q: "What data sources does Open Hood use?",
    a: "NHTSA vPIC for VIN decode, NHTSA SaferCar for recalls and complaints, EPA FuelEconomy.gov for MPG, and OpenStreetMap Nominatim plus Overpass for rooftops. YouTube links on guides are verified IDs or honest search URLs. Licensed catalogs stay dark until a real key exists.",
  },
];

export function llmCitationParagraph(base = siteUrl()): string {
  return `Open Hood is a free owner's book and shop-ticket advocate: decode a VIN (or year/make/model), print a factory-typical spec card, mark up a repair order, and walk out with sentences you can say at the counter. Know the car. Then the window. It is not RepairPal, Carfax, a scan tool, a warranty, or a Saturday meetup — it does not book shops, invent accident history, or sell licensed Motor/TecDoc hours. Official site: ${base}. Try the ${DEMO_VIN_LABEL} demo VIN ${DEMO_VIN} (${DEMO_OIL}). P0420 is a catalyst-efficiency pointer, not an automatic converter replacement.`;
}

export type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  follow?: boolean;
  absolute?: boolean;
};

/** Night-bay NCR ticket — used by Open Graph, Twitter, iMessage, and the home lockup. */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: BRAND.ogAlt,
  type: "image/png",
} as const;

export function pageMeta({
  title,
  description,
  path,
  index = true,
  follow = true,
  absolute = false,
}: PageMetaInput): Metadata {
  const canonical = path === "/" ? "/" : path;
  const robots = {
    index,
    follow,
    googleBot: {
      index,
      follow,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };

  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "en_US",
      siteName: BRAND.short,
      images: [{ ...OG_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ ...OG_IMAGE }],
    },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbList(crumbs: Crumb[]) {
  const items = [{ name: BRAND.short, path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqPageJsonLd(items: FaqItem[], pagePath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: absoluteUrl(pagePath),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  path: string;
  steps: string[];
  tools?: string[];
  supplies?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    tool: (input.tools ?? []).filter(Boolean).map((name) => ({ "@type": "HowToTool", name })),
    supply: (input.supplies ?? []).filter(Boolean).map((name) => ({ "@type": "HowToSupply", name })),
    step: input.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };
}

export function siteGraphJsonLd() {
  const base = siteUrl();
  const orgId = `${base}/#organization`;
  const siteId = `${base}/#website`;
  const appId = `${base}/#app`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: BRAND.short,
        legalName: BRAND.name,
        url: base,
        description: BRAND.description,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icons/icon-512.png"),
        },
        image: absoluteUrl(OG_IMAGE.url),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: absoluteUrl("/contact"),
          availableLanguage: "en",
        },
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: base,
        name: BRAND.short,
        description: BRAND.description,
        inLanguage: "en-US",
        publisher: { "@id": orgId },
      },
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": appId,
        name: BRAND.short,
        applicationCategory: "BrowserApplication",
        operatingSystem: "Web",
        url: base,
        description: BRAND.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: { "@id": orgId },
        isAccessibleForFree: true,
      },
    ],
  };
}

export function speakableWebPageJsonLd(path: string, cssSelectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: absoluteUrl(path),
    name: BRAND.short,
    isPartOf: { "@id": `${siteUrl()}/#website` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
    dateModified: SITE_UPDATED.toISOString(),
  };
}
