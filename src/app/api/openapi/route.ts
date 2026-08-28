import { OPENAPI_SPEC, renderOpenApiYaml } from "@/app/api/openapi/spec";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = (url.searchParams.get("format") ?? "").toLowerCase();
  const accept = request.headers.get("accept") ?? "";
  const wantJson =
    format === "json" || (format !== "yaml" && accept.includes("application/json") && !accept.includes("yaml"));

  if (wantJson) {
    return NextResponse.json(OPENAPI_SPEC, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  return new NextResponse(renderOpenApiYaml(), {
    status: 200,
    headers: {
      "Content-Type": "application/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
