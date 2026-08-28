import { parseCoolantC, parseMode03Dtcs, parseRpm, parseSpeedKph, detectElmFault } from "@/lib/obd/parser";
import { emptySnapshot, type LivePids, type LiveSnapshot } from "@/lib/obd/types";

const BLE_SERVICES = [
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000fff0-0000-1000-8000-00805f9b34fb",
  0xffe0,
  0xfff0,
] as const;

const INIT_OPTIONAL = ["ATL0", "ATS0", "ATH0", "ATSP0"] as const;

export class Elm327Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Elm327Error";
  }
}

type BleCharacteristic = {
  properties: {
    write?: boolean;
    writeWithoutResponse?: boolean;
    notify?: boolean;
    indicate?: boolean;
  };
  value?: DataView | null;
  startNotifications(): Promise<unknown>;
  stopNotifications?: () => Promise<unknown>;
  addEventListener(type: "characteristicvaluechanged", listener: (event: Event) => void): void;
  removeEventListener(type: "characteristicvaluechanged", listener: (event: Event) => void): void;
  writeValueWithoutResponse?(data: BufferSource): Promise<void>;
  writeValueWithResponse?(data: BufferSource): Promise<void>;
  writeValue?(data: BufferSource): Promise<void>;
};

type BleService = {
  getCharacteristics(): Promise<BleCharacteristic[]>;
};

type BleServer = {
  connected: boolean;
  getPrimaryService(uuid: string | number): Promise<BleService>;
  getPrimaryServices?(): Promise<BleService[]>;
};

type BleDevice = {
  name?: string | null;
  gatt?: {
    connected: boolean;
    connect(): Promise<BleServer>;
    disconnect(): void;
  } | null;
  addEventListener(type: "gattserverdisconnected", listener: () => void): void;
  removeEventListener(type: "gattserverdisconnected", listener: () => void): void;
};

function bluetoothApi(): {
  requestDevice(options: {
    acceptAllDevices: boolean;
    optionalServices: readonly (string | number)[];
  }): Promise<BleDevice>;
} | null {
  if (typeof navigator === "undefined") return null;
  const candidate = (navigator as Navigator & { bluetooth?: { requestDevice: (options: unknown) => Promise<BleDevice> } })
    .bluetooth;
  return candidate ?? null;
}

export function hasWebBluetooth(): boolean {
  return bluetoothApi() !== null;
}

async function writeCommand(characteristic: BleCharacteristic, command: string): Promise<void> {
  const payload = new TextEncoder().encode(`${command}\r`);
  if (characteristic.properties.writeWithoutResponse && characteristic.writeValueWithoutResponse) {
    await characteristic.writeValueWithoutResponse(payload);
    return;
  }
  if (characteristic.writeValueWithResponse) {
    await characteristic.writeValueWithResponse(payload);
    return;
  }
  if (characteristic.writeValue) {
    await characteristic.writeValue(payload);
    return;
  }
  throw new Elm327Error("That characteristic will not take AT commands.");
}

async function findUart(server: BleServer): Promise<{ write: BleCharacteristic; notify: BleCharacteristic }> {
  for (const uuid of BLE_SERVICES) {
    try {
      const service = await server.getPrimaryService(uuid);
      const chars = await service.getCharacteristics();
      const write = chars.find((item) => item.properties.write || item.properties.writeWithoutResponse);
      const notify = chars.find((item) => item.properties.notify || item.properties.indicate);
      if (write && notify) return { write, notify };
    } catch {
      /* try the next well-known UART */
    }
  }
  throw new Elm327Error(
    "That device did not expose a BLE UART. Classic Bluetooth ELM327 pucks need Car Scanner or Torque on Android — or type the code from any $20 tool.",
  );
}

export class Elm327Session {
  private buffer = "";
  private waiters: Array<{ resolve: (value: string) => void; reject: (error: Error) => void }> = [];
  private chain: Promise<unknown> = Promise.resolve();
  private readonly onNotify = (event: Event) => {
    const target = event.target as BleCharacteristic | null;
    if (!target?.value) return;
    this.buffer += new TextDecoder().decode(target.value);
    if (this.buffer.includes(">")) this.flush();
  };
  private readonly onDisconnected = () => {
    this.failOpen("Dongle dropped. Park. Unplug. Pair again — not while moving.");
  };

  private constructor(
    readonly device: BleDevice,
    private readonly write: BleCharacteristic,
    private readonly notify: BleCharacteristic,
  ) {}

  get deviceName(): string {
    return this.device.name?.trim() || "ELM327";
  }

