import { NextResponse } from "next/server";
import { lookupSaferCar } from "@/lib/expert/safercar";
import { fetchRecallBundle, saferCarVinHref, specsFromYearMakeModel, VIN_OPEN_CLOSED_STAMP } from "@/lib/nhtsa";
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
    const result = await lookupSaferCar(year, make, model);
    const vinLookupUrl = isValidVin(vin) ? saferCarVinHref(vin) : result.vinLookupUrl;
    const bundle = isValidVin(vin)
      ? await fetchRecallBundle(specsFromYearMakeModel({ year, make, model, vin }))
      : null;
    const recalls = bundle
      ? bundle.rows.slice(0, 12).map((row) => ({
          campaignNumber: row.campaignNumber,
          component: row.component,
          summary: row.summary,
          consequence: row.consequence,
          remedy: row.remedy,
        }))
      : result.recalls;
    return NextResponse.json({
      ...result,
      recalls,
      recallCount: bundle?.rows.length ?? result.recallCount,
      vin: isValidVin(vin) ? vin : "",
      vinLookupUrl,
      saferCarUrl: isValidVin(vin) ? vinLookupUrl : result.saferCarUrl,
      stamp: bundle?.stamp ?? VIN_OPEN_CLOSED_STAMP,
      stillNotVinTrue: bundle?.stillNotVinTrue ?? VIN_OPEN_CLOSED_STAMP,
      publicVinApi: "forbidden",
      campaignSource: bundle?.campaignSource ?? "ymm",
      vendorFile: bundle?.vendorFile ?? false,
      note: bundle?.vendorFile ? bundle.stamp : VIN_OPEN_CLOSED_STAMP,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SaferCar lookup failed" },
      { status: 502 },
    );
  }
}
