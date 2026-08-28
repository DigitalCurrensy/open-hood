import { NextResponse } from "next/server";
import { FINDER_ROUTES } from "@/config/nav/finder";
import { FINDER_JOB_COUNT, allJobs, getJob, parseFinderFilters } from "@/lib/finder";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? searchParams.get("id") ?? "";
  if (slug) {
    const job = getJob(slug);
    if (!job) {
      return NextResponse.json({ error: "No job on that hook.", count: FINDER_JOB_COUNT }, { status: 404 });
    }
    return NextResponse.json({ count: FINDER_JOB_COUNT, job });
  }
  const filters = parseFinderFilters(Object.fromEntries(searchParams.entries()));
  return NextResponse.json({
    count: FINDER_JOB_COUNT,
    routes: FINDER_ROUTES,
    ymm: filters.ymm,
    jobs: allJobs().map((job) => ({
      slug: job.slug,
      stamp: job.stamp,
      title: job.title,
      kicker: job.kicker,
      lane: job.lane,
      split: job.split,
      codes: job.codes,
    })),
  });
}
