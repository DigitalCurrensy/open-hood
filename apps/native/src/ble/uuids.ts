/** Same UART families as src/lib/obd/bluetooth.ts. Classic SPP pucks are not these. */
export const BLE_SERVICE_UUIDS = [
  "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
  "0000FFE0-0000-1000-8000-00805F9B34FB",
  "0000FFF0-0000-1000-8000-00805F9B34FB",
] as const;

export const NAME_HINT = /elm|obd|vlink|vhm|obdb|carista|veeper|ios-v/i;

export const INIT_OPTIONAL = ["ATL0", "ATS0", "ATH0", "ATSP0"] as const;

export function normalizeUuid(value: string): string {
  return value.replace(/-/g, "").toUpperCase();
}

export function looksLikeElm(name: string | null | undefined, serviceUuids: string[] | null | undefined): boolean {
  if (name && NAME_HINT.test(name)) return true;
  const known = new Set(BLE_SERVICE_UUIDS.map(normalizeUuid));
  return (serviceUuids ?? []).some((uuid) => known.has(normalizeUuid(uuid)));
}
