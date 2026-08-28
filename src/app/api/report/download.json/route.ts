import { handleReportDownload } from "@/lib/report";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleReportDownload(request);
}

export function POST(request: Request) {
  return handleReportDownload(request);
}
