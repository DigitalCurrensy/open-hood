const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export function normalizeVin(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 17);
}

export function isValidVin(vin: string): boolean {
  return VIN_PATTERN.test(vin);
}

export const DEMO_VINS: Array<{ vin: string; label: string }> = [
  { vin: "1HGCM82633A004352", label: "2003 Honda Accord" },
  { vin: "1FTFW1ET5DFC10312", label: "2013 Ford F-150" },
  { vin: "5YJSA1E26HF000123", label: "2017 Tesla Model S" },
];
