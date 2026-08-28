import { NextResponse } from "next/server";
import {
  COMPLAINT_MAP_DISCLAIMER,
  EXPERT_TSB_COUNT,
  allExpertTsb,
  complaintMapPayload,
  filterExpertTsb,
} from "@/app/expert/_data/book";
import { SAFERCAR_RECALLS, SAFERCAR_TAKATA, parseTsbFilters } from "@/lib/expert/tsb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const component = (searchParams.get("component") ?? "").trim();
  const make = (searchParams.get("make") ?? "").trim();
  if (component) {
    const mapped = complaintMapPayload(component, make || undefined);
    return NextResponse.json({
      component,
      make: make || undefined,
      count: mapped.patterns.length,
      total: allExpertTsb().length,
      book: EXPERT_TSB_COUNT,
      disclaimer: COMPLAINT_MAP_DISCLAIMER,
      map: mapped,
      patterns: mapped.patterns,
    });
  }
  const filters = parseTsbFilters(Object.fromEntries(searchParams.entries()));
  const patterns = filterExpertTsb(filters);
  return NextResponse.json({
    count: patterns.length,
    total: allExpertTsb().length,
    book: EXPERT_TSB_COUNT,
    saferCar: SAFERCAR_RECALLS,
    takata: SAFERCAR_TAKATA,
    filters,
    patterns,
  });
}
