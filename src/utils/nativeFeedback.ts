import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import type { SfxEffectId } from "./pcmWavSynth";
import { readLocalJson, readLocalJsonAsync, writeLocalJson } from "./storage";

export const STORAGE_HAPTICS_KEY = "devlearn_haptics_enabled_v1";

const NATIVE_SFX_SOURCES: Record<SfxEffectId, number> = {
  click: require("../../assets/sfx/click.wav"),
  success: require("../../assets/sfx/success.wav"),
  fanfare: require("../../assets/sfx/fanfare.wav"),
  error: require("../../assets/sfx/error.wav"),
  channel: require("../../assets/sfx/channel.wav"),
};

const NATIVE_SFX_VOLUMES: Record<SfxEffectId, number> = {
  click: 0.42,
  success: 0.68,
  fanfare: 0.74,
  error: 0.62,
  channel: 0.55,
};

const NATIVE_LOFI_SOURCE = require("../../assets/sfx/lofi-chillhop.wav");

let hapticsEnabled = true;
let audioModePromise: Promise<void> | null = null;
const playerCache: Partial<Record<SfxEffectId, AudioPlayer>> = {};
let lofiPlayer: AudioPlayer | null = null;

export function isNativeMobilePlatform(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}

export async function hydrateHapticsPreference(): Promise<boolean> {
  const saved = await readLocalJsonAsync<boolean>(STORAGE_HAPTICS_KEY, true);
  hapticsEnabled = saved !== false;
  return hapticsEnabled;
}

export function isHapticsEnabled(): boolean {
  hapticsEnabled =
    readLocalJson<boolean>(STORAGE_HAPTICS_KEY, hapticsEnabled) !== false;
  return hapticsEnabled;
}

export function setHapticsEnabled(next: boolean): void {
  hapticsEnabled = next;
  writeLocalJson(STORAGE_HAPTICS_KEY, next);
  if (next) {
    triggerHapticFeedback("click");
  }
}

export function ensureNativeAudioMode(): Promise<void> {
  if (!isNativeMobilePlatform()) {
    return Promise.resolve();
  }
  if (!audioModePromise) {
    audioModePromise = setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: "mixWithOthers",
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => {
      audioModePromise = null;
    });
  }
  return audioModePromise;
}

export function triggerHapticFeedback(id: SfxEffectId): void {
  if (!isNativeMobilePlatform() || !isHapticsEnabled()) {
    return;
  }
  try {
    switch (id) {
      case "click":
        void Haptics.selectionAsync().catch(() => {});
        break;
      case "channel":
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        break;
      case "success":
      case "fanfare":
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
        break;
      case "error":
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        ).catch(() => {});
        break;
    }
  } catch {
    // Ignore haptic errors on unsupported devices/simulators
  }
}

export function playNativeSfx(id: SfxEffectId): void {
  if (!isNativeMobilePlatform()) {
    return;
  }
  try {
    void ensureNativeAudioMode();
    let player = playerCache[id];
    if (!player) {
      player = createAudioPlayer(NATIVE_SFX_SOURCES[id]);
      player.volume = NATIVE_SFX_VOLUMES[id];
      playerCache[id] = player;
      player.play();
      return;
    }
    void player
      .seekTo(0)
      .then(() => {
        player?.play();
      })
      .catch(() => {
        player?.play();
      });
  } catch {
    // Ignore native playback errors gracefully
  }
}

export function startNativeLofi(): void {
  if (!isNativeMobilePlatform()) {
    return;
  }
  try {
    void ensureNativeAudioMode();
    if (!lofiPlayer) {
      lofiPlayer = createAudioPlayer(NATIVE_LOFI_SOURCE);
      lofiPlayer.loop = true;
      lofiPlayer.volume = 0.28;
    }
    lofiPlayer.play();
  } catch {
    // Ignore native lo-fi playback errors gracefully
  }
}

export function stopNativeLofi(): void {
  if (!isNativeMobilePlatform() || !lofiPlayer) {
    return;
  }
  try {
    lofiPlayer.pause();
  } catch {
    // Ignore native pause errors gracefully
  }
}
