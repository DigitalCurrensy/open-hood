import houses from "@/data/auctions.json";
import type { AuctionAccess, AuctionHouse, AuctionSearchLink } from "@/lib/auctions/types";

export function listAuctionHouses(): AuctionHouse[] {
  return houses as AuctionHouse[];
}

export function housesByAccess(access: AuctionAccess): AuctionHouse[] {
  return listAuctionHouses().filter((house) => house.access === access);
}

export function buildAuctionQuery(input: { year?: string; make?: string; model?: string; q?: string }): string {
  const fromParts = [input.year, input.make, input.model].filter(Boolean).join(" ").trim();
  return (input.q?.trim() || fromParts).replace(/\s+/g, " ");
}

export function auctionSearchLinks(input: {
  year?: string;
  make?: string;
  model?: string;
  q?: string;
}): AuctionSearchLink[] {
  const query = buildAuctionQuery(input);
  const encoded = encodeURIComponent(query);
  return listAuctionHouses().map((house) => ({
    house,
    query,
    href: query ? house.searchUrl.replace("{query}", encoded) : house.homeUrl,
  }));
}

export const ACCESS_COPY: Record<AuctionAccess, { stamp: string; title: string; body: string }> = {
  public_consumer: {
    stamp: "Public lane",
    title: "You can bid without a dealer plate",
    body: "Bring a Trailer, Cars & Bids, Mecum, Barrett-Jackson, GovPlanet, and GSA are consumer-facing. Watch for free. Bid with an account or a paddle — not a wholesale license.",
  },
  public_browse_dealer_bid: {
    stamp: "Salvage lane",
    title: "Browse is public. The gavel usually is not",
    body: "Copart and IAA show lots to anyone. Bidding is typically a licensed dealer, dismantler, or a broker who charges you for the privilege. We link out. We do not scrape their lots.",
  },
  dealer_only: {
    stamp: "Dealer door",
    title: "Manheim and ADESA stay wholesale",
    body: "These are dealer auctions. If you do not hold a license, this desk will not pretend you can walk in and bid.",
  },
};
