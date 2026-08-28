import { handleServiceLogCatalog, handleServiceLogExport } from "@/lib/service-log";

export const dynamic = "force-dynamic";

export function GET() {
  return handleServiceLogCatalog();
}

export function POST(request: Request) {
  return handleServiceLogExport(request);
}
