import { handleReportPrint } from "@/lib/report";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleReportPrint(request);
}

export function POST(request: Request) {
  return handleReportPrint(request);
}