  static async request(): Promise<Elm327Session> {
    const api = bluetoothApi();
    if (!api) {
      throw new Elm327Error("Web Bluetooth is missing. Use Chrome on Android or a USB adapter.");
    }

    let device: BleDevice;
    try {
      device = await api.requestDevice({
        acceptAllDevices: true,
        optionalServices: BLE_SERVICES,
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      if (name === "NotFoundError" || name === "NotAllowedError") {
        throw new Elm327Error("Pairing cancelled. Park first, then Connect — or load demo PIDs.");
      }
      throw new Elm327Error("This browser refused the Bluetooth picker. Chrome on Android is the supported path.");
    }

    const gatt = device.gatt;
    if (!gatt) throw new Elm327Error("That device has no GATT server.");
    const server = await gatt.connect();
    const uart = await findUart(server);
    await uart.notify.startNotifications();

    const session = new Elm327Session(device, uart.write, uart.notify);
    session.notify.addEventListener("characteristicvaluechanged", session.onNotify);
    device.addEventListener("gattserverdisconnected", session.onDisconnected);
    return session;
  }

  async init(): Promise<string> {
    const version = await this.command("ATZ", 3500);
    await this.command("ATE0", 2000);
    for (const extra of INIT_OPTIONAL) {
      try {
        await this.command(extra, extra === "ATSP0" ? 5000 : 1500);
      } catch {
        /* clones skip optional AT lines */
      }
    }
    return version.replace(/>/g, "").trim() || this.deviceName;
  }

  async readPids(): Promise<LivePids & { raw: LiveSnapshot["raw"]; fault: string | null }> {
    const rpmRaw = await this.command("010C");
    const speedRaw = await this.command("010D");
    const coolantRaw = await this.command("0105");
    const fault =
      detectElmFault(rpmRaw) ?? detectElmFault(speedRaw) ?? detectElmFault(coolantRaw);
    return {
      rpm: parseRpm(rpmRaw),
      speedKph: parseSpeedKph(speedRaw),
      coolantC: parseCoolantC(coolantRaw),
      raw: { "010C": rpmRaw, "010D": speedRaw, "0105": coolantRaw },
      fault: fault?.message ?? null,
    };
  }

  async readDtcs(): Promise<{ dtcs: string[]; raw: string; fault: string | null }> {
    const raw = await this.command("03", 3000);
    const fault = detectElmFault(raw);
    return {
      dtcs: parseMode03Dtcs(raw),
      raw,
      fault: fault && fault.code !== "NO_DATA" ? fault.message : null,
    };
  }

  async snapshot(): Promise<LiveSnapshot> {
    const pids = await this.readPids();
    const codes = await this.readDtcs();
    return {
      ...emptySnapshot("live"),
      source: "live",
      rpm: pids.rpm,
      speedKph: pids.speedKph,
      coolantC: pids.coolantC,
      dtcs: codes.dtcs,
      deviceName: this.deviceName,
      raw: { ...pids.raw, "03": codes.raw },
      fault: pids.fault ?? codes.fault,
    };
  }

  disconnect(): void {
    this.failOpen("Disconnected.");
    this.notify.removeEventListener("characteristicvaluechanged", this.onNotify);
    this.device.removeEventListener("gattserverdisconnected", this.onDisconnected);
    try {
      void this.notify.stopNotifications?.();
    } catch {
      /* already gone */
    }
    try {
      this.device.gatt?.disconnect();
    } catch {
      /* already gone */
    }
  }

  private command(line: string, timeoutMs = 2000): Promise<string> {
    const run = this.chain.then(() => this.exchange(line, timeoutMs));
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private exchange(line: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.waiters = this.waiters.filter((item) => item.resolve !== succeed);
        reject(new Elm327Error("Dongle went quiet. Unplug, wait, pair again — not while moving."));
      }, timeoutMs);

      const succeed = (value: string) => {
        window.clearTimeout(timer);
        resolve(value);
      };
      const fail = (error: Error) => {
        window.clearTimeout(timer);
        reject(error);
      };

      this.buffer = "";
      this.waiters.push({ resolve: succeed, reject: fail });
      void writeCommand(this.write, line).catch((error: unknown) => {
        this.waiters = this.waiters.filter((item) => item.resolve !== succeed);
        fail(error instanceof Error ? error : new Elm327Error("Write failed."));
      });
    });
  }

  private flush(): void {
    const cut = this.buffer.indexOf(">");
    if (cut === -1) return;
    const chunk = this.buffer.slice(0, cut);
    this.buffer = this.buffer.slice(cut + 1);
    const waiter = this.waiters.shift();
    waiter?.resolve(chunk);
    if (this.buffer.includes(">")) this.flush();
  }

  private failOpen(message: string): void {
    const pending = this.waiters.splice(0);
    for (const waiter of pending) waiter.reject(new Elm327Error(message));
  }
}
