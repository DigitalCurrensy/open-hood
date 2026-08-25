import apis from "@/data/apis.json";
import { NextResponse } from "next/server";
import { paidHook } from "@/lib/directory/http";

export async function GET() {
  const catalog = apis.map((api) => ({
    ...api,
    configured: api.env ? Boolean(process.env[api.env]?.trim()) : true,
    hook: api.env ? paidHook(api.id, api.name, api.env, api.wired as boolean | "stub") : null,
  }));
  return NextResponse.json({ apis: catalog });
}
