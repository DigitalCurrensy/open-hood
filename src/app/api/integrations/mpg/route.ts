import { NextResponse } from "next/server";
import { fetchEpaMpg } from "@/lib/directory/epa";
import { epaFindACarUrl } from "@/lib/integrations/urls";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const year = (params.get("year") ?? "").trim();
  const make = (params.get("make") ?? "").trim();
  const model = (params.get("model") ?? "").trim();
  if (!year || !make || !model) {
    return NextResponse.json({ error: "Need year, make, and model." }, { status: 400 });
  }

  try {
    const rows = await fetchEpaMpg(year, make, model);
    return NextResponse.json({
      rows,
      source: "https://www.fueleconomy.gov/ws/rest",
      findACar: epaFindACarUrl({ year, make, model, vin: "", address: "", part: "", howTo: "" }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "EPA lookup failed" },
      { status: 502 },
    );
  }
}
