import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { loadTsModule } from "./helpers/loadTs.mjs";

const {
  buildCheckoutReturnUrl,
  resolvePolarWebhookEntitlement,
  verifyPolarWebhookSignature,
} = loadTsModule("src/utils/billing.ts");

function signPolarLegacyEvent(secret, webhookId, webhookTimestamp, rawBody) {
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const sig = createHmac("sha256", secret)
    .update(signedContent)
    .digest("base64");
  return `v1,${sig}`;
}

function signStandardWebhookEvent(whsecSecret, webhookId, webhookTimestamp, rawBody) {
  const rawB64 = whsecSecret.slice("whsec_".length);
  const bin = atob(rawB64);
  const keyBytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const sig = createHmac("sha256", keyBytes)
    .update(signedContent)
    .digest("base64");
  return `v1,${sig}`;
}

test("billing builds clean checkout return URLs with plan and optional lessonId", () => {
  const url = buildCheckoutReturnUrl({ plan: "annual", lessonId: "exp-alg-01" });
  assert.ok(url.includes("checkout=success"));
  assert.ok(url.includes("plan=annual"));
  assert.ok(url.includes("lesson=exp-alg-01"));

  const lifetimeUrl = buildCheckoutReturnUrl({ plan: "lifetime" });
  assert.ok(lifetimeUrl.includes("plan=lifetime"));
  assert.ok(!lifetimeUrl.includes("lesson="));
});

test("verifyPolarWebhookSignature validates Standard Webhooks (whsec_ base64 & legacy UTF-8) and rejects tampering/replay", async () => {
  const whsecSecret = "whsec_ZGV2eV90ZXN0X3NlY3JldF9rZXlfMTIzNDU2Nzg5MA==";
  const legacySecret = "polar_whs_devy_test_secret_123456";
  const webhookId = "msg_01JDEVYPOLAR001";
  const nowSec = 1795630000;
  const webhookTimestamp = String(nowSec - 15);
  const body = JSON.stringify({
    type: "order.paid",
    data: { id: "ord_99", product_id: "prod_lifetime" },
  });
  const validWhsecSig = signStandardWebhookEvent(
    whsecSecret,
    webhookId,
    webhookTimestamp,
    body,
  );
  const validLegacySig = signPolarLegacyEvent(
    legacySecret,
    webhookId,
    webhookTimestamp,
    body,
  );

  assert.equal(
    await verifyPolarWebhookSignature(
      body,
      { webhookId, webhookTimestamp, webhookSignature: validWhsecSig },
      whsecSecret,
      nowSec,
    ),
    true,
  );

  assert.equal(
    await verifyPolarWebhookSignature(
      body,
      { webhookId, webhookTimestamp, webhookSignature: validLegacySig },
      legacySecret,
      nowSec,
    ),
    true,
  );

  // Supports multiple space-delimited signatures (secret rotation)
  assert.equal(
    await verifyPolarWebhookSignature(
      body,
      {
        webhookId,
        webhookTimestamp,
        webhookSignature: `v1,invalidBase64== ${validWhsecSig}`,
      },
      whsecSecret,
      nowSec,
    ),
    true,
  );

  // Rejects tampered body, wrong secret, empty signature, and stale replay timestamps (>300s)
  assert.equal(
    await verifyPolarWebhookSignature(
      `${body} `,
      { webhookId, webhookTimestamp, webhookSignature: validWhsecSig },
      whsecSecret,
      nowSec,
    ),
    false,
  );
  assert.equal(
    await verifyPolarWebhookSignature(
      body,
      { webhookId, webhookTimestamp, webhookSignature: validWhsecSig },
      "whsec_d3Jvbmdfc2VjcmV0X2tleV85ODc2NTQzMjEw",
      nowSec,
    ),
    false,
  );
  assert.equal(
    await verifyPolarWebhookSignature(
      body,
      { webhookId, webhookTimestamp, webhookSignature: "" },
      whsecSecret,
      nowSec,
    ),
    false,
  );
  const expiredTs = String(nowSec - 600);
  const expiredSig = signStandardWebhookEvent(
    whsecSecret,
    webhookId,
    expiredTs,
    body,
  );
  assert.equal(
    await verifyPolarWebhookSignature(
      body,
      { webhookId, webhookTimestamp: expiredTs, webhookSignature: expiredSig },
      whsecSecret,
      nowSec,
    ),
    false,
  );
});

