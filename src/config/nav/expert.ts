import type { ExpertNavItem } from "@/lib/expert/types";
import type { NavItem } from "@/lib/nav";

/** Stamp for the bay board. Integrator merges this into NAV_ITEMS. */
export const EXPERT_NAV_ITEM: NavItem = {
  href: "/expert",
  stamp: "Expert",
  label: "Scenario playbooks",
  blurb: "Beginner script + genius measurements for the situations owners actually hit.",
  needsVehicle: false,
};

export const EXPERT_INDEX: ExpertNavItem = {
  href: "/expert",
  stamp: "Book",
  label: "Scenario playbooks",
  blurb: "Twelve owner situations. Beginner steps on the left. Millimeters and PSI on the right.",
  kind: "index",
};

export const EXPERT_TOOLS: ExpertNavItem[] = [
  {
    href: "/expert/tsb",
    stamp: "Patterns",
    label: "Failure patterns",
    blurb: "Common failures by symptom. NHTSA / SaferCar pointers — not pirated TSB PDFs.",
    kind: "tool",
  },
  {
    href: "/expert/cheatsheet",
    stamp: "Card",
    label: "Counter card",
    blurb: "Printable millimeters, 32nds, PSI, and freeze-frame questions.",
    kind: "tool",
  },
];

export const EXPERT_PLAYBOOK_NAV: ExpertNavItem[] = [
  {
    href: "/expert/pre-shop",
    stamp: "Pre-shop",
    label: "Pre-shop visit",
    blurb: "Beginner script + genius measurements before you walk in.",
    kind: "playbook",
  },
  {
    href: "/expert/used-ppi",
    stamp: "PPI",
    label: "Used-car 30-minute PPI",
    blurb: "A walk-around you can finish before the seller gets impatient.",
    kind: "playbook",
  },
  {
    href: "/expert/check-engine",
    stamp: "CEL",
    label: "Check-engine night",
    blurb: "Read the code. Do not throw parts.",
    kind: "playbook",
  },
  {
    href: "/expert/brake-noise",
    stamp: "Brakes",
    label: "Brake squeal vs grind",
    blurb: "Indicator squeal is not metal-on-metal. Ask for millimeters.",
    kind: "playbook",
  },
  {
    href: "/expert/shop-choice",
    stamp: "Who",
    label: "Dealer vs indie vs chain",
    blurb: "Who to call for what. We do not book anyone.",
    kind: "playbook",
  },
  {
    href: "/expert/ev-owner",
    stamp: "EV",
    label: "EV 12V / tires / brakes",
    blurb: "There is no oil change. The 12V still bricks the car.",
    kind: "playbook",
  },
  {
    href: "/expert/auction-fees",
    stamp: "Lane",
    label: "Auction lane fees",
    blurb: "Hammer is not landed cost.",
    kind: "playbook",
  },
  {
    href: "/expert/after-quote",
    stamp: "Quote",
    label: "After a quote",
    blurb: "Cabin filter, flush, and “while you’re in there.”",
    kind: "playbook",
  },
  {
    href: "/expert/seasonal",
    stamp: "Season",
    label: "Winter / summer",
    blurb: "PSI, coolant, wipers, and the battery that dies on the first freeze.",
    kind: "playbook",
  },
  {
    href: "/expert/road-trip",
    stamp: "Trip",
    label: "Road-trip go/no-go",
    blurb: "A yes/no card the night before you leave.",
    kind: "playbook",
  },
  {
    href: "/expert/lemon-buyback",
    stamp: "Lemon",
    label: "Lemon-ish / buyback",
    blurb: "Questions to ask. Not legal advice.",
    kind: "playbook",
  },
  {
    href: "/expert/claim-photos",
    stamp: "Claim",
    label: "Insurance claim photos",
    blurb: "After a hit: the folder that actually supports a claim.",
    kind: "playbook",
  },
];

export const EXPERT_NAV: ExpertNavItem[] = [EXPERT_INDEX, ...EXPERT_TOOLS, ...EXPERT_PLAYBOOK_NAV];

export const EXPERT_ROUTES = [
  "/expert",
  ...EXPERT_TOOLS.map((tool) => tool.href),
  ...EXPERT_PLAYBOOK_NAV.map((item) => item.href),
  "/playbooks",
] as const;

export const SAFERCAR_RECALLS = "https://www.nhtsa.gov/recalls" as const;
export const SAFERCAR_TAKATA = "https://www.nhtsa.gov/campaign/takata-air-bags" as const;
