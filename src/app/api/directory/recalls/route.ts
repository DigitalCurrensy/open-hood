import { NextResponse } from "next/server";
import { fetchRecallSummary } from "@/lib/directory/nhtsa-safety";
import {
  fetchRecallBundle,
  groupRecallsByCampaign,
  saferCarVinHref,
  specsFromYearMakeModel,
  STILL_NOT_VIN_TRUE,
  VIN_OPEN_CLOSED_STAMP,
} from "@/lib/nhtsa";
import { isValidVin, normalizeVin } from "@/lib/vin";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const year = params.get("year") ?? "";
  const make = params.get("make") ?? "";
  const model = params.get("model") ?? "";
  const vin = normalizeVin(params.get("vin") ?? "");
  if (!year || !make || !model) {
    return NextResponse.json({ error: "Need year, make, and model." }, { status: 400 });
  }
  try {
    const specs = specsFromYearMakeModel({ year, make, model, vin: isValidVin(vin) ? vin : "" });
    const [summary, bundle] = await Promise.all([fetchRecallSummary(year, make, model), fetchRecallBundle(specs)]);
    const campaigns = groupRecallsByCampaign(bundle.rows);
    return NextResponse.json({
      count: summary.count || campaigns.length,
      campaigns: summary.campaigns,
      grouped: campaigns.map((group) => ({
        campaignNumber: group.campaignNumber,
        component: group.component,
        consequence: group.consequence,
        remedy: group.remedy,
        summary: group.summary,
        reportReceivedDate: group.reportReceivedDate,
      })),
      saferCarUrl: saferCarVinHref(isValidVin(vin) ? vin : ""),
      stamp: bundle.stamp,
      stillNotVinTrue: bundle.stillNotVinTrue,
      campaignSource: bundle.campaignSource,
      vendorFile: bundle.vendorFile,
      publicVinApi: "forbidden",
      note: bundle.vendorFile
        ? bundle.stamp
        : isValidVin(vin)
          ? STILL_NOT_VIN_TRUE
          : VIN_OPEN_CLOSED_STAMP,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "NHTSA recalls failed" },
      { status: 502 },
    );
  }
}