test("resolvePolarWebhookEntitlement handles lifetime, subscriptions, grace periods, refunds, and lifetime protection", () => {
  const knownProducts = {
    monthly: "prod_monthly_101",
    annual: "prod_annual_202",
    lifetime: "prod_lifetime_303",
  };

  // 1. Paid lifetime one-time order grants permanent Pro
  const lifetimeWin = resolvePolarWebhookEntitlement({
    eventType: "order.paid",
    status: "paid",
    productId: "prod_lifetime_303",
    knownProducts,
  });
  assert.equal(lifetimeWin.shouldUpdate, true);
  assert.equal(lifetimeWin.isPremium, true);
  assert.equal(lifetimeWin.proPlan, "lifetime");
  assert.equal(lifetimeWin.subscriptionStatus, "lifetime");

  // 2. Non-lifetime order.paid is ignored (subscriptions are managed by subscription.* events)
  const monthlyOrder = resolvePolarWebhookEntitlement({
    eventType: "order.paid",
    status: "paid",
    productId: "prod_monthly_101",
    knownProducts,
  });
  assert.equal(monthlyOrder.shouldUpdate, false);

  // 3. Trialing annual subscription grants Pro
  const trialSub = resolvePolarWebhookEntitlement({
    eventType: "subscription.created",
    status: "trialing",
    metaPlan: "annual",
    knownProducts,
  });
  assert.equal(trialSub.shouldUpdate, true);
  assert.equal(trialSub.isPremium, true);
  assert.equal(trialSub.proPlan, "annual");

  // 4. Active subscription grants Pro
  const activeSub = resolvePolarWebhookEntitlement({
    eventType: "subscription.active",
    status: "active",
    productId: "prod_annual_202",
    knownProducts,
  });
  assert.equal(activeSub.shouldUpdate, true);
  assert.equal(activeSub.isPremium, true);
  assert.equal(activeSub.proPlan, "annual");

  // 5. Canceled subscription still inside paid grace period keeps Pro until ends_at
  const graceSub = resolvePolarWebhookEntitlement({
    eventType: "subscription.canceled",
    status: "canceled",
    metaPlan: "monthly",
    endsAtIso: "2026-12-31T00:00:00Z",
    nowMs: Date.parse("2026-11-26T00:00:00Z"),
  });
  assert.equal(graceSub.shouldUpdate, true);
  assert.equal(graceSub.isPremium, true);

  // 6. Revoked subscription removes Pro
  const revokedSub = resolvePolarWebhookEntitlement({
    eventType: "subscription.revoked",
    status: "revoked",
    metaPlan: "monthly",
  });
  assert.equal(revokedSub.shouldUpdate, true);
  assert.equal(revokedSub.isPremium, false);
  assert.equal(revokedSub.subscriptionStatus, "revoked");

  // 7. Existing Lifetime Founder Pass is NEVER downgraded by an old subscription revoking
  const protectedLifetime = resolvePolarWebhookEntitlement({
    eventType: "subscription.revoked",
    status: "revoked",
    metaPlan: "monthly",
    alreadyLifetime: true,
  });
  assert.equal(protectedLifetime.shouldUpdate, false);
  assert.equal(protectedLifetime.isPremium, true);

  // 8. Refund revokes Pro
  const refund = resolvePolarWebhookEntitlement({
    eventType: "order.refunded",
    status: "refunded",
    productId: "prod_lifetime_303",
    knownProducts,
  });
  assert.equal(refund.shouldUpdate, true);
  assert.equal(refund.isPremium, false);
  assert.equal(refund.subscriptionStatus, "refunded");
});
