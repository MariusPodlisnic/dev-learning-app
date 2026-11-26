import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { supabase } from "../../lib/supabase";
import type { PaywallPlanId } from "../components/PaywallModal";

export interface CheckoutStartResult {
  ok: boolean;
  checkoutUrl?: string;
  errorMessage?: string;
}

export interface BillingPortalResult {
  ok: boolean;
  portalUrl?: string;
  errorMessage?: string;
}

export interface WebhookEntitlementResolution {
  shouldUpdate: boolean;
  isPremium: boolean;
  proPlan: PaywallPlanId | null;
  subscriptionStatus: string;
}

export interface PolarWebhookHeaders {
  webhookId: string;
  webhookTimestamp: string;
  webhookSignature: string;
}

const MAX_WEBHOOK_DRIFT_SEC = 300;

export function buildCheckoutReturnUrl(params: {
  plan: PaywallPlanId;
  lessonId?: string;
}): string {
  const query = new URLSearchParams();
  query.set("checkout", "success");
  query.set("plan", params.plan);
  if (params.lessonId) {
    query.set("lesson", params.lessonId);
  }
  const qs = query.toString();

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}${window.location.pathname}?${qs}`;
  }

  return Linking.createURL("/", {
    queryParams: {
      checkout: "success",
      plan: params.plan,
      ...(params.lessonId ? { lesson: params.lessonId } : {}),
    },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array | null {
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) {
      out[i] = bin.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

async function computeHmacBase64(
  signedContent: string,
  secretBytes: Uint8Array,
): Promise<string> {
  const keyBytes = Uint8Array.from(secretBytes);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );
  return bytesToBase64(new Uint8Array(sigBuf));
}

/**
 * Verifies Polar Standard Webhooks headers (`webhook-id`, `webhook-timestamp`, `webhook-signature`).
 * Supports native Standard Webhooks `whsec_<base64>` secrets (Polar endpoints created on/after Sept 8, 2026)
 * as well as legacy literal UTF-8 `polar_whs_...` secrets.
 */
export async function verifyPolarWebhookSignature(
  rawBody: string,
  headers: PolarWebhookHeaders,
  secret: string,
  nowSec: number = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  const webhookId = headers.webhookId.trim();
  const webhookTimestamp = headers.webhookTimestamp.trim();
  const webhookSignature = headers.webhookSignature.trim();

  if (!rawBody || !webhookId || !webhookTimestamp || !webhookSignature || !secret) {
    return false;
  }
  if (typeof crypto === "undefined" || !crypto.subtle) return false;

  const tsNum = Number(webhookTimestamp);
  if (
    !Number.isFinite(tsNum) ||
    Math.abs(nowSec - tsNum) > MAX_WEBHOOK_DRIFT_SEC
  ) {
    return false;
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expectedSignatures: string[] = [];

  if (secret.startsWith("whsec_")) {
    const decoded = base64ToBytes(secret.slice("whsec_".length));
    if (decoded && decoded.length > 0) {
      expectedSignatures.push(await computeHmacBase64(signedContent, decoded));
    }
  }
  expectedSignatures.push(
    await computeHmacBase64(signedContent, new TextEncoder().encode(secret)),
  );

  const candidates = webhookSignature
    .split(/\s+/)
    .map((entry) => entry.split(","))
    .filter(([ver, val]) => ver === "v1" && Boolean(val))
    .map(([, val]) => val);

  return candidates.some((sig) =>
    expectedSignatures.some((expected) => timingSafeEqual(sig, expected)),
  );
}

/**
 * Pure deterministic entitlement resolver mirroring the server-side Polar webhook Edge Function.
 */
export function resolvePolarWebhookEntitlement(params: {
  eventType: string;
  status?: string;
  metaPlan?: string;
  productId?: string;
  endsAtIso?: string | null;
  nowMs?: number;
  alreadyLifetime?: boolean;
  knownProducts?: {
    monthly?: string;
    annual?: string;
    lifetime?: string;
  };
}): WebhookEntitlementResolution {
  const {
    eventType,
    status: rawStatus = "",
    metaPlan,
    productId,
    endsAtIso = null,
    nowMs = Date.now(),
    alreadyLifetime = false,
    knownProducts = {},
  } = params;

  const status = String(rawStatus || "").toLowerCase();
  const pId = String(productId || "");
  const inferredPlan: PaywallPlanId =
    metaPlan === "lifetime" ||
    (knownProducts.lifetime && pId === knownProducts.lifetime)
      ? "lifetime"
      : metaPlan === "annual" ||
          (knownProducts.annual && pId === knownProducts.annual)
        ? "annual"
        : metaPlan === "monthly" ||
            (knownProducts.monthly && pId === knownProducts.monthly)
          ? "monthly"
          : "annual";

  if (eventType === "order.paid") {
    if (inferredPlan === "lifetime") {
      return {
        shouldUpdate: true,
        isPremium: true,
        proPlan: "lifetime",
        subscriptionStatus: "lifetime",
      };
    }
    return {
      shouldUpdate: false,
      isPremium: alreadyLifetime,
      proPlan: alreadyLifetime ? "lifetime" : null,
      subscriptionStatus: status || "paid",
    };
  }

  if (eventType === "order.refunded") {
    return {
      shouldUpdate: true,
      isPremium: false,
      proPlan: inferredPlan,
      subscriptionStatus: "refunded",
    };
  }

  const subEvents = new Set([
    "subscription.created",
    "subscription.updated",
    "subscription.active",
    "subscription.canceled",
    "subscription.uncanceled",
    "subscription.revoked",
  ]);
  if (subEvents.has(eventType)) {
    if (alreadyLifetime) {
      return {
        shouldUpdate: false,
        isPremium: true,
        proPlan: "lifetime",
        subscriptionStatus: "lifetime",
      };
    }
    const endsAtMs = endsAtIso ? new Date(endsAtIso).getTime() : null;
    const stillInGrace =
      (status === "canceled" || eventType === "subscription.canceled") &&
      endsAtMs !== null &&
      endsAtMs > nowMs;
    const isPro =
      eventType === "subscription.revoked" || status === "revoked"
        ? false
        : eventType === "subscription.active" ||
          status === "active" ||
          status === "trialing" ||
          status === "past_due" ||
          stillInGrace;

    return {
      shouldUpdate: true,
      isPremium: isPro,
      proPlan: inferredPlan,
      subscriptionStatus:
        eventType === "subscription.revoked"
          ? "revoked"
          : status || eventType.replace("subscription.", ""),
    };
  }

  return {
    shouldUpdate: false,
    isPremium: alreadyLifetime,
    proPlan: alreadyLifetime ? "lifetime" : null,
    subscriptionStatus: status,
  };
}

async function extractFunctionErrorMessage(
  error: any,
  data: any,
  fallback: string,
): Promise<string> {
  if (typeof data?.error === "string" && data.error.trim().length > 0) {
    return data.error;
  }
  const ctx = error?.context;
  if (ctx && typeof ctx.clone === "function") {
    try {
      const parsed = await ctx.clone().json();
      if (typeof parsed?.error === "string" && parsed.error.trim().length > 0) {
        return parsed.error;
      }
      if (
        typeof parsed?.message === "string" &&
        parsed.message.trim().length > 0
      ) {
        return parsed.message;
      }
    } catch {
      try {
        const text = await ctx.clone().text();
        if (text && text.trim().length > 0) {
          return text.trim().slice(0, 180);
        }
      } catch {
        // ignore body read errors
      }
    }
  }
  return error?.message || fallback;
}

/**
 * Invokes the authenticated Supabase Edge Function to create a Polar hosted checkout session
 * and navigates the user directly to Polar checkout.
 */
export async function startPolarCheckout(params: {
  plan: PaywallPlanId;
  lessonId?: string;
}): Promise<CheckoutStartResult> {
  const returnUrl = buildCheckoutReturnUrl(params);

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      return {
        ok: false,
        errorMessage: "Please sign in first to start Polar checkout.",
      };
    }

    const { data, error } = await supabase.functions.invoke(
      "create-polar-checkout",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          plan: params.plan,
          returnUrl,
          lessonId: params.lessonId,
        },
      },
    );

    if (error) {
      return {
        ok: false,
        errorMessage: await extractFunctionErrorMessage(
          error,
          data,
          "Unable to reach Devy billing checkout right now. Please try again in a moment.",
        ),
      };
    }

    const checkoutUrl =
      typeof data?.checkoutUrl === "string" ? data.checkoutUrl : "";
    if (!checkoutUrl) {
      return {
        ok: false,
        errorMessage:
          data?.error ||
          "Checkout link could not be generated. Ensure Polar secrets are configured in Supabase.",
      };
    }

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.assign(checkoutUrl);
    } else {
      await Linking.openURL(checkoutUrl);
    }

    return { ok: true, checkoutUrl };
  } catch (err: any) {
    return {
      ok: false,
      errorMessage:
        err?.message ||
        "Network error starting checkout. Please check your connection and retry.",
    };
  }
}

/**
 * Opens a pre-authenticated Polar Customer Billing Portal session
 * (cancel subscription, update card, download VAT invoices).
 */
export async function openPolarBillingPortal(): Promise<BillingPortalResult> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      return {
        ok: false,
        errorMessage: "Please sign in to open your billing portal.",
      };
    }

    const { data, error } = await supabase.functions.invoke(
      "create-polar-checkout",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: { action: "portal" },
      },
    );

    if (error || !data?.portalUrl) {
      return {
        ok: false,
        errorMessage: await extractFunctionErrorMessage(
          error,
          data,
          "Billing portal is available after completing a Polar purchase.",
        ),
      };
    }

    const portalUrl = String(data.portalUrl);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(portalUrl, "_blank", "noopener,noreferrer");
    } else {
      await Linking.openURL(portalUrl);
    }
    return { ok: true, portalUrl };
  } catch (err: any) {
    return {
      ok: false,
      errorMessage: err?.message || "Unable to open billing portal.",
    };
  }
}

/**
 * Verifies a completed Polar checkout directly server-side (instant unlock fallback)
 * and polls public.profiles.is_premium until Pro is active.
 */
export async function verifyPolarCheckoutUnlock(
  checkoutId?: string,
): Promise<boolean> {
  if (!checkoutId || checkoutId.includes("{")) return false;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) return false;
    const { data, error } = await supabase.functions.invoke(
      "create-polar-checkout",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: { action: "verify", checkoutId },
      },
    );
    if (error) {
      console.warn("Polar checkout verify warning:", error.message);
      return false;
    }
    if (!data?.unlocked) {
      console.warn("Polar checkout verify pending:", data);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Polls public.profiles.is_premium after returning from Polar checkout
 * so the app unlocks Pro seamlessly as soon as the webhook commits.
 */
export async function pollProfilePremiumUnlock(
  userId: string,
  maxAttempts = 8,
  delayMs = 1500,
  checkoutId?: string,
): Promise<boolean> {
  if (checkoutId) {
    const verified = await verifyPolarCheckoutUnlock(checkoutId);
    if (verified) return true;
  }
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", userId)
      .maybeSingle();

    if (data?.is_premium) {
      return true;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}
