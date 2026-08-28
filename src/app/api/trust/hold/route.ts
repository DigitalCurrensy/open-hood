import { handleHoldSubmit, handleTrustStatus } from "@/lib/trust";

export const dynamic = "force-dynamic";

export function GET() {
  return handleTrustStatus();
}

export function POST(request: Request) {
  return handleHoldSubmit(request);
}
