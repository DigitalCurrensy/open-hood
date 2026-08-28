const memory = new Map<string, string | null>();

/** Pre-Open Hood keys. Read once, copy forward, keep writing the new name. */
export function legacyStorageKey(key: string): string | null {
  if (key.startsWith("openhood.")) return `autoshield.${key.slice("openhood.".length)}`;
  if (key.startsWith("openhood-")) return `autoshield-${key.slice("openhood-".length)}`;
  if (key.startsWith("openhood:")) return `autoshield:${key.slice("openhood:".length)}`;
  return null;
}

function readStore(store: Storage, key: string): string | null {
  const fresh = store.getItem(key);
  if (fresh != null) return fresh;
  const legacy = legacyStorageKey(key);
  if (!legacy) return null;
  return store.getItem(legacy);
}

/** Persist bay tickets across tabs. Migrates leftover sessionStorage once. */
export function readBayItem(key: string): string | null {
  if (typeof window === "undefined") return memory.get(key) ?? null;
  try {
    const local = readStore(window.localStorage, key);
    if (local != null) {
      if (window.localStorage.getItem(key) == null) {
        window.localStorage.setItem(key, local);
      }
      memory.set(key, local);
      return local;
    }
    const session = readStore(window.sessionStorage, key);
    if (session != null) {
      window.localStorage.setItem(key, session);
      memory.set(key, session);
      return session;
    }
  } catch {
    return memory.get(key) ?? null;
  }
  return memory.get(key) ?? null;
}

export function writeBayItem(key: string, value: string | null): void {
  memory.set(key, value);
  if (typeof window === "undefined") return;
  try {
    if (value == null) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    /* quota / private mode — in-memory still updates this tab */
  }
}
