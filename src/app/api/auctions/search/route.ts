import { NextResponse } from "next/server";
import { ACCESS_COPY, auctionSearchLinks } from "@/lib/auctions/catalog";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const links = auctionSearchLinks({
    year: params.get("year") ?? undefined,
    make: params.get("make") ?? undefined,
    model: params.get("model") ?? undefined,
    q: params.get("q") ?? undefined,
  });
  return NextResponse.json({
    query: links[0]?.query ?? "",
    access: ACCESS_COPY,
    links: links.map((link) => ({
      id: link.house.id,
      name: link.house.name,
      lane: link.house.lane,
      access: link.house.access,
      whoCanAccess: link.house.whoCanAccess,
      publicData: link.house.publicData,
      notes: link.house.notes,
      href: link.href,
    })),
  });
}
