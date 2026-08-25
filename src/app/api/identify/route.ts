import { NextResponse } from "next/server";
import { buildFluidSpecSheet } from "@/lib/fluids";
import { decodeVin, fetchRecalls, specsFromYearMakeModel } from "@/lib/nhtsa";
import { isValidVin, normalizeVin } from "@/lib/vin";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    vin?: string;
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
    engine?: string;
    plate?: string;
    plateState?: string;
    mileage?: string;
    concern?: string;
  };

  const vin = normalizeVin(body.vin ?? "");

  try {
    if (isValidVin(vin)) {
      const specs = await decodeVin(vin);
      specs.plate = body.plate?.trim().toUpperCase() ?? "";
      specs.plateState = body.plateState?.trim().toUpperCase() ?? "";
      specs.mileage = body.mileage?.trim() ?? "";
      specs.concern = body.concern?.trim() ?? "";
      specs.identifiedBy = "vin";
      const [recalls, fluids] = await Promise.all([fetchRecalls(specs), Promise.resolve(buildFluidSpecSheet(specs))]);
      return NextResponse.json({ specs, fluids, recalls });
    }

    if (!body.year || !body.make || !body.model) {
      return NextResponse.json(
        { error: "Use a 17-character VIN, or give year, make, and model." },
        { status: 400 },
      );
    }

    const specs = specsFromYearMakeModel({
      year: body.year,
      make: body.make,
      model: body.model,
      trim: body.trim,
      engine: body.engine,
      plate: body.plate,
      plateState: body.plateState,
      mileage: body.mileage,
      concern: body.concern,
    });
    const [recalls, fluids] = await Promise.all([fetchRecalls(specs), Promise.resolve(buildFluidSpecSheet(specs))]);
    fluids.caveats = [
      ...fluids.caveats,
      "Identified by year / make / model — not a VIN. Specs are typical for this combo, not this exact car.",
    ];
    return NextResponse.json({ specs, fluids, recalls });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Identify failed" },
      { status: 502 },
    );
  }
}
