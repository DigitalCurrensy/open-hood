import { trustHonestyPayload } from "@/app/trust/_components/honesty";
import { handleTrustStatus } from "@/lib/trust";

export const dynamic = "force-dynamic";

export async function GET() {
  const hold = handleTrustStatus();
  const body = (await hold.json()) as Record<string, unknown>;
  return Response.json(
    { ...body, honesty: await trustHonestyPayload() },
    { status: hold.status, headers: { "Cache-Control": "no-store" } },
  );
}
