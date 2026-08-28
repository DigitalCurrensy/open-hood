import type { FinderYmm } from "@/lib/finder/types";

const EMPTY: FinderYmm = { year: "", make: "", model: "", engine: "", drive: "" };

function trim(value: string | undefined | null): string {
  return (value ?? "").trim();
}

export function emptyYmm(): FinderYmm {
  return { ...EMPTY };
}

export function ymmFromRecord(input: {
  year?: string;
  make?: string;
  model?: string;
  engine?: string;
  engineDisplacement?: string;
  engineModel?: string;
  cylinders?: string;
  drive?: string;
  driveType?: string;
}): FinderYmm {
  const engine = [trim(input.engine), trim(input.engineDisplacement), trim(input.engineModel), trim(input.cylinders)]
    .filter(Boolean)
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(" ");
  return {
    year: trim(input.year),
    make: trim(input.make),
    model: trim(input.model),
    engine,
    drive: trim(input.drive) || trim(input.driveType),
  };
}

export function ymmLabel(ymm: FinderYmm): string {
  return [ymm.year, ymm.make, ymm.model].filter(Boolean).join(" ").trim();
}

export function ymmHasVehicle(ymm: FinderYmm): boolean {
  return Boolean(ymm.year && ymm.make && ymm.model);
}

export function drivePlain(drive: string): string {
  const raw = drive.trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (/\b(4WD|4X4|FOUR[-\s]?WHEEL)\b/.test(upper) || /4WD|4X4/.test(upper)) return "4WD";
  if (/\b(AWD|ALL[-\s]?WHEEL)\b/.test(upper)) return "AWD";
  if (/\b(FWD|FRONT[-\s]?WHEEL)\b/.test(upper)) return "FWD / 2WD";
  if (/\b(RWD|REAR[-\s]?WHEEL)\b/.test(upper)) return "RWD / 2WD";
  if (/\b(2WD|TWO[-\s]?WHEEL)\b/.test(upper)) return "2WD";
  return raw;
}
