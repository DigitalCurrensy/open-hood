import type { EpaMpgRow } from "@/lib/directory/types";

interface MenuItem {
  text?: string;
  value?: string;
}

interface MenuPayload {
  menuItem?: MenuItem | MenuItem[];
}

interface VehiclePayload {
  id?: string | number;
  year?: string | number;
  make?: string;
  model?: string;
  city08?: string | number;
  highway08?: string | number;
  comb08?: string | number;
  fuelType1?: string;
  trany?: string;
  VClass?: string;
}

function items(payload: MenuPayload): MenuItem[] {
  const raw = payload.menuItem;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

async function epaJson<T>(path: string): Promise<T> {
  const response = await fetch(`https://www.fueleconomy.gov/ws/rest${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok) {
    throw new Error(`FuelEconomy.gov returned ${response.status}`);
  }
  const text = await response.text();
  if (!text || text === "null") return { menuItem: [] } as T;
  return JSON.parse(text) as T;
}

function num(value: string | number | undefined): number | null {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : null;
}

async function matchingModels(year: string, make: string, model: string): Promise<string[]> {
  const menu = await epaJson<MenuPayload>(
    `/vehicle/menu/model?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}`,
  );
  const wanted = model.trim().toLowerCase();
  const names = items(menu)
    .map((item) => item.value || item.text || "")
    .filter(Boolean);
  const exact = names.filter((name) => name.toLowerCase() === wanted);
  if (exact.length) return exact.slice(0, 3);
  const prefix = names.filter((name) => name.toLowerCase().startsWith(wanted));
  if (prefix.length) return prefix.slice(0, 3);
  return names.filter((name) => name.toLowerCase().includes(wanted)).slice(0, 3);
}

export async function fetchEpaMpg(year: string, make: string, model: string): Promise<EpaMpgRow[]> {
  if (!year || !make || !model) return [];

  const models = await matchingModels(year, make, model);
  const optionLists = await Promise.all(
    (models.length ? models : [model]).map((name) =>
      epaJson<MenuPayload>(
        `/vehicle/menu/options?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(name)}`,
      ).catch(() => ({ menuItem: [] }) as MenuPayload),
    ),
  );
  const options = optionLists.flatMap(items);

  const rows = options.slice(0, 8);
  const vehicles = await Promise.all(
    rows.map(async (item) => {
      const id = String(item.value ?? "");
      if (!id) return null;
      try {
        const vehicle = await epaJson<VehiclePayload>(`/vehicle/${encodeURIComponent(id)}`);
        return {
          id,
          label: item.text ?? `${year} ${make} ${model}`,
          year: String(vehicle.year ?? year),
          make: vehicle.make ?? make,
          model: vehicle.model ?? model,
          cityMpg: num(vehicle.city08),
          highwayMpg: num(vehicle.highway08),
          combinedMpg: num(vehicle.comb08),
          fuel: [vehicle.fuelType1, vehicle.trany, vehicle.VClass].filter(Boolean).join(" · "),
        } satisfies EpaMpgRow;
      } catch {
        return null;
      }
    }),
  );

  return vehicles.filter((row): row is EpaMpgRow => Boolean(row));
}
