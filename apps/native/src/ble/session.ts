import { BleManager, Characteristic, Device, State, type Subscription } from "react-native-ble-plx";
import { base64ToText, textToBase64 } from "../base64";
import { detectElmFault, parseMode03Dtcs } from "./parser";
import { BLE_SERVICE_UUIDS, INIT_OPTIONAL, looksLikeElm } from "./uuids";

export class ElmNativeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ElmNativeError";
  }
}

type Waiter = { resolve: (value: string) => void; reject: (error: Error) => void };

type Uart = {
  serviceUuid: string;
  write: Characteristic;
  notify: Characteristic;
};

const SCAN_MS = 12_000;

export class NativeElm327 {
  private buffer = "";
  private waiters: Waiter[] = [];
  private chain: Promise<unknown> = Promise.resolve();
  private monitor: Subscription | null = null;
  private readonly onDisconnected = () => {
    this.failOpen("Dongle dropped. Park. Unplug. Pair again — not while moving.");
  };

  private constructor(
    readonly manager: BleManager,
    readonly device: Device,
    private readonly uart: Uart,
  ) {}

  get deviceName(): string {
    return this.device.name?.trim() || this.device.localName?.trim() || "ELM327";
  }

  static async scanAndConnect(manager: BleManager): Promise<NativeElm327> {
    const state = await manager.state();
    if (state !== State.PoweredOn) {
      throw new ElmNativeError("Turn Bluetooth on, then scan. Park first.");
    }

    const device = await scanForElm(manager);
    let connected: Device;
    try {
      connected = await device.connect({ timeout: 8000 });
    } catch {
      throw new ElmNativeError("Pair failed. Park. Unplug the dongle. Classic SPP pucks stay in Car Scanner or Torque.");
    }

    await connected.discoverAllServicesAndCharacteristics();
    const uart = await findUart(connected);
    const session = new NativeElm327(manager, connected, uart);
    connected.onDisconnected(session.onDisconnected);
    session.monitor = uart.notify.monitor((error, characteristic) => {
      if (error) return;
      if (!characteristic?.value) return;
      session.buffer += base64ToText(characteristic.value);
      if (session.buffer.includes(">")) session.flush();
    });
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

  async readDtcs(): Promise<{ dtcs: string[]; raw: string; fault: string | null }> {
    const raw = await this.command("03", 3000);
    return {
      dtcs: parseMode03Dtcs(raw),
      raw,
      fault: detectElmFault(raw),
    };
  }

  disconnect(): void {
    this.failOpen("Disconnected.");
    this.monitor?.remove();
    this.monitor = null;
    void this.device.cancelConnection();
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
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((item) => item.resolve !== succeed);
        reject(new ElmNativeError("Dongle went quiet. Unplug, wait, pair again — not while moving."));
      }, timeoutMs);

      const succeed = (value: string) => {
        clearTimeout(timer);
        resolve(value);
      };
      const fail = (error: Error) => {
        clearTimeout(timer);
        reject(error);
      };

      this.buffer = "";
      this.waiters.push({ resolve: succeed, reject: fail });
      void writeAt(this.uart.write, line).catch((error: unknown) => {
        this.waiters = this.waiters.filter((item) => item.resolve !== succeed);
        fail(error instanceof Error ? error : new ElmNativeError("Write failed."));
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
    for (const waiter of pending) waiter.reject(new ElmNativeError(message));
  }
}

async function scanForElm(manager: BleManager): Promise<Device> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const hits = new Map<string, Device>();

    const finish = (device: Device | null, error?: Error) => {
      if (settled) return;
      settled = true;
      manager.stopDeviceScan();
      clearTimeout(timer);
      if (device) {
        resolve(device);
        return;
      }
      reject(
        error ??
          new ElmNativeError(
            "No BLE UART in range. Need a BLE ELM327 (FFE0 / FFF0 / Nordic UART). Classic SPP pucks stay in Car Scanner or Torque — then type the code.",
          ),
      );
    };

    const timer = setTimeout(() => {
      const first = [...hits.values()][0] ?? null;
      finish(first);
    }, SCAN_MS);

    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        finish(null, new ElmNativeError(error.message || "Scan failed."));
        return;
      }
      if (!device) return;
      const name = device.name || device.localName || "";
      if (!looksLikeElm(name, device.serviceUUIDs)) return;
      hits.set(device.id, device);
      if (NAME_STRONG.test(name)) finish(device);
    });
  });
}

const NAME_STRONG = /elm327|obdii|obd-ii/i;

async function findUart(device: Device): Promise<Uart> {
  const services = await device.services();
  const preferred = new Set(BLE_SERVICE_UUIDS.map((uuid) => uuid.replace(/-/g, "").toUpperCase()));
  const ordered = [
    ...services.filter((service) => preferred.has(service.uuid.replace(/-/g, "").toUpperCase())),
    ...services.filter((service) => !preferred.has(service.uuid.replace(/-/g, "").toUpperCase())),
  ];

  for (const service of ordered) {
    const chars = await service.characteristics();
    const write = chars.find((item) => item.isWritableWithResponse || item.isWritableWithoutResponse);
    const notify = chars.find((item) => item.isNotifiable || item.isIndicatable);
    if (write && notify) {
      return { serviceUuid: service.uuid, write, notify };
    }
  }

  throw new ElmNativeError(
    "That device did not expose a BLE UART. Classic Bluetooth ELM327 pucks need Car Scanner or Torque — or type the code from any $20 tool.",
  );
}

async function writeAt(characteristic: Characteristic, command: string): Promise<void> {
  const payload = textToBase64(`${command}\r`);
  if (characteristic.isWritableWithoutResponse) {
    await characteristic.writeWithoutResponse(payload);
    return;
  }
  await characteristic.writeWithResponse(payload);
}
