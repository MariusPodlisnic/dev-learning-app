export interface ParsedAuthCallbackParams {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
  type?: string;
  error?: string;
}

/**
 * Extracts Supabase OAuth / password recovery tokens or errors from either
 * the query string (`?code=...`) or URL fragment (`#access_token=...`).
 */
export function parseAuthCallbackParams(
  callbackUrl: string,
): ParsedAuthCallbackParams {
  if (!callbackUrl || typeof callbackUrl !== "string") {
    return {};
  }

  let searchParams = new URLSearchParams();
  let hashParams = new URLSearchParams();

  try {
    const parsed = new URL(callbackUrl);
    searchParams = parsed.searchParams;
    const rawHash = parsed.hash.startsWith("#")
      ? parsed.hash.slice(1)
      : parsed.hash;
    if (rawHash) {
      hashParams = new URLSearchParams(rawHash);
    }
  } catch {
    const [beforeHash, afterHash = ""] = callbackUrl.split("#");
    const qIdx = beforeHash.indexOf("?");
    if (qIdx !== -1) {
      searchParams = new URLSearchParams(beforeHash.slice(qIdx + 1));
    }
    if (afterHash) {
      hashParams = new URLSearchParams(afterHash);
    }
  }

  const pick = (key: string): string | undefined => {
    const val = hashParams.get(key) ?? searchParams.get(key);
    return val && val.trim().length > 0 ? val : undefined;
  };

  return {
    code: pick("code"),
    accessToken: pick("access_token"),
    refreshToken: pick("refresh_token"),
    type: pick("type"),
    error: pick("error_description") ?? pick("error"),
  };
}

/**
 * Generates a clear reassurance notice explaining how local guest progress
 * merges with a cloud profile on Sign Up or Sign In.
 */
export function buildGuestMergeNotice({
  guestXp,
  guestSolvedCount,
  mode,
}: {
  guestXp: number;
  guestSolvedCount: number;
  mode: "signup" | "signin" | "forgot" | "update_password";
}): string | null {
  if (mode !== "signup" && mode !== "signin") {
    return null;
  }
  const hasProgress = guestXp > 0 || guestSolvedCount > 0;
  if (!hasProgress) {
    return null;
  }
  const xpLabel = `${guestXp.toLocaleString()} XP`;
  const solvedLabel = `${guestSolvedCount} solved ${guestSolvedCount === 1 ? "module" : "modules"}`;

  if (mode === "signup") {
    return `Your local ${xpLabel} & ${solvedLabel} will sync to your new cloud profile automatically.`;
  }
  return `Your local ${xpLabel} & ${solvedLabel} will safely merge with your cloud account—higher progress is always kept.`;
}

/**
 * Builds a concise confirmation message after cloud sync merges guest & account data.
 */
export function buildCloudSyncFeedback({
  mergedXp,
  mergedSolvedCount,
  hadGuestProgress,
}: {
  mergedXp: number;
  mergedSolvedCount: number;
  hadGuestProgress: boolean;
}): string {
  const xpLabel = `${mergedXp.toLocaleString()} XP`;
  const solvedLabel = `${mergedSolvedCount} solved ${mergedSolvedCount === 1 ? "module" : "modules"}`;
  if (hadGuestProgress) {
    return `Guest progress merged & synced (${xpLabel} · ${solvedLabel})`;
  }
  return `Cloud profile synced (${xpLabel} · ${solvedLabel})`;
}
