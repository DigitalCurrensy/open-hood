import { NextResponse } from "next/server";
import { ALL_BAY_PIPES } from "@/app/integrations/extra-pipes";
import { actionFor } from "@/lib/integrations/catalog";
import { EMPTY_CONTEXT } from "@/lib/integrations/types";
import { buildBayStatus, configuredForActions } from "@/app/api/integrations/_lib/matrix";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const probe = new URL(request.url).searchParams.get("probe") !== "0";
  const status = await buildBayStatus({ probe });
  const configured = configuredForActions();
  return NextResponse.json({
    ...status,
    cards: ALL_BAY_PIPES.map((item) => ({
      id: item.id,
      name: item.name,
      lane: item.lane,
      env: item.env ?? null,
      action: actionFor(item, EMPTY_CONTEXT, configured),
    })),
  });
}
