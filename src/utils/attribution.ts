import {
  STORAGE_ATTRIBUTION_KEY,
  readLocalJson,
  writeLocalJson,
} from "../types/lesson";

export interface AttributionTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
  landing_path?: string;
  referrer_host?: string;
  captured_at: string;
}

export type FunnelMilestoneKey =
  | "landed_explore"
  | "landed_studio"
  | "explore_sandbox_run"
  | "first_code_run"
  | "first_lesson_solved"
  | "share_triggered"
  | "auth_prompt_opened"
  | "account_signed_up"
  | "paywall_viewed"
  | "pro_upgraded";

export interface AttributionProfile {
  firstTouch: AttributionTouch | null;
  lastTouch: AttributionTouch | null;
  milestones: Partial<Record<FunnelMilestoneKey, string>>;
  counts: {
    sessions: number;
    codeRuns: number;
    shares: number;
    paywallViews: number;
  };
  lastPaywallSource?: string;
  lastPlanAttempt?: string;
  lastShareChannel?: string;
  updatedAt: string;
}

const SESSION_COUNTED_KEY = "devlearn_session_counted_v1";

const DEFAULT_PROFILE: AttributionProfile = {
  firstTouch: null,
  lastTouch: null,
  milestones: {},
  counts: {
    sessions: 0,
    codeRuns: 0,
    shares: 0,
    paywallViews: 0,
  },
  updatedAt: "",
};

let memoryFallbackProfile: AttributionProfile | null = null;

function sanitizeTag(raw: unknown, maxLen = 80): string | undefined {
  if (Array.isArray(raw)) {
    return sanitizeTag(raw[0], maxLen);
  }
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

function readProfile(): AttributionProfile {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = readLocalJson<Partial<AttributionProfile>>(
      STORAGE_ATTRIBUTION_KEY,
      {},
    );
    return {
      firstTouch: stored.firstTouch ?? null,
      lastTouch: stored.lastTouch ?? null,
      milestones: stored.milestones ?? {},
      counts: {
        sessions: stored.counts?.sessions ?? 0,
        codeRuns: stored.counts?.codeRuns ?? 0,
        shares: stored.counts?.shares ?? 0,
        paywallViews: stored.counts?.paywallViews ?? 0,
      },
      lastPaywallSource: stored.lastPaywallSource,
      lastPlanAttempt: stored.lastPlanAttempt,
      lastShareChannel: stored.lastShareChannel,
      updatedAt: stored.updatedAt ?? "",
    };
  }
  return (
    memoryFallbackProfile ?? {
      ...DEFAULT_PROFILE,
      milestones: {},
      counts: { ...DEFAULT_PROFILE.counts },
    }
  );
}

function saveProfile(profile: AttributionProfile): AttributionProfile {
  memoryFallbackProfile = profile;
  writeLocalJson(STORAGE_ATTRIBUTION_KEY, profile);
  exposeAttributionDebugger();
  return profile;
}

function getExternalReferrerHost(): string | undefined {
  if (typeof document === "undefined" || !document.referrer) return undefined;
  try {
    const refUrl = new URL(document.referrer);
    if (
      typeof window !== "undefined" &&
      refUrl.host === window.location.host
    ) {
      return undefined;
    }
    return refUrl.host || undefined;
  } catch {
    return undefined;
  }
}

export function extractAttributionParams(
  searchParams?: Record<string, string | string[] | undefined>,
): Omit<AttributionTouch, "captured_at" | "landing_path" | "referrer_host"> {
  const fromQuery = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );

  const pick = (key: string) =>
    sanitizeTag(searchParams?.[key]) ?? sanitizeTag(fromQuery.get(key));

  const extracted: Omit<
    AttributionTouch,
    "captured_at" | "landing_path" | "referrer_host"
  > = {};

  const utmSource = pick("utm_source");
  const utmMedium = pick("utm_medium");
  const utmCampaign = pick("utm_campaign");
  const utmContent = pick("utm_content");
  const utmTerm = pick("utm_term");
  const ref = pick("ref");

  if (utmSource) extracted.utm_source = utmSource;
  if (utmMedium) extracted.utm_medium = utmMedium;
  if (utmCampaign) extracted.utm_campaign = utmCampaign;
  if (utmContent) extracted.utm_content = utmContent;
  if (utmTerm) extracted.utm_term = utmTerm;
  if (ref) extracted.ref = ref;

  return extracted;
}

