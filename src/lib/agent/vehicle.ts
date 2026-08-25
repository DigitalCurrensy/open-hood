import type { AgentVehicleContext } from "@/lib/agent/types";
import type { VehicleSpecs } from "@/lib/types";

export function specsFromContext(vehicle?: AgentVehicleContext): VehicleSpecs {
  const vin = vehicle?.vin?.trim() ?? "";
  return {
    vin,
    year: vehicle?.year?.trim() ?? "",
    make: vehicle?.make?.trim() ?? "",
    model: vehicle?.model?.trim() ?? "",
    trim: "",
    series: "",
    bodyClass: "",
    driveType: "",
    transmission: "",
    engineDisplacement: "",
    engineModel: "",
    cylinders: "",
    engineConfig: "",
    fuelType: "",
    manufacturer: "",
    plant: "",
    doors: "",
    gvwr: "",
    errorText: "",
    plate: "",
    plateState: "",
    mileage: vehicle?.mileage?.trim() ?? "",
    concern: vehicle?.concern?.trim() ?? "",
    identifiedBy: vin ? "vin" : "ymm",
  };
}

export function vehicleLabel(vehicle?: AgentVehicleContext): string {
  const named = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  return named || "this vehicle";
}

/** "a 2018 Honda Accord" or "this vehicle" — safe after "on" / "for". */
export function vehiclePhrase(vehicle?: AgentVehicleContext): string {
  const named = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  return named ? `a ${named}` : "this vehicle";
}

/** "this 2018 Honda Accord" or "this car". */
export function thisVehicle(vehicle?: AgentVehicleContext): string {
  const named = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  return named ? `this ${named}` : "this car";
}

export function formatVehicleBrief(vehicle?: AgentVehicleContext): string {
  if (!vehicle) return "No vehicle is on the hook. Speak in general terms and tell them to stamp a VIN on the bay.";
  const bits = [
    vehicleLabel(vehicle),
    vehicle.vin ? `VIN ${vehicle.vin}` : null,
    vehicle.mileage ? `${vehicle.mileage} miles` : null,
    vehicle.concern ? `Owner concern: ${vehicle.concern}` : null,
  ].filter(Boolean);
  return bits.join(" · ");
}
