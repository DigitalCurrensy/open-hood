import { scrubConcern } from "@/lib/agent/safety";
import type { AgentVehicleContext } from "@/lib/agent/types";
import { emptyVehicleSpecs } from "@/lib/nhtsa";
import type { VehicleSpecs } from "@/lib/types";

export function specsFromContext(vehicle?: AgentVehicleContext): VehicleSpecs {
  const vin = vehicle?.vin?.trim() ?? "";
  return emptyVehicleSpecs({
    vin,
    year: vehicle?.year?.trim() ?? "",
    make: vehicle?.make?.trim() ?? "",
    model: vehicle?.model?.trim() ?? "",
    mileage: vehicle?.mileage?.trim() ?? "",
    concern: scrubConcern(vehicle?.concern) ?? "",
    identifiedBy: vin ? "vin" : "ymm",
  });
}

export function vehicleLabel(vehicle?: AgentVehicleContext): string {
  const named = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  return named || "this vehicle";
}

export function vehiclePhrase(vehicle?: AgentVehicleContext): string {
  const named = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  return named ? `a ${named}` : "this vehicle";
}

export function thisVehicle(vehicle?: AgentVehicleContext): string {
  const named = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  return named ? `this ${named}` : "this car";
}

export function formatVehicleBrief(vehicle?: AgentVehicleContext): string {
  if (!vehicle) return "No vehicle is on the hook. Speak in general terms and tell them to stamp a VIN on the bay.";
  const concern = scrubConcern(vehicle.concern);
  const bits = [
    vehicleLabel(vehicle),
    vehicle.vin ? `VIN ${vehicle.vin}` : null,
    vehicle.mileage ? `${vehicle.mileage} miles` : null,
    concern ? `Owner concern: ${concern}` : null,
  ].filter(Boolean);
  return bits.join(" · ");
}
