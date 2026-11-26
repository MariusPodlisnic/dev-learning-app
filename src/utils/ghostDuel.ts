import * as Linking from "expo-linking";
import { Platform } from "react-native";

export type GhostDuelMode = "blitz" | "detective" | "bughunt";

export interface GhostDuelChallenge {
  v: 1;
  mode: GhostDuelMode;
  challenger: string;
  seed: string;
  targetScore: number;
  targetTimeSec: number;
  track?: string;
}

export interface GhostPaceSnapshot {
  ghostExpectedScore: number;
  playerScore: number;
  delta: number;
  playerRatio: number;
  ghostRatio: number;
  status: "ahead" | "tied" | "behind";
  statusLabel: string;
}

export interface GhostDuelVerdict {
  outcome: "victory" | "draw" | "defeat";
  headline: string;
  marginLabel: string;
  playerDisplay: string;
  ghostDisplay: string;
}

const VALID_MODES = new Set<string>(["blitz", "detective", "bughunt"]);

function sanitizeChallengerName(raw: unknown): string {
  const cleaned = String(raw || "")
    .replace(/[^a-zA-Z0-9 _.-]/g, "")
    .trim()
    .slice(0, 18);
  return cleaned || "Devy Rival";
}

function sanitizeSeed(raw: unknown): string {
  const cleaned = String(raw || "")
    .replace(/[^a-zA-Z0-9_.:-]/g, "")
    .trim()
    .slice(0, 48);
  return cleaned;
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token: string): string | null {
  try {
    const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad =
      normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const bin = atob(normalized + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeGhostDuelToken(challenge: GhostDuelChallenge): string {
  const compact: Record<string, unknown> = {
    v: 1,
    m: challenge.mode,
    n: sanitizeChallengerName(challenge.challenger),
    s: sanitizeSeed(challenge.seed) || "duel-seed",
    sc: Math.max(0, Math.min(9999, Math.round(challenge.targetScore || 0))),
    t: Math.max(1, Math.min(3600, Math.round(challenge.targetTimeSec || 60))),
  };
  if (challenge.track) {
    compact.tr = String(challenge.track).slice(0, 24);
  }
  return toBase64Url(JSON.stringify(compact));
}

export function decodeGhostDuelToken(
  token: string | undefined | null,
): GhostDuelChallenge | null {
  if (!token || typeof token !== "string") return null;
  const trimmed = token.trim();
  if (trimmed.length < 8 || trimmed.length > 420) return null;

  const decoded = fromBase64Url(trimmed);
  if (!decoded) return null;

  try {
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.v !== 1) return null;
    if (typeof parsed.m !== "string" || !VALID_MODES.has(parsed.m)) return null;

    const seed = sanitizeSeed(parsed.s);
    if (!seed) return null;

    const targetScore = Math.max(
      0,
      Math.min(9999, Math.round(Number(parsed.sc) || 0)),
    );
    const targetTimeSec = Math.max(
      1,
      Math.min(3600, Math.round(Number(parsed.t) || 60)),
    );

    return {
      v: 1,
      mode: parsed.m as GhostDuelMode,
      challenger: sanitizeChallengerName(parsed.n),
      seed,
      targetScore,
      targetTimeSec,
      track: typeof parsed.tr === "string" ? parsed.tr.slice(0, 24) : undefined,
    };
  } catch {
    return null;
  }
}

export function buildGhostDuelUrl(challenge: GhostDuelChallenge): string {
  const token = encodeGhostDuelToken(challenge);
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?duel=${encodeURIComponent(token)}`;
  }
  return Linking.createURL("/", { queryParams: { duel: token } });
}

export function seedStringToInt(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 90000000 + 100000;
}

export function computeGhostPaceSnapshot(params: {
  challenge: GhostDuelChallenge;
  playerScore: number;
  progressRatio: number;
  elapsedSec?: number;
}): GhostPaceSnapshot {
  const { challenge, playerScore, progressRatio, elapsedSec = 0 } = params;
  const clampedProgress = Math.max(0, Math.min(1, progressRatio));

  if (challenge.mode === "bughunt") {
    const ghostTargetSec = Math.max(1, challenge.targetTimeSec);
    const remainingToBeat = Math.max(0, ghostTargetSec - elapsedSec);
    const ghostRatio = Math.min(1, elapsedSec / ghostTargetSec);
    const status =
      elapsedSec < ghostTargetSec * 0.85
        ? "ahead"
        : elapsedSec <= ghostTargetSec
          ? "tied"
          : "behind";
    return {
      ghostExpectedScore: ghostTargetSec,
      playerScore: Math.round(elapsedSec),
      delta: Math.round(ghostTargetSec - elapsedSec),
      playerRatio: Math.min(1, clampedProgress),
      ghostRatio,
      status,
      statusLabel:
        remainingToBeat > 0
          ? `BEAT ${ghostTargetSec}s · ${Math.ceil(remainingToBeat)}s LEFT`
          : `GHOST FINISHED AT ${ghostTargetSec}s`,
    };
  }

  const ghostExpectedScore = Math.round(challenge.targetScore * clampedProgress);
  const delta = playerScore - ghostExpectedScore;
  const ceiling = Math.max(1, challenge.targetScore, playerScore);
  const status = delta > 0 ? "ahead" : delta < 0 ? "behind" : "tied";
  const statusLabel =
    delta > 0
      ? `+${delta} AHEAD OF GHOST`
      : delta < 0
        ? `${Math.abs(delta)} BEHIND GHOST`
        : "NECK & NECK";

  return {
    ghostExpectedScore,
    playerScore,
    delta,
    playerRatio: Math.min(1, playerScore / ceiling),
    ghostRatio: Math.min(1, ghostExpectedScore / ceiling),
    status,
    statusLabel,
  };
}

export function evaluateGhostDuelVerdict(params: {
  challenge: GhostDuelChallenge;
  playerScore: number;
  playerTimeSec: number;
}): GhostDuelVerdict {
  const { challenge, playerScore, playerTimeSec } = params;

  if (challenge.mode === "bughunt") {
    const ghostSec = Math.max(1, Math.round(challenge.targetTimeSec));
    const yourSec = Math.max(1, Math.round(playerTimeSec));
    const diff = ghostSec - yourSec;
    if (diff > 0) {
      return {
        outcome: "victory",
        headline: `🏆 GHOST DEFEATED!`,
        marginLabel: `You patched the incident ${diff}s faster than @${challenge.challenger}!`,
        playerDisplay: `${yourSec}s`,
        ghostDisplay: `${ghostSec}s`,
      };
    }
    if (diff === 0) {
      return {
        outcome: "draw",
        headline: `🤝 EXACT PHOTO FINISH!`,
        marginLabel: `Both you and @${challenge.challenger} shipped the fix in ${yourSec}s.`,
        playerDisplay: `${yourSec}s`,
        ghostDisplay: `${ghostSec}s`,
      };
    }
    return {
      outcome: "defeat",
      headline: `👻 @${challenge.challenger.toUpperCase()} HELD THE RECORD`,
      marginLabel: `Ghost finished ${Math.abs(diff)}s faster — run it back for a rematch!`,
      playerDisplay: `${yourSec}s`,
      ghostDisplay: `${ghostSec}s`,
    };
  }

  const unit = challenge.mode === "blitz" ? "HITS" : "CASES";
  const diff = playerScore - challenge.targetScore;
  if (diff > 0) {
    return {
      outcome: "victory",
      headline: "🏆 GHOST DEFEATED!",
      marginLabel: `You outscored @${challenge.challenger} by +${diff} ${unit.toLowerCase()} on the exact same deck!`,
      playerDisplay: `${playerScore} ${unit}`,
      ghostDisplay: `${challenge.targetScore} ${unit}`,
    };
  }
  if (diff === 0) {
    return {
      outcome: "draw",
      headline: "🤝 DEAD HEAT DRAW!",
      marginLabel: `Tied ${playerScore}–${challenge.targetScore} with @${challenge.challenger} on the exact same seed!`,
      playerDisplay: `${playerScore} ${unit}`,
      ghostDisplay: `${challenge.targetScore} ${unit}`,
    };
  }
  return {
    outcome: "defeat",
    headline: `👻 @${challenge.challenger.toUpperCase()} WON THIS ROUND`,
    marginLabel: `Ghost edged ahead by ${Math.abs(diff)} ${unit.toLowerCase()} — try the same seed again!`,
    playerDisplay: `${playerScore} ${unit}`,
    ghostDisplay: `${challenge.targetScore} ${unit}`,
  };
}
