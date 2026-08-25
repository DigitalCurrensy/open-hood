import type { JobNavItem } from "@/lib/jobs/types";

export const JOB_INDEX: JobNavItem = {
  href: "/jobs",
  stamp: "Who",
  label: "Role switchboard",
  blurb: "Who are you in the bay? Pick a desk. Every tool is meant to finish in under 30 seconds.",
  kind: "index",
  pipeline: null,
};

export const JOB_ROLES: JobNavItem[] = [
  {
    href: "/jobs/owner",
    stamp: "Owner",
    label: "Daily driver",
    blurb: "Confidence checklist before you walk into a shop.",
    kind: "role",
    pipeline: 1,
  },
  {
    href: "/jobs/diy",
    stamp: "DIY",
    label: "Weekend mechanic",
    blurb: "Job card: tools, torque mindset, safety.",
    kind: "role",
    pipeline: 2,
  },
  {
    href: "/jobs/advisor",
    stamp: "Writer",
    label: "Service advisor",
    blurb: "RO decoder — LOF, alignment, trans service, ticket slang.",
    kind: "role",
    pipeline: 3,
  },
  {
    href: "/jobs/tech",
    stamp: "Tech",
    label: "Technician / ASE",
    blurb: "What the customer will ask. Write millimeters, not adjectives.",
    kind: "role",
    pipeline: 4,
  },
  {
    href: "/jobs/parts",
    stamp: "Parts",
    label: "Parts counter",
    blurb: "OEM vs aftermarket vs CAPA — the SKU conversation.",
    kind: "role",
    pipeline: 5,
  },
  {
    href: "/jobs/sales",
    stamp: "Sales",
    label: "Dealer sales",
    blurb: "What not to bury in F&I. PPI reminder.",
    kind: "role",
    pipeline: 6,
  },
  {
    href: "/jobs/shop",
    stamp: "Shop",
    label: "Independent shop",
    blurb: "Fair quoting norms. Diagnosis is not the repair.",
    kind: "role",
    pipeline: 7,
  },
  {
    href: "/jobs/claims",
    stamp: "Claims",
    label: "Adjuster / body",
    blurb: "Photo list for a claim that will actually pay.",
    kind: "role",
    pipeline: 8,
  },
  {
    href: "/jobs/inspector",
    stamp: "Inspect",
    label: "PPI / inspector",
    blurb: "Walk-around shot list. Not legal advice.",
    kind: "role",
    pipeline: 9,
  },
  {
    href: "/jobs/auction",
    stamp: "Lane",
    label: "Auction / wholesale",
    blurb: "Public vs dealer lanes. Fee gotchas. Landed cost.",
    kind: "role",
    pipeline: 10,
  },
  {
    href: "/jobs/fleet",
    stamp: "Fleet",
    label: "Fleet / shop manager",
    blurb: "Interval vs upsell. Approve the page, not the pitch.",
    kind: "role",
    pipeline: 11,
  },
  {
    href: "/jobs/ev",
    stamp: "EV",
    label: "EV owner",
    blurb: "12V, tires, brakes. There is no oil change.",
    kind: "role",
    pipeline: 12,
  },
];

export const JOB_TOOLS: JobNavItem[] = [
  {
    href: "/jobs/obd",
    stamp: "Codes",
    label: "OBD translator",
    blurb: "Type a P/B/C/U code. Layperson English. Do not throw parts.",
    kind: "tool",
    pipeline: null,
  },
  {
    href: "/jobs/ppi",
    stamp: "PPI",
    label: "PPI photo list",
    blurb: "Guided shots before you buy. Not a legal opinion.",
    kind: "tool",
    pipeline: null,
  },
  {
    href: "/jobs/ro-terms",
    stamp: "Terms",
    label: "RO glossary",
    blurb: "Invoice slang: LOF, MPI, R&R, NTF, shop supplies.",
    kind: "tool",
    pipeline: null,
  },
];

export const JOB_NAV: JobNavItem[] = [JOB_INDEX, ...JOB_ROLES, ...JOB_TOOLS];

export const JOB_ROUTES = [
  "/jobs",
  ...JOB_ROLES.map((role) => role.href),
  ...JOB_TOOLS.map((tool) => tool.href),
  "/jobs/codes",
] as const;
