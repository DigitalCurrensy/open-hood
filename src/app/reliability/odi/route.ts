import { NextResponse } from "next/server";
import { COMPLAINT_MAP_DISCLAIMER, complaintCardFor, linksForComplaint } from "@/app/expert/_data/book";
import type { ComplaintComponent } from "@/app/reliability/votes";

interface ComplaintRow {
  crash?: boolean;
  fire?: boolean;
  injured?: number;
  deaths?: number;
  numberOfInjuries?: number;
  numberOfDeaths?: number;
  components?: string;
  component?: string;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const year = (params.get("year") ?? "").trim();
  const make = (params.get("make") ?? "").trim();
  const model = (params.get("model") ?? "").trim();
  if (!year || !make || !model) {
    return NextResponse.json({ error: "Need year, make, and model." }, { status: 400 });
  }

  const query = new URLSearchParams({ make, model, modelYear: year });
  try {
    const response = await fetch(`https://api.nhtsa.gov/complaints/complaintsByVehicle?${query.toString()}`, {
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return NextResponse.json({ error: "SaferCar did not answer." }, { status: 502 });
    }

    const payload = (await response.json()) as { count?: number; results?: ComplaintRow[] };
    const rows = payload.results ?? [];
    const tallies = new Map<string, number>();
    let crash = 0;
    let fire = 0;
    let injured = 0;
    let deaths = 0;

    for (const row of rows) {
      if (row.crash) crash += 1;
      if (row.fire) fire += 1;
      injured += Number(row.injured ?? row.numberOfInjuries ?? 0) || 0;
      deaths += Number(row.deaths ?? row.numberOfDeaths ?? 0) || 0;
      const label = (row.components || row.component || "").trim();
      if (label) tallies.set(label, (tallies.get(label) ?? 0) + 1);
    }

    const components: ComplaintComponent[] = [...tallies.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([name, count]) => {
        const card = complaintCardFor(name);
        return {
          name,
          count,
          bucket: card.bucket,
          why: card.why,
          links: linksForComplaint(name, make),
        };
      });

    return NextResponse.json({
      year,
      make,
      model,
      count: payload.count ?? rows.length,
      crash,
      fire,
      injured,
      deaths,
      topComponents: components.map((row) => row.name),
      components,
      source: "NHTSA ODI complaintsByVehicle",
      disclaimer:
        "Complaint counts, not Consumer Reports. SaferCar filings on this year/make/model, counted by the component field NHTSA stored, mapped to playbooks. CR is a magazine we do not license. Not a failure rate per 100 cars. Not a Carfax.",
      mapDisclaimer: COMPLAINT_MAP_DISCLAIMER,
    });
  } catch {
    return NextResponse.json({ error: "SaferCar did not answer." }, { status: 502 });
  }
}
