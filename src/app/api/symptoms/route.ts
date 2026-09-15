import { NextResponse } from "next/server";
import { diagnoseSymptoms } from "@/lib/symptoms";
import type { SymptomNoise, SymptomWhen, VehicleSpecs } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    noise?: SymptomNoise;
    when?: SymptomWhen;
    warningLight?: boolean;
    leak?: boolean;
    pull?: boolean;
    specs?: VehicleSpecs;
    vehicle?: { year?: string; make?: string; model?: string };
  };

  const year = body.specs?.year || body.vehicle?.year;
  const make = body.specs?.make || body.vehicle?.make;
  if (!year || !make) {
    return NextResponse.json({ error: "Identify the vehicle first." }, { status: 400 });
  }
  if (!body.noise || !body.when) {
    return NextResponse.json({ error: "Pick the sound and when it happens." }, { status: 400 });
  }

  const findings = diagnoseSymptoms(
    body.noise,
    body.when,
    {
      warningLight: Boolean(body.warningLight),
      leak: Boolean(body.leak),
      pull: Boolean(body.pull),
    },
    { ...(body.specs as VehicleSpecs), year, make, model: body.specs?.model || body.vehicle?.model || "" },
  );

  return NextResponse.json({ findings });
}
