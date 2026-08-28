import type { TrustCarrier } from "@/lib/trust/types";

/** Official consumer FNOL desks — link-out only. We do not file the claim. */
export const FNOL_CARRIERS: TrustCarrier[] = [
  {
    id: "state-farm",
    stamp: "SF",
    name: "State Farm",
    href: "https://www.statefarm.com/claims",
    phone: "800-732-5246",
    blurb: "File or manage a claim on their desk. Select Service shops are their network, not ours.",
  },
  {
    id: "geico",
    stamp: "GEICO",
    name: "GEICO",
    href: "https://www.geico.com/claims/",
    phone: "800-841-3000",
    blurb: "Report an auto claim online or in their app. We do not upload your folder to GEICO.",
  },
  {
    id: "progressive",
    stamp: "PROG",
    name: "Progressive",
    href: "https://www.progressive.com/claims/",
    phone: "800-776-4737",
    blurb: "Start an auto claim on Progressive’s site. Photos stay on this phone until you send them.",
  },
];

export const AAA_APPROVED_SHOP = {
  id: "aaa-approved",
  stamp: "AAA",
  name: "AAA Approved Auto Repair",
  href: "https://www.aaa.com/autorepair",
  blurb: "AAA’s approved-shop locator. Membership and approval are theirs. We do not book a bay or take a cut.",
} as const;

export const EXTERNAL_REL = "noopener noreferrer";
