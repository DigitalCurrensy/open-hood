import { PermissionsAndroid, Platform } from "react-native";

/** Android 12+ needs SCAN + CONNECT. Older Android still asks location for a BLE scan. */
export async function requestBlePermissions(): Promise<void> {
  if (Platform.OS !== "android") return;

  if (Platform.Version >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    const scan = result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN];
    const connect = result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT];
    if (scan !== PermissionsAndroid.RESULTS.GRANTED || connect !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error("Bluetooth permission refused. Type the code on the website instead.");
    }
    return;
  }

  const location = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  if (location !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error("Location permission refused. Android needs it to scan BLE on this OS version.");
  }
}
