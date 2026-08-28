import { NextResponse } from "next/server";
import {
  COMPLAINT_MAP_DISCLAIMER,
  EXPERT_PLAYBOOK_COUNT,
  allExpertPlaybooks,
  complaintMapPayload,
  filterExpertPlaybooks,
  getExpertPlaybook,
} from "@/app/expert/_data/book";
import { EXPERT_ROUTES } from "@/config/nav/expert";
import { parsePlaybookFilters } from "@/lib/expert/playbooks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const component = (searchParams.get("component") ?? "").trim();
  const make = (searchParams.get("make") ?? "").trim();
  if (component) {
    const mapped = complaintMapPayload(component, make || undefined);
    return NextResponse.json({
      component,
      make: make || undefined,
      count: mapped.playbooks.length,
      total: allExpertPlaybooks().length,
      disclaimer: COMPLAINT_MAP_DISCLAIMER,
      map: mapped,
    });
  }
  const id = searchParams.get("id") ?? searchParams.get("slug") ?? "";
  if (id) {
    const playbook = getExpertPlaybook(id);
    if (!playbook) {
      return NextResponse.json({ error: "Playbook not in the book.", count: EXPERT_PLAYBOOK_COUNT }, { status: 404 });
    }
    return NextResponse.json({ count: EXPERT_PLAYBOOK_COUNT, playbook });
  }
  const filters = parsePlaybookFilters(Object.fromEntries(searchParams.entries()));
  const playbooks = filterExpertPlaybooks(filters);
  return NextResponse.json({
    count: playbooks.length,
    total: allExpertPlaybooks().length,
    routes: EXPERT_ROUTES,
    filters,
    playbooks,
  });
}
