import * as Linking from "expo-linking";
import { Platform, Share } from "react-native";

export type ShareOutcome = "shared" | "copied" | "failed";

/**
 * Builds a shareable deep link URL pointing to a specific lesson, track, or arena mode.
 */
export function buildChallengeUrl(params?: {
  lessonId?: string;
  mode?: "bughunt" | "blitz" | "roadmap";
  track?: string;
}): string {
  const query = new URLSearchParams();
  if (params?.lessonId) query.set("lesson", params.lessonId);
  if (params?.mode) query.set("mode", params.mode);
  if (params?.track) query.set("track", params.track);
  const qs = query.toString();

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const base = `${window.location.origin}${window.location.pathname}`;
    return qs ? `${base}?${qs}` : base;
  }

  const queryParams: Record<string, string> = {};
  if (params?.lessonId) queryParams.lesson = params.lessonId;
  if (params?.mode) queryParams.mode = params.mode;
  if (params?.track) queryParams.track = params.track;

  return Linking.createURL("/", { queryParams });
}

/**
 * Opens the native OS share sheet where supported, or copies the challenge card
 * cleanly to the clipboard on desktop web browsers.
 */
export async function shareOrCopyText(options: {
  title?: string;
  message: string;
}): Promise<ShareOutcome> {
  const { title, message } = options;

  if (Platform.OS === "web") {
    // Prefer Clipboard API on desktop browsers for instant 1-click Wordle-style sharing,
    // or Web Share API on touch devices if available.
    const isTouchWeb =
      typeof navigator !== "undefined" &&
      ("maxTouchPoints" in navigator ? navigator.maxTouchPoints > 0 : false);

    if (
      isTouchWeb &&
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({ title: title || "DevLearn", text: message });
        return "shared";
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return "failed";
        }
      }
    }

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(message);
        return "copied";
      }
    } catch (_e) {}

    if (typeof document !== "undefined") {
      try {
        const el = document.createElement("textarea");
        el.value = message;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(el);
        if (ok) return "copied";
      } catch (_e) {}
    }

    return "failed";
  }

  try {
    const res = await Share.share({
      title: title || "DevLearn",
      message,
    });
    if (res.action === Share.dismissedAction) {
      return "failed";
    }
    return "shared";
  } catch (_e) {
    return "failed";
  }
}
