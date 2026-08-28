import { NextResponse } from "next/server";
import { EXPERT_PLAYBOOK_COUNT, getExpertPlaybook } from "@/app/expert/_data/book";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = getExpertPlaybook(slug);
  if (!playbook) {
    return NextResponse.json({ error: "Playbook not in the book.", count: EXPERT_PLAYBOOK_COUNT }, { status: 404 });
  }
  return NextResponse.json({ count: EXPERT_PLAYBOOK_COUNT, playbook });
}
