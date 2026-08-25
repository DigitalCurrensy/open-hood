import { NextResponse } from "next/server";
import { listPartTypes, partSearchLinks } from "@/lib/directory/parts";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const year = params.get("year") ?? "";
  const make = params.get("make") ?? "";
  const model = params.get("model") ?? "";
  const part = params.get("part") ?? params.get("type") ?? "oil filter";
  return NextResponse.json({
    types: listPartTypes(),
    links: partSearchLinks(year, make, model, part),
  });
}
