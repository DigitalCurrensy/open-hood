import { NextResponse } from "next/server";
import { fetchComplaintSummary, fetchSafetyRatings } from "@/lib/directory/nhtsa-safety";
import { decodeVin, fetchRecalls, fetchVinCampaignLookup, specsFromYearMakeModel } from "@/lib/nhtsa";
import { isValidVin, normalizeVin } from "@/lib/vin";
import { nhtsaRecallsUrl, nhtsaVinDecoderUrl } from "@/lib/integrations/urls";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const kind = (params.get("kind") ?? params.get("action") ?? "vin").trim();
  const vin = normalizeVin(params.get("vin") ?? "");
  const year = (params.get("year") ?? "").trim();
  const make = (params.get("make") ?? "").trim();
  const model = (params.get("model") ?? "").trim();

  try {
    if (kind === "recallsByVin" || kind === "vin-true") {
      const probeVin = isValidVin(vin) ? vin : "1HGCM82633A004352";
      const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${encodeURIComponent(probeVin)}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      return NextResponse.json({
        configured: false,
        connected: false,
        publicVinApi: "forbidden",
        status: response.status,
        vin: probeVin,
        campaigns: [],
        saferCar: nhtsaRecallsUrl({ year: "", make: "", model: "", vin: probeVin, address: "", part: "", howTo: "" }),
        note:
          response.status === 403
            ? "recallsByVin is 403. Open vs closed is on nhtsa.gov/recalls. We do not parse SaferCar HTML."
            : `recallsByVin returned ${response.status}. Still not a close-out we will invent.`,
      });
    }

    if (kind === "vin" || kind === "vin-campaign") {
      if (!isValidVin(vin)) {
        return NextResponse.json({ error: "Need a 17-character VIN." }, { status: 400 });
      }
      if (kind === "vin-campaign") {
        const lookup = await fetchVinCampaignLookup(vin);
        return NextResponse.json(lookup);
      }
      const specs = await decodeVin(vin);
      return NextResponse.json({
        specs,
        decoder: nhtsaVinDecoderUrl(),
        recalls: nhtsaRecallsUrl({ year: "", make: "", model: "", vin, address: "", part: "", howTo: "" }),
      });
    }

    if (!year || !make || !model) {
      return NextResponse.json({ error: "Need year, make, and model." }, { status: 400 });
    }

    if (kind === "recalls") {
      const recalls = await fetchRecalls(specsFromYearMakeModel({ year, make, model, vin }));
      return NextResponse.json({
        recalls,
        saferCar: nhtsaRecallsUrl({ year, make, model, vin, address: "", part: "", howTo: "" }),
      });
    }

    if (kind === "complaints") {
      const summary = await fetchComplaintSummary(year, make, model);
      return NextResponse.json({ summary });
    }

    if (kind === "ratings") {
      const rows = await fetchSafetyRatings(year, make, model);
      return NextResponse.json({ rows });
    }

    return NextResponse.json(
      { error: "kind must be vin, vin-campaign, recallsByVin, recalls, complaints, or ratings." },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "NHTSA lookup failed" },
      { status: 502 },
    );
  }
}
