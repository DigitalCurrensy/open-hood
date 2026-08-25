import { NextResponse } from "next/server";
import { RO_TERMS, searchRoTerms } from "@/lib/jobs/glossary";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const terms = searchRoTerms(q);
  return NextResponse.json({ q, total: RO_TERMS.length, terms });
}
