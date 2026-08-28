import { NextResponse } from "next/server";
import { decorateJob, getJob, parseFinderFilters } from "@/lib/finder";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) {
    return NextResponse.json({ error: "No job on that hook." }, { status: 404 });
  }
  const { searchParams } = new URL(request.url);
  const filters = parseFinderFilters(Object.fromEntries(searchParams.entries()));
  return NextResponse.json(decorateJob(job, filters.ymm));
}
