import { NextResponse } from "next/server";
import { fetchMakesForYear, fetchModelsForMakeYear } from "@/lib/nhtsa";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") ?? "";
  const make = searchParams.get("make") ?? "";

  try {
    if (make && year) {
      const models = await fetchModelsForMakeYear(make, year);
      return NextResponse.json({ models });
    }
    const makes = await fetchMakesForYear(year);
    return NextResponse.json({ makes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Catalog failed" },
      { status: 502 },
    );
  }
}
