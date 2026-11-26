// Supabase Edge Function: polar-webhook
// Verifies Polar Standard Webhooks headers (webhook-id, webhook-timestamp, webhook-signature)
// and updates public.profiles using SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const MAX_TIMESTAMP_DRIFT_SEC = 300; // 5 minutes replay window

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
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );
  return bytesToBase64(new Uint8Array(sig));
}

async function verifyPolarSignature(
  rawBody: string,
  headers: Headers,
  secret: string,
): Promise<{ ok: boolean; webhookId: string }> {
  const webhookId = (headers.get("webhook-id") || "").trim();
  const webhookTimestamp = (headers.get("webhook-timestamp") || "").trim();
  const signatureHeader = (headers.get("webhook-signature") || "").trim();

  if (!webhookId || !webhookTimestamp || !signatureHeader || !secret) {
    return { ok: false, webhookId };
  }

  const tsNum = Number(webhookTimestamp);
  const nowSec = Math.floor(Date.now() / 1000);
  if (
    !Number.isFinite(tsNum) ||
    Math.abs(nowSec - tsNum) > MAX_TIMESTAMP_DRIFT_SEC
  ) {
    return { ok: false, webhookId };
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expectedSignatures: string[] = [];

  // Native Standard Webhooks (Polar secrets created on/after Sept 8, 2026: whsec_<base64>)
  if (secret.startsWith("whsec_")) {
    const decoded = base64ToBytes(secret.slice("whsec_".length));
    if (decoded && decoded.length > 0) {
      expectedSignatures.push(await computeHmacBase64(signedContent, decoded));
    }
  }
  // Legacy Polar UTF-8 signing fallback (polar_whs_... or literal UTF-8 secret)
  expectedSignatures.push(
    await computeHmacBase64(signedContent, new TextEncoder().encode(secret)),
  );

  const candidateSignatures = signatureHeader
    .split(/\s+/)
    .map((entry) => entry.split(","))
    .filter(([ver, val]) => ver === "v1" && Boolean(val))
    .map(([, val]) => val);

  const matched = candidateSignatures.some((sig) =>
    expectedSignatures.some((expected) => timingSafeEqual(sig, expected)),
  );
  return { ok: matched, webhookId };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const lifetimeProductId = Deno.env.get("POLAR_PRODUCT_LIFETIME") || "";
  const annualProductId = Deno.env.get("POLAR_PRODUCT_ANNUAL") || "";
  const monthlyProductId = Deno.env.get("POLAR_PRODUCT_MONTHLY") || "";

  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response("Webhook secrets not configured", { status: 503 });
  }

  const rawBody = await req.text();
  const { ok: isValid, webhookId } = await verifyPolarSignature(
    rawBody,
    req.headers,
    webhookSecret,
  );
  if (!isValid) {
    console.error("Polar webhook signature rejected", {
      webhookId,
      hasSecret: Boolean(webhookSecret),
      secretPrefix: webhookSecret.slice(0, 6),
    });
    return new Response("Invalid webhook signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const eventType = String(event?.type || "");
  const data = event?.data || {};
  const metadata = data?.metadata || {};
  const customer = data?.customer || {};

  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Deduplicate by Standard Webhooks delivery ID
  const { data: existingEvent } = await admin
    .from("billing_webhook_events")
    .select("event_id")
    .eq("event_id", webhookId)
    .maybeSingle();

  if (existingEvent) {
    return new Response(JSON.stringify({ ok: true, duplicate: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Resolve user ID via external_customer_id -> metadata.user_id -> polar_customer_id -> email
  let resolvedUserId =
    (typeof customer?.external_id === "string" && customer.external_id) ||
    (typeof data?.external_customer_id === "string" &&
      data.external_customer_id) ||
    (typeof metadata?.user_id === "string" && metadata.user_id) ||
    "";

  const polarCustomerId = String(data?.customer_id || customer?.id || "");
  const customerEmail = String(customer?.email || data?.email || "");

  if (!resolvedUserId && polarCustomerId) {
    const { data: byCust } = await admin
      .from("profiles")
      .select("id")
      .eq("polar_customer_id", polarCustomerId)
      .maybeSingle();
    if (byCust?.id) resolvedUserId = byCust.id;
  }
  if (!resolvedUserId && customerEmail) {
    const { data: byEmail } = await admin
      .from("profiles")
      .select("id")
      .eq("email", customerEmail)
      .maybeSingle();
    if (byEmail?.id) resolvedUserId = byEmail.id;
  }

  await admin.from("billing_webhook_events").insert({
    event_id: webhookId,
    provider: "polar",
    event_name: eventType,
    user_id: resolvedUserId || null,
    payload: event,
  });

  if (!resolvedUserId) {
    return new Response(
      JSON.stringify({ ok: true, ignored: "No matching user_id" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("pro_plan, subscription_status")
    .eq("id", resolvedUserId)
    .maybeSingle();

  const alreadyLifetime =
    existingProfile?.pro_plan === "lifetime" &&
    existingProfile?.subscription_status === "lifetime";

  const productId = String(
    data?.product_id ||
      data?.product?.id ||
      data?.items?.[0]?.product_id ||
      data?.items?.[0]?.product?.id ||
      "",
  );
  const metaPlan = typeof metadata?.plan === "string" ? metadata.plan : "";
  const inferredPlan =
    metaPlan === "lifetime" ||
    (lifetimeProductId && productId === lifetimeProductId)
      ? "lifetime"
      : metaPlan === "annual" ||
          (annualProductId && productId === annualProductId)
        ? "annual"
        : metaPlan === "monthly" ||
            (monthlyProductId && productId === monthlyProductId)
          ? "monthly"
          : existingProfile?.pro_plan || "annual";

  const status = String(data?.status || "").toLowerCase();
  const nowIso = new Date().toISOString();
  let profilePatch: Record<string, unknown> | null = null;

  if (eventType === "order.paid") {
    if (inferredPlan === "lifetime") {
      profilePatch = {
        is_premium: true,
        pro_plan: "lifetime",
        subscription_status: "lifetime",
        polar_customer_id: polarCustomerId || undefined,
        polar_order_id: data?.id ? String(data.id) : undefined,
        pro_renews_at: null,
        pro_ends_at: null,
        pro_updated_at: nowIso,
      };
    }
  } else if (eventType === "order.refunded") {
    profilePatch = {
      is_premium: false,
      subscription_status: "refunded",
      pro_updated_at: nowIso,
    };
  } else if (
    eventType === "subscription.created" ||
    eventType === "subscription.updated" ||
    eventType === "subscription.active" ||
    eventType === "subscription.canceled" ||
    eventType === "subscription.uncanceled" ||
    eventType === "subscription.revoked"
  ) {
    if (!alreadyLifetime) {
      const endsAtIso = data?.ends_at || data?.current_period_end || null;
      const endsAtMs = endsAtIso ? new Date(endsAtIso).getTime() : null;
      const stillInGrace =
        (status === "canceled" || eventType === "subscription.canceled") &&
        endsAtMs !== null &&
        endsAtMs > Date.now();
      const isPro =
        eventType === "subscription.revoked" || status === "revoked"
          ? false
          : eventType === "subscription.active" ||
            status === "active" ||
            status === "trialing" ||
            status === "past_due" ||
            stillInGrace;

      profilePatch = {
        is_premium: isPro,
        pro_plan: inferredPlan,
        subscription_status:
          eventType === "subscription.revoked"
            ? "revoked"
            : status || eventType.replace("subscription.", ""),
        polar_customer_id: polarCustomerId || undefined,
        polar_subscription_id: data?.id ? String(data.id) : undefined,
        pro_renews_at: data?.current_period_end || null,
        pro_ends_at: endsAtIso,
        pro_updated_at: nowIso,
      };
    }
  }

  if (profilePatch) {
    const cleanPatch = Object.fromEntries(
      Object.entries(profilePatch).filter(([, v]) => v !== undefined),
    );
    const { error: upsertErr } = await admin.from("profiles").upsert({
      id: resolvedUserId,
      email: customerEmail || undefined,
      ...cleanPatch,
    });
    if (upsertErr) {
      console.error("Failed updating profile entitlement:", upsertErr);
      return new Response("Database update failed", { status: 500 });
    }
  }

  return new Response(
    JSON.stringify({ ok: true, eventType, userId: resolvedUserId }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
