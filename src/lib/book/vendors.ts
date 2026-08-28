/** Shop operating systems — B2B vendor links. We do not host a fake bay OS. */

export const BOOK_SHOP_VENDORS = [
  {
    id: "shop-ware",
    stamp: "OS",
    name: "Shop-Ware",
    href: "https://www.shop-ware.com/",
    for: "Independent shops",
    body: "A shop operating system: estimates, workflow, approvals, payments. For the rooftop that already turns wrenches. Open Hood is not Shop-Ware and does not pretend to be.",
  },
  {
    id: "openbay",
    stamp: "Jobs",
    name: "Openbay",
    href: "https://www.openbay.com/",
    for: "Shops that want inbound jobs",
    body: "Openbay auctions consumer jobs to shops and sells the shop-side pipe. That is a marketplace. We do not run it. Shops who want that pipe open Openbay — not this bay.",
  },
] as const;

export const BOOK_VENDOR_LINE =
  "If you are a shop, buy a real OS from a vendor. This desk is owner intake. It is not a dispatch board and it is not shop software.";
