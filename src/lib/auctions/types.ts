export type AuctionAccess = "public_consumer" | "public_browse_dealer_bid" | "dealer_only";
export type AuctionLane = "salvage" | "wholesale" | "government" | "enthusiast" | "collector";

export interface AuctionHouse {
  id: string;
  name: string;
  lane: AuctionLane;
  access: AuctionAccess;
  whoCanAccess: string;
  publicData: string;
  homeUrl: string;
  searchUrl: string;
  notes: string;
}

export interface AuctionSearchLink {
  house: AuctionHouse;
  href: string;
  query: string;
}
