import { handleBookStatus, handleBookSubmit } from "@/lib/book/http";

export const dynamic = "force-dynamic";

export function GET() {
  return handleBookStatus();
}

export function POST(request: Request) {
  return handleBookSubmit(request);
}
