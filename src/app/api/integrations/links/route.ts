import { NextResponse } from "next/server";
import { ALL_BAY_PIPES } from "@/app/integrations/extra-pipes";
import { actionFor } from "@/lib/integrations/catalog";
import type { IntegrationContext } from "@/lib/integrations/types";
import { configuredForActions } from "@/app/api/integrations/_lib/keys";

function first(params: URLSearchParams, key: string): string {
  return (params.get(key) ?? "").trim();
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const ctx: IntegrationContext = {
    year: first(params, "year"),
    make: first(params, "make"),
    model: first(params, "model"),
    vin: first(params, "vin"),
    address: first(params, "address") || first(params, "q"),
    part: first(params, "part"),
    howTo: first(params, "howTo") || first(params, "job"),
  };
  const configured = configuredForActions();
  return NextResponse.json({
    context: ctx,
    count: ALL_BAY_PIPES.length,
    links: ALL_BAY_PIPES.map((item) => ({
      id: item.id,
      name: item.name,
      lane: item.lane,
      family: item.family,
      homeUrl: item.homeUrl,
      ...actionFor(item, ctx, configured),
    })),
  });
}
