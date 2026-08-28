import { CHROME_DATA_REASON } from "@/lib/chrome-data";
import type { NavItem } from "@/lib/nav";

export const STICKER_ROUTE = "/sticker" as const;
export const STICKER_PHOTO_VIN_HREF = "/" as const;

/** Stamp for the bay board. Integrator merges this into NAV_ITEMS / MATRIX_NAV_ITEMS. */
export const STICKER_NAV_ITEM: NavItem = {
  href: STICKER_ROUTE,
  stamp: "Sticker",
  label: "Decoder sticker",
  blurb: "Identification packet: vPIC + nameplate recalls + SaferCar link. Not a Monroney. No MSRP.",
  needsVehicle: true,
};

export const STICKER_INDEX = {
  href: STICKER_ROUTE,
  stamp: "Glass",
  label: "Decoder sticker",
  blurb: "Factory facts from DecodeVinValues. Packages and destination charge are not in the VIN.",
} as const;

export const STICKER_NEXT_DESKS = [
  { href: "/", stamp: "Bay", label: "Stamp the VIN" },
  { href: "/sticker?vin=1HGCM82633A004352", stamp: "Packet", label: "Honda identification packet" },
  { href: "/vin?vin=1HGCM82633A004352", stamp: "VIN", label: "VIN packet desk" },
  { href: "/recalls", stamp: "Recalls", label: "Nameplate campaigns" },
  { href: "/history", stamp: "History", label: "Jacket and campaigns" },
  { href: "/garage", stamp: "Garage", label: "Fluids and PSI" },
  { href: "/report", stamp: "Findings", label: "Print the customer copy" },
] as const;

export const STICKER_DISCLAIMER = `This is a decoder printout from NHTSA vPIC. It is not a Monroney. ${CHROME_DATA_REASON}`;

/** PageBrief payload — integrator appends this to UX_BRIEFS. */
export const STICKER_BRIEF = {
  href: STICKER_ROUTE,
  eyebrow: "Decoder sticker",
  dummy: {
    job: "See every factory fact NHTSA put on this VIN. Then walk to the glass with numbers, not adjectives.",
    for: "Anyone who wants the decode, not a dealer Monroney PDF.",
    click: "Stamp a VIN on the bay, or open this desk with the session car.",
    say: "This is the decoder sheet. Show me the package list on the real window sticker.",
  },
  genius: {
    job: "Identification packet: decode + engine + campaigns grouped by NHTSA number + SaferCar VIN link + complaint count. Chrome ledger stays connected:false. Displacement still rounds to 3.0L.",
    for: "Owners who will not confuse vPIC with Chrome Data or a Monroney, or a nameplate recall with a VIN close-out.",
    click: "Session VIN first. Honda 1HGCM82633A004352 if the bay is empty. Plate is a note.",
    say: "vPIC is WMI + VDS + VIS. Open vs closed on this VIN is SaferCar. Public recallsByVin is 403.",
  },
} as const;
