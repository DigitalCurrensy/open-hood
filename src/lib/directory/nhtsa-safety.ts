import type { NhtsaComplaintSummary, NhtsaRatingRow, NhtsaRecallSummary } from "@/lib/directory/types";

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

interface RatingMenuRow {
  VehicleId?: string | number;
  VehicleDescription?: string;
}

interface RatingDetailRow {
  VehicleId?: string | number;
  VehicleDescription?: string;
  OverallRating?: string;
  OverallFrontCrashRating?: string;
  OverallSideCrashRating?: string;
  RolloverRating?: string;
}

export async function fetchComplaintSummary(
  year: string,
  make: string,
  model: string,
): Promise<NhtsaComplaintSummary> {
  const empty: NhtsaComplaintSummary = {
    count: 0,
    crash: 0,
    fire: 0,
    injured: 0,
    deaths: 0,
    topComponents: [],
  };
  if (!year || !make || !model) return empty;

  const params = new URLSearchParams({ make, model, modelYear: year });
  const response = await fetch(
    `https://api.nhtsa.gov/complaints/complaintsByVehicle?${params.toString()}`,
    { signal: AbortSignal.timeout(12_000), next: { revalidate: 3600 } },
  );
  if (!response.ok) return empty;

  const payload = (await response.json()) as { count?: number; results?: ComplaintRow[] };
  const rows = payload.results ?? [];
  const components = new Map<string, number>();
  let crash = 0;
  let fire = 0;
  let injured = 0;
  let deaths = 0;

  for (const row of rows) {
    if (row.crash) crash += 1;
    if (row.fire) fire += 1;
    injured += Number(row.injured ?? row.numberOfInjuries ?? 0) || 0;
    deaths += Number(row.deaths ?? row.numberOfDeaths ?? 0) || 0;
    const label = (row.components || row.component || "").split(",")[0]?.trim();
    if (label) components.set(label, (components.get(label) ?? 0) + 1);
  }

  return {
    count: payload.count ?? rows.length,
    crash,
    fire,
    injured,
    deaths,
    topComponents: [...components.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name),
  };
}

export async function fetchSafetyRatings(
  year: string,
  make: string,
  model: string,
): Promise<NhtsaRatingRow[]> {
  if (!year || !make || !model) return [];

  const menuUrl = `https://api.nhtsa.gov/SafetyRatings/modelyear/${encodeURIComponent(year)}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`;
  const menu = await fetch(menuUrl, { signal: AbortSignal.timeout(10_000), next: { revalidate: 86_400 } });
  if (!menu.ok) return [];
  const menuPayload = (await menu.json()) as { Results?: RatingMenuRow[] };
  const ids = (menuPayload.Results ?? [])
    .map((row) => String(row.VehicleId ?? ""))
    .filter(Boolean)
    .slice(0, 4);

  const details = await Promise.all(
    ids.map(async (id) => {
      const response = await fetch(`https://api.nhtsa.gov/SafetyRatings/VehicleId/${encodeURIComponent(id)}`, {
        next: { revalidate: 86_400 },
      });
      if (!response.ok) return null;
      const payload = (await response.json()) as { Results?: RatingDetailRow[] };
      const row = payload.Results?.[0];
      if (!row) return null;
      return {
        vehicleId: String(row.VehicleId ?? id),
        description: row.VehicleDescription ?? "",
        overall: row.OverallRating ?? "Not rated",
        front: row.OverallFrontCrashRating ?? "Not rated",
        side: row.OverallSideCrashRating ?? "Not rated",
        rollover: row.RolloverRating ?? "Not rated",
      } satisfies NhtsaRatingRow;
    }),
  );

  return details.filter((row): row is NhtsaRatingRow => Boolean(row));
}

export async function fetchRecallSummary(
  year: string,
  make: string,
  model: string,
): Promise<NhtsaRecallSummary> {
  const empty: NhtsaRecallSummary = { count: 0, campaigns: [] };
  if (!year || !make || !model) return empty;

  const params = new URLSearchParams({ make, model, modelYear: year });
  const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?${params.toString()}`, {
    signal: AbortSignal.timeout(12_000),
    next: { revalidate: 3600 },
  });
  if (!response.ok) return empty;

  const payload = (await response.json()) as {
    Count?: number;
    count?: number;
    results?: { NHTSACampaignNumber?: string }[];
  };
  const rows = payload.results ?? [];
  return {
    count: payload.Count ?? payload.count ?? rows.length,
    campaigns: rows.map((row) => row.NHTSACampaignNumber ?? "").filter(Boolean).slice(0, 5),
  };
}
