import test from "node:test";
import assert from "node:assert/strict";
import {
  getMockAsyncStorageStore,
  loadTsModule,
  setMockPlatformOS,
} from "./helpers/loadTs.mjs";

const storage = loadTsModule("src/utils/storage.ts");

test("native storage reads fall back cleanly before hydration and read AsyncStorage after hydration", async () => {
  setMockPlatformOS("ios");
  storage.clearStorageMemoryCache();
  const asyncStore = getMockAsyncStorageStore();
  asyncStore.clear();
  asyncStore.set("devlearn_state_v1", JSON.stringify({ xp: 240, streak: 4 }));
  asyncStore.set("devlearn_sound_enabled_v1", "false");

  // Synchronous read before hydration safely returns fallback
  assert.deepEqual(storage.readLocalJson("devlearn_state_v1", { xp: 0 }), {
    xp: 0,
  });

  await storage.hydrateStorageKeys([
    "devlearn_state_v1",
    "devlearn_sound_enabled_v1",
    "missing_key",
  ]);

  assert.deepEqual(storage.readLocalJson("devlearn_state_v1", { xp: 0 }), {
    xp: 240,
    streak: 4,
  });
  assert.equal(storage.readLocalJson("devlearn_sound_enabled_v1", true), false);
  assert.equal(storage.readLocalJson("missing_key", "fallback"), "fallback");

  setMockPlatformOS("web");
  storage.clearStorageMemoryCache();
});

test("writeLocalJson updates memory cache immediately and persists asynchronously to AsyncStorage on native", async () => {
  setMockPlatformOS("android");
  storage.clearStorageMemoryCache();
  const asyncStore = getMockAsyncStorageStore();
  asyncStore.clear();

  storage.writeLocalJson("devlearn_code_drafts_v2", { "exp-1": "def f(): pass" });

  // Immediate sync read returns updated memory value
  assert.deepEqual(storage.readLocalJson("devlearn_code_drafts_v2", {}), {
    "exp-1": "def f(): pass",
  });

  // Allow microtask AsyncStorage.setItem to settle
  await Promise.resolve();
  assert.equal(
    asyncStore.get("devlearn_code_drafts_v2"),
    JSON.stringify({ "exp-1": "def f(): pass" }),
  );

  storage.clearStorageMemoryCache();
  // Read back async from AsyncStorage after clearing memory cache
  const restored = await storage.readLocalJsonAsync("devlearn_code_drafts_v2", {});
  assert.deepEqual(restored, { "exp-1": "def f(): pass" });

  setMockPlatformOS("web");
  storage.clearStorageMemoryCache();
});

test("corrupted JSON values safely return the supplied fallback", async () => {
  setMockPlatformOS("ios");
  storage.clearStorageMemoryCache();
  const asyncStore = getMockAsyncStorageStore();
  asyncStore.clear();
  asyncStore.set("broken_json_key", "{not-valid-json");

  const value = await storage.readLocalJsonAsync("broken_json_key", { ok: true });
  assert.deepEqual(value, { ok: true });

  setMockPlatformOS("web");
  storage.clearStorageMemoryCache();
});
