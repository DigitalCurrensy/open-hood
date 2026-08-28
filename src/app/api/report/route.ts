import { handleReportBuild } from "@/lib/report";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleReportBuild(request);
}
