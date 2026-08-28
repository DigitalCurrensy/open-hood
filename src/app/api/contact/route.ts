import { countTicketsOnThisBay } from "@/app/api/contact/ticket-count";
import { handleContactStatus, handleContactSubmit } from "@/lib/contact";
import { CONTACT_STORE_RELATIVE } from "@/lib/contact/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = handleContactStatus();
  const body = (await status.json()) as Record<string, unknown>;
  return Response.json(
    {
      ...body,
      ticketsOnThisBay: await countTicketsOnThisBay(),
      store: CONTACT_STORE_RELATIVE,
      namedQuotes: "GET /api/trust — consented jsonl only",
    },
    { status: status.status, headers: { "Cache-Control": "no-store" } },
  );
}

export function POST(request: Request) {
  return handleContactSubmit(request);
}
