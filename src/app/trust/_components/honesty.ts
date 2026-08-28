import { countTicketsOnThisBay } from "@/app/api/contact/ticket-count";
import { SOURCE_LANE_IDS, SOURCE_LEGEND } from "@/components/report/methodology";
import { readConsentedPublicQuotes } from "@/lib/contact/quotes";
import { CONTACT_STORE_RELATIVE } from "@/lib/contact/types";

/** Honest counts. We do not mint users, reviews, or a counsel stamp. */
export const TRUST_HONESTY = {
  users: 0,
  reviews: 0,
  mintTestimonials: false,
  counselStamp: false,
  counselStatus: "awaiting-outside-review",
  notLegalAdvice: true,
  notLicensedInspector: true,
  notAShop: true,
  liveOrigin: "http://localhost:3000",
  leftoverOrigin: "http://localhost:3100",
  unlockHref: "/?unlock=1",
  termsHref: "/terms",
  privacyHref: "/privacy",
  ticketsStore: CONTACT_STORE_RELATIVE,
} as const;

/** Names only after written consent to be named. Empty until that exists. */
export const FOUNDER_NAMED: readonly { name: string; role: "shop" | "owner" }[] = [];

export const TRUST_METHOD_LINES = [
  {
    stamp: "Quote line",
    body: "A flagged line is judged against a typical independent band for the ZIP you typed, plus a local regex price book. That is not Motor, Mitchell, or ALLDATA hours.",
  },
  {
    stamp: "Recalls",
    body: "SaferCar campaigns are year / make / model — the nameplate. They are not a VIN open/closed file. SaferCar’s VIN check is a link-out, not our API.",
  },
  {
    stamp: "Specs",
    body: "Catalog row first. Heuristic last. Heuristic specs can be wrong. The door jamb and the cap still win.",
  },
  {
    stamp: "Rooftops",
    body: "OpenStreetMap Nominatim plus Overpass. Not a certified network. We do not book, rate, or take a cut.",
  },
] as const;

/** Catalog / heuristic / NHTSA / regex — the four lanes an owner can read without a packet. */
const LANE_IDS = new Set<string>(SOURCE_LANE_IDS);

export const TRUST_LANE_CHIPS = SOURCE_LEGEND.filter((chip) => LANE_IDS.has(chip.id));

export async function trustHonestyPayload() {
  const ticketsOnThisBay = await countTicketsOnThisBay();
  const consentedQuotes = await readConsentedPublicQuotes();
  return {
    users: TRUST_HONESTY.users,
    reviews: TRUST_HONESTY.reviews,
    mintTestimonials: TRUST_HONESTY.mintTestimonials,
    counselStamp: TRUST_HONESTY.counselStamp,
    counselStatus: TRUST_HONESTY.counselStatus,
    counselNotice:
      "Hire outside review. A checkbox is not a lawyer. Counsel has not signed plate-to-VIN, DPPA, live charges, or a courtroom venue. No hologram.",
    termsHref: TRUST_HONESTY.termsHref,
    privacyHref: TRUST_HONESTY.privacyHref,
    notLegalAdvice: TRUST_HONESTY.notLegalAdvice,
    notLicensedInspector: TRUST_HONESTY.notLicensedInspector,
    notAShop: TRUST_HONESTY.notAShop,
    disclaimer: "Not legal advice, not a licensed inspector, not a shop.",
    liveOrigin: TRUST_HONESTY.liveOrigin,
    leftoverOrigin: TRUST_HONESTY.leftoverOrigin,
    unlockHref: TRUST_HONESTY.unlockHref,
    swUnlockAvailable: true,
    ticketsOnThisBay,
    ticketsStore: TRUST_HONESTY.ticketsStore,
    ticketsNotice:
      "Non-empty lines in the gitignored jsonl on this machine. Emailed tickets without name-consent are not in this file. A consented name-quote may be. Zero is a real number.",
    quotesFlaggedThisSession: null,
    quotesFlaggedSource: "localStorage openhood.quote",
    founderNamed: FOUNDER_NAMED,
    consentedQuotes,
    founderProgram: "First shops / first owners — reply on /contact with consent to be named.",
    quoteJudgment: "typical-independent-band",
    recalls: "nameplate-not-vin-closeout",
    sources: TRUST_LANE_CHIPS,
  };
}
