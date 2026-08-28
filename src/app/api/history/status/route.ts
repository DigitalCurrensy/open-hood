import { plateStatus } from "@/lib/history";
import { PLATE_FORMAT_HONESTY } from "@/lib/plate-format";

export const dynamic = "force-dynamic";

export function GET() {
  const status = plateStatus();
  return Response.json(
    {
      ok: true,
      connected: status.live,
      inventedVin: false,
      vin: "",
      formatCheck: "key-free",
      formatNote: PLATE_FORMAT_HONESTY,
      ...status,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
