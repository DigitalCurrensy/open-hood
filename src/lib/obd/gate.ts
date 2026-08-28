import { hasWebBluetooth } from "@/lib/obd/bluetooth";
import { isIosDevice } from "@/lib/pwa";

export type BluetoothGate = "pending" | "ble" | "ios" | "insecure" | "missing";

/** Web Bluetooth is a snapshot of the browser, not a store. */
export function subscribeBluetoothGate(): () => void {
  return () => undefined;
}

export function bluetoothGateSnapshot(): BluetoothGate {
  if (typeof window === "undefined") return "pending";
  if (isIosDevice()) return "ios";
  if (!window.isSecureContext) return "insecure";
  return hasWebBluetooth() ? "ble" : "missing";
}

export function bluetoothGateServerSnapshot(): BluetoothGate {
  return "pending";
}
