// Supabase Edge Function: create-polar-checkout
// Creates a hosted Polar.sh Checkout URL (monthly / annual / lifetime)
// or returns a pre-authenticated Polar Customer Portal URL for Pro subscribers.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PlanId = "monthly" | "annual" | "lifetime";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

function sanitizeReturnUrl(rawUrl: unknown, fallbackUrl: string): string {
  if (typeof rawUrl === "string" && rawUrl.trim().length > 0) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.toString();
      }
    } catch {
      // Fall back to configured app URL
    }
  }
  return fallbackUrl;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const polarToken = Deno.env.get("POLAR_ACCESS_TOKEN") || "";
  const polarServer = (Deno.env.get("POLAR_SERVER") || "production").toLowerCase();
  const appBaseUrl = Deno.env.get("DEVY_APP_URL") || "https://devy.app";

  const polarApiBase =
    polarServer === "sandbox"
      ? "https://sandbox-api.polar.sh"
      : "https://api.polar.sh";

  if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey) || !polarToken) {
    return jsonResponse(
      {
        error:
          "Polar billing secrets are not configured yet (POLAR_ACCESS_TOKEN).",
      },
      503,
    );
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing user authentication token." }, 401);
  }
  const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!accessToken) {
    return jsonResponse({ error: "Missing user authentication token." }, 401);
  }

  // Verify the caller's Supabase JWT directly via Auth API (works with both legacy HS256 and modern ES256 keys)
  const authClient = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey,
  );
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(accessToken);

  if (userError || !user) {
    return jsonResponse(
      {
        error:
          userError?.message ||
          "Invalid or expired user session. Please sign in again.",
      },
      401,
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid JSON request body." }, 400);
  }

  // Action 1: Instant server-side verification of a completed Polar checkout
  // (self-heals immediately on redirect even if the async webhook is still in flight)
  if (body.action === "verify") {
    const checkoutId =
      typeof body.checkoutId === "string" ? body.checkoutId.trim() : "";
    if (!checkoutId || checkoutId.includes("{")) {
      return jsonResponse({ unlocked: false, reason: "Missing checkoutId" }, 200);
    }

    const checkRes = await fetch(
      `${polarApiBase}/v1/checkouts/${encodeURIComponent(checkoutId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${polarToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!checkRes.ok) {
      return jsonResponse({ unlocked: false, reason: `Polar ${checkRes.status}` }, 200);
    }

    const checkout = (await checkRes.json()) as any;
    const status = String(checkout?.status || "").toLowerCase();
    const ownerId =
      (typeof checkout?.external_customer_id === "string" &&
        checkout.external_customer_id) ||
      (typeof checkout?.customer_external_id === "string" &&
        checkout.customer_external_id) ||
      (typeof checkout?.metadata?.user_id === "string" &&
        checkout.metadata.user_id) ||
      "";
    const emailMatches =
      Boolean(user.email) &&
      typeof checkout?.customer_email === "string" &&
      checkout.customer_email.toLowerCase() === user.email.toLowerCase();

    const isPaidStatus = status === "succeeded" || status === "confirmed";
    const isOwner = ownerId === user.id || (!ownerId && emailMatches);

    if (!isPaidStatus || !isOwner) {
      console.warn("Polar verify not ready:", {
        checkoutId,
        status,
        ownerId,
        userId: user.id,
        emailMatches,
      });
      return jsonResponse({ unlocked: false, status, ownerMatch: isOwner }, 200);
    }

    const lifetimeProductId = Deno.env.get("POLAR_PRODUCT_LIFETIME") || "";
    const annualProductId = Deno.env.get("POLAR_PRODUCT_ANNUAL") || "";
    const monthlyProductId = Deno.env.get("POLAR_PRODUCT_MONTHLY") || "";
    const metaPlan =
      typeof checkout?.metadata?.plan === "string" ? checkout.metadata.plan : "";
    const productId = String(checkout?.product_id || checkout?.product?.id || "");
    const resolvedPlan: PlanId =
      metaPlan === "lifetime" || (lifetimeProductId && productId === lifetimeProductId)
        ? "lifetime"
        : metaPlan === "annual" || (annualProductId && productId === annualProductId)
          ? "annual"
          : metaPlan === "monthly" || (monthlyProductId && productId === monthlyProductId)
            ? "monthly"
            : "annual";

    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
    );
    const nowIso = new Date().toISOString();
    const { error: upsertErr } = await adminClient.from("profiles").upsert({
      id: user.id,
      email: user.email || checkout?.customer_email || undefined,
      is_premium: true,
      pro_plan: resolvedPlan,
      subscription_status: resolvedPlan === "lifetime" ? "lifetime" : "active",
      polar_customer_id: checkout?.customer_id
        ? String(checkout.customer_id)
        : undefined,
      pro_updated_at: nowIso,
    });

    if (upsertErr) {
      console.error("Failed persisting verified checkout:", upsertErr);
      return jsonResponse({ unlocked: false, error: upsertErr.message }, 500);
    }

    return jsonResponse({ unlocked: true, plan: resolvedPlan }, 200);
  }

  // Action 2: Pre-authenticated Polar Customer Billing Portal
  if (body.action === "portal") {
    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
    );
    const { data: profile } = await adminClient
      .from("profiles")
      .select("polar_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    const sessionBody = profile?.polar_customer_id
      ? { customer_id: String(profile.polar_customer_id) }
      : { external_customer_id: user.id };

    const portalRes = await fetch(`${polarApiBase}/v1/customer-sessions/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${polarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionBody),
    });

    if (!portalRes.ok) {
      return jsonResponse(
        {
          error:
            "Billing portal is available after completing a Polar purchase.",
        },
        404,
      );
    }

    const portalJson = (await portalRes.json()) as any;
    const portalUrl = portalJson?.customer_portal_url;
    if (!portalUrl) {
      return jsonResponse(
        { error: "Customer portal URL is unavailable for this account." },
        404,
      );
    }

    return jsonResponse({ portalUrl });
  }

  // Action 2: Create Hosted Polar Checkout Session (Monthly / Annual / Lifetime)
  const plan = body.plan as PlanId;
  const productMap: Record<PlanId, string> = {
    monthly: Deno.env.get("POLAR_PRODUCT_MONTHLY") || "",
    annual: Deno.env.get("POLAR_PRODUCT_ANNUAL") || "",
    lifetime: Deno.env.get("POLAR_PRODUCT_LIFETIME") || "",
  };

  if (!plan || !(plan in productMap)) {
    return jsonResponse(
      { error: "Plan must be one of: monthly, annual, lifetime." },
      400,
    );
  }

  const productId = productMap[plan];
  if (!productId) {
    return jsonResponse(
      {
        error: `Polar product ID is not configured for plan "${plan}".`,
      },
      503,
    );
  }

  const baseSuccessUrl = sanitizeReturnUrl(
    body.returnUrl,
    `${appBaseUrl}/?checkout=success&plan=${plan}`,
  );
  const successUrl = baseSuccessUrl.includes("checkout_id=")
    ? baseSuccessUrl
    : `${baseSuccessUrl}${baseSuccessUrl.includes("?") ? "&" : "?"}checkout_id={CHECKOUT_ID}`;

  const checkoutPayload: Record<string, unknown> = {
    products: [productId],
    external_customer_id: user.id,
    customer_email: user.email || undefined,
    success_url: successUrl,
    metadata: {
      user_id: user.id,
      plan,
    },
  };

  const polarRes = await fetch(`${polarApiBase}/v1/checkouts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${polarToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(checkoutPayload),
  });

  if (!polarRes.ok) {
    const errText = await polarRes.text().catch(() => "");
    console.error("Polar checkout creation failed:", polarRes.status, errText);
    return jsonResponse(
      {
        error: `Polar checkout error (${polarRes.status}): ${errText.slice(0, 180) || "Check product ID & token."}`,
      },
      502,
    );
  }

  const polarJson = (await polarRes.json()) as any;
  const checkoutUrl = polarJson?.url;
  if (!checkoutUrl) {
    return jsonResponse(
      { error: "Polar returned no checkout URL." },
      502,
    );
  }

  return jsonResponse({ checkoutUrl, plan });
});
