export { Elm327Error, Elm327Session, hasWebBluetooth } from "@/lib/obd/bluetooth";
export { demoSnapshot, DEMO_ELM_RAW } from "@/lib/obd/demo";
export { FREEZE_FRAME_ASK, FREEZE_FRAME_LINE } from "@/lib/obd/freeze-frame";
export type { FreezeFrameAsk } from "@/lib/obd/freeze-frame";
export {
  bluetoothGateServerSnapshot,
  bluetoothGateSnapshot,
  subscribeBluetoothGate,
} from "@/lib/obd/gate";
export type { BluetoothGate } from "@/lib/obd/gate";
export { coreObdHref, jobsObdHref, quoteFromDtcHref } from "@/lib/obd/href";
export {
  bytesFromElm,
  decodeDtcWord,
  detectElmFault,
  extractMode01Data,
  normalizeElmHex,
  parseCoolantC,
  parseLivePids,
  parseMode03Dtcs,
  parseRpm,
  parseSpeedKph,
  stripElmPrompt,
} from "@/lib/obd/parser";
export { celsiusToFahrenheit, kphToMph, LIVE_PID_REQUESTS, PIDS_SUPPORTED } from "@/lib/obd/pids";
export { EMPTY_PIDS, emptySnapshot } from "@/lib/obd/types";
export type { ElmParseFault, ElmSource, LivePids, LiveSnapshot, ObdMode, SupportedPid } from "@/lib/obd/types";
