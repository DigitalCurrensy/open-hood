import { NextResponse } from "next/server";
import { buildFluidSpecSheet } from "@/lib/fluids";
import { decodeVin, fetchRecalls } from "@/lib/nhtsa";
import { isValidVin, normalizeVin } from "@/lib/vin";

export async function POST(request: Request) {
  const body = (await request.json()) as { vin?: string };
  const vin = normalizeVin(body.vin ?? "");
  if (!isValidVin(vin)) {
    return NextResponse.json(
      { error: "Enter a 17-character VIN. Letters I, O, and Q are never used." },
      { status: 400 },
    );
  }

  try {
    const specs = await decodeVin(vin);
    if (!specs.make && !specs.model) {
      return NextResponse.json(
        { error: specs.errorText || "NHTSA could not decode that VIN." },
        { status: 422 },
      );
    }

    const [recalls, fluids] = await Promise.all([
      fetchRecalls(specs),
      Promise.resolve(buildFluidSpecSheet(specs)),
    ]);

    return NextResponse.json({ specs, fluids, recalls });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "VIN decode failed" },
      { status: 502 },
    );
  }
}
