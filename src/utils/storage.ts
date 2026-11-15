import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * In-memory mirror used for synchronous reads on native (once hydrated) and as
 * a safe fallback when Web `localStorage` is unavailable.
 */
const memoryCache = new Map<string, string>();
let hydrationPromise: Promise<void> | null = null;

function hasWebLocalStorage(): boolean {
  return (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    Boolean(window.localStorage)
  );
}

function parseJsonSafe<T>(raw: string | null | undefined, fallback: T): T {
  if (raw === null || raw === undefined || raw === "") {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Synchronously reads JSON-encoded state. On web this reads `window.localStorage`;
 * on native it reads the in-memory cache populated by `hydrateStorageKeys`,
 * `readLocalJsonAsync`, or prior `writeLocalJson` calls.
 */
export function readLocalJson<T>(key: string, fallback: T): T {
  if (hasWebLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        memoryCache.set(key, raw);
        return parseJsonSafe(raw, fallback);
      }
      return fallback;
    } catch {
      return fallback;
    }
  }
  if (memoryCache.has(key)) {
    return parseJsonSafe(memoryCache.get(key), fallback);
  }
  return fallback;
}

/**
 * Writes JSON-encoded state immediately into the in-memory cache and persists
 * to `window.localStorage` on web or `AsyncStorage` on native.
 */
export function writeLocalJson(key: string, value: unknown): void {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return;
  }

  memoryCache.set(key, serialized);

  if (hasWebLocalStorage()) {
    try {
      window.localStorage.setItem(key, serialized);
    } catch {
      // Ignore storage quota or private-mode errors safely.
    }
    return;
  }

  if (Platform.OS !== "web") {
    void AsyncStorage.setItem(key, serialized).catch(() => {});
  }
}

/**
 * Asynchronously reads JSON-encoded state from `window.localStorage` on web or
 * `AsyncStorage` on native, updating the synchronous memory cache.
 */
export async function readLocalJsonAsync<T>(
  key: string,
  fallback: T,
): Promise<T> {
  if (hasWebLocalStorage()) {
    return readLocalJson(key, fallback);
  }

  if (memoryCache.has(key)) {
    return parseJsonSafe(memoryCache.get(key), fallback);
  }

  if (Platform.OS !== "web") {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw !== null) {
        memoryCache.set(key, raw);
        return parseJsonSafe(raw, fallback);
      }
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/**
 * Hydrates a batch of keys from `AsyncStorage` into the in-memory cache on native
 * so subsequent synchronous `readLocalJson` calls return persisted values.
 */
export async function hydrateStorageKeys(keys: string[]): Promise<void> {
  if (Platform.OS === "web" || keys.length === 0) {
    return;
  }

  const uncached = keys.filter((k) => !memoryCache.has(k));
  if (uncached.length === 0) {
    return;
  }

  const pending = (async () => {
    try {
      const entries = await AsyncStorage.getMany(uncached);
      for (const [key, value] of Object.entries(entries)) {
        if (value !== null && value !== undefined) {
          memoryCache.set(key, value);
        }
      }
    } catch {
      // Leave defaults in place if native storage fails.
    }
  })();

  hydrationPromise = pending;
  await pending;
}

export async function waitForStorageHydration(): Promise<void> {
  if (hydrationPromise) {
    await hydrationPromise;
  }
}

export function clearStorageMemoryCache(): void {
  memoryCache.clear();
  hydrationPromise = null;
}
