import * as Linking from "expo-linking";
import { Platform, Share } from "react-native";
import { trackFunnelMilestone } from "./attribution";

export type ShareOutcome = "shared" | "copied" | "failed";

/**
 * Builds a shareable deep link URL pointing to a specific lesson, track, or arena mode,
 * with optional referral / UTM attribution parameters.
 */
export function buildChallengeUrl(params?: {
  lessonId?: string;
  mode?: "bughunt" | "blitz" | "roadmap";
  track?: string;
  ref?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): string {
  const query = new URLSearchParams();
  if (params?.lessonId) query.set("lesson", params.lessonId);
  if (params?.mode) query.set("mode", params.mode);
  if (params?.track) query.set("track", params.track);
  if (params?.ref) query.set("ref", params.ref);
  if (params?.utmSource) query.set("utm_source", params.utmSource);
  if (params?.utmMedium) query.set("utm_medium", params.utmMedium);
  if (params?.utmCampaign) query.set("utm_campaign", params.utmCampaign);
  const qs = query.toString();

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const base = `${window.location.origin}${window.location.pathname}`;
    return qs ? `${base}?${qs}` : base;
  }

  const queryParams: Record<string, string> = {};
  if (params?.lessonId) queryParams.lesson = params.lessonId;
  if (params?.mode) queryParams.mode = params.mode;
  if (params?.track) queryParams.track = params.track;
  if (params?.ref) queryParams.ref = params.ref;
  if (params?.utmSource) queryParams.utm_source = params.utmSource;
  if (params?.utmMedium) queryParams.utm_medium = params.utmMedium;
  if (params?.utmCampaign) queryParams.utm_campaign = params.utmCampaign;

  return Linking.createURL("/", { queryParams });
}

/**
 * Opens the native OS share sheet where supported, or copies the challenge card
 * cleanly to the clipboard on desktop web browsers.
 */
export async function shareOrCopyText(options: {
  title?: string;
  message: string;
  channel?: string;
}): Promise<ShareOutcome> {
  const { title, message, channel } = options;

  const recordSuccess = (outcome: "shared" | "copied"): ShareOutcome => {
    trackFunnelMilestone("share_triggered", { channel });
    return outcome;
  };

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
        return recordSuccess("shared");
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
        return recordSuccess("copied");
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
        if (ok) return recordSuccess("copied");
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
    return recordSuccess("shared");
  } catch (_e) {
    return "failed";
  }
}
