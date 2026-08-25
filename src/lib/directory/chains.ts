import chainsCatalog from "@/data/chains.json";

export const DISCLAIMER =
  "This is not every rooftop in America. OSM + chains. Add Google Places key for denser results.";

export function chainLocators(query: string) {
  const q = encodeURIComponent(query.trim() || "near me");
  const fill = (url: string) => url.replace("{query}", q);
  return {
    retail: chainsCatalog.retail.map((chain) => ({ ...chain, href: fill(chain.locatorUrl) })),
    dealerGroups: chainsCatalog.dealerGroups.map((group) => ({ ...group, href: fill(group.locatorUrl) })),
  };
}
