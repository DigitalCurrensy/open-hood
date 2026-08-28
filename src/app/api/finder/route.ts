import { NextResponse } from "next/server";
import { FINDER_ROUTES } from "@/config/nav/finder";
import { catalogStatus, decorateJob, parseFinderFilters, searchJobs } from "@/lib/finder";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = parseFinderFilters(Object.fromEntries(searchParams.entries()));
  const hits = searchJobs(filters);
  return NextResponse.json({
    count: hits.length,
    query: {
      code: filters.code ?? "",
      q: filters.q ?? "",
      symptom: filters.symptom ?? "",
      job: filters.job ?? "",
    },
    ymm: filters.ymm,
    catalog: catalogStatus(),
    routes: FINDER_ROUTES,
    jobs: hits.map((hit) => ({
      score: hit.score,
      reason: hit.reason,
      ...decorateJob(hit.job, filters.ymm),
    })),
  });
}