function shouldCountNewSession(): boolean {
  if (typeof window === "undefined" || !window.sessionStorage) return false;
  try {
    if (window.sessionStorage.getItem(SESSION_COUNTED_KEY)) {
      return false;
    }
    window.sessionStorage.setItem(SESSION_COUNTED_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

/**
 * Captures UTM / referral attribution on landing without overwriting first-touch,
 * while updating last-touch whenever fresh campaign or referral params arrive.
 */
export function captureLandingAttribution(options?: {
  path?: string;
  searchParams?: Record<string, string | string[] | undefined>;
  milestone?: FunnelMilestoneKey;
}): AttributionProfile {
  const now = new Date().toISOString();
  const profile = readProfile();
  const params = extractAttributionParams(options?.searchParams);
  const referrerHost = getExternalReferrerHost();
  const landingPath =
    options?.path ??
    (typeof window !== "undefined" ? window.location.pathname : "/");

  const hasExplicitCampaign = Boolean(
    params.utm_source ||
      params.utm_medium ||
      params.utm_campaign ||
      params.utm_content ||
      params.utm_term ||
      params.ref,
  );

  if (hasExplicitCampaign || referrerHost || !profile.firstTouch) {
    const touch: AttributionTouch = {
      ...params,
      ...(params.utm_source
        ? {}
        : params.ref
          ? { utm_source: "referral", utm_medium: "share" }
          : referrerHost
            ? { utm_source: referrerHost, utm_medium: "referral" }
            : { utm_source: "direct", utm_medium: "organic" }),
      landing_path: landingPath,
      ...(referrerHost ? { referrer_host: referrerHost } : {}),
      captured_at: now,
    };

    if (!profile.firstTouch) {
      profile.firstTouch = touch;
    }
    if (hasExplicitCampaign || !profile.lastTouch) {
      profile.lastTouch = touch;
    }
  }

  if (shouldCountNewSession()) {
    profile.counts.sessions += 1;
  }

  if (options?.milestone && !profile.milestones[options.milestone]) {
    profile.milestones[options.milestone] = now;
  }

  profile.updatedAt = now;
  return saveProfile(profile);
}

/**
 * Records an idempotent funnel milestone and updates lightweight action counters.
 */
export function trackFunnelMilestone(
  milestone: FunnelMilestoneKey,
  meta?: {
    source?: string;
    plan?: string;
    channel?: string;
  },
): AttributionProfile {
  const now = new Date().toISOString();
  const profile = readProfile();

  if (!profile.milestones[milestone]) {
    profile.milestones[milestone] = now;
  }

  if (milestone === "first_code_run" || milestone === "explore_sandbox_run") {
    profile.counts.codeRuns += 1;
  } else if (milestone === "share_triggered") {
    profile.counts.shares += 1;
    if (meta?.channel) {
      profile.lastShareChannel = sanitizeTag(meta.channel, 40);
    }
  } else if (milestone === "paywall_viewed") {
    profile.counts.paywallViews += 1;
    if (meta?.source) {
      profile.lastPaywallSource = sanitizeTag(meta.source, 40);
    }
  } else if (milestone === "pro_upgraded" && meta?.plan) {
    profile.lastPlanAttempt = sanitizeTag(meta.plan, 32);
  }

  profile.updatedAt = now;
  return saveProfile(profile);
}

export function getAttributionSnapshot(): AttributionProfile {
  return readProfile();
}

/**
 * Builds a compact, schema-safe payload attached to Supabase Auth `user_metadata`
 * during account creation so acquisition channels persist across devices.
 */
export function getSupabaseSignupMetadata(): Record<string, unknown> {
  const profile = readProfile();
  const first = profile.firstTouch;
  const last = profile.lastTouch;

  return {
    attribution_source: first?.utm_source ?? "direct",
    attribution_medium: first?.utm_medium ?? "organic",
    attribution_campaign: first?.utm_campaign ?? null,
    attribution_ref: first?.ref ?? null,
    attribution_landing_path: first?.landing_path ?? "/",
    attribution_first_seen_at: first?.captured_at ?? null,
    last_touch_source: last?.utm_source ?? null,
    last_touch_ref: last?.ref ?? null,
    funnel_milestones: Object.keys(profile.milestones),
    sessions_before_signup: profile.counts.sessions,
  };
}

function exposeAttributionDebugger() {
  if (typeof window === "undefined") return;
  try {
    (window as any).__devlearnAttribution = {
      getSnapshot: getAttributionSnapshot,
      getSignupMetadata: getSupabaseSignupMetadata,
    };
  } catch {}
}
