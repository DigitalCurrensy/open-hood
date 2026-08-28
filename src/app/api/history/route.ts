import { handleHistoryCatalog, handleHistoryLookup } from "@/lib/history";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const vin = new URL(request.url).searchParams.get("vin");
  if (!vin?.trim()) return handleHistoryCatalog();
  return handleHistoryLookup(request);
}

export function POST(request: Request) {
  return handleHistoryLookup(request);
}
