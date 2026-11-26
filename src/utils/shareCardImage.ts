import { Platform } from "react-native";
import {
  getStudioColors,
  getStudioPaletteMeta,
  type StudioPaletteId,
} from "../constants/theme";
import {
  type ActivityHeatmapMap,
  buildPixelGardenGrid,
  DEFAULT_HEATMAP_WEEKS,
  getActivityHeatmapMap,
  getGardenTilePalette,
  mergeStreakBaselineIntoHeatmap,
} from "./activityHeatmap";
import {
  type AstralPassportData,
  buildBonsaiEmblemSvgInner,
  buildMiniConstellationSvgInner,
  buildPassportSerial,
  computePassportBonsaiStage,
  computePassportRarity,
} from "./astralPassport";
import { trackFunnelMilestone } from "./attribution";
import { shareOrCopyText } from "./shareUtils";

export type ShareCardVariant =
  | "lesson_win"
  | "streak_milestone"
  | "profile_card";

export interface ShareCardPayload {
  variant: ShareCardVariant;
  eyebrow: string;
  headline: string;
  subtitle?: string;
  displayName?: string;
  rankLevel: number;
  rankTitle: string;
  xpPoints: number;
  streakCount: number;
  metric3Label: string;
  metric3Value: string;
  paletteId?: StudioPaletteId;
  accentColor?: string;
  footerUrl?: string;
  activityMap?: ActivityHeatmapMap;
  passport?: AstralPassportData;
}

export type ShareCardExportOutcome =
  | "shared"
  | "downloaded"
  | "copied"
  | "failed";

export function escapeXml(raw: string): string {
  return String(raw ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function wrapCardHeadline(text: string, maxCharsPerLine = 26): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return ["Devy Achievement"];
  if (cleaned.length <= maxCharsPerLine) return [cleaned];

  const words = cleaned.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current =
        word.length > maxCharsPerLine
          ? `${word.slice(0, maxCharsPerLine - 1)}…`
          : word;
      if (lines.length === 1) break;
    }
  }
  if (current && lines.length < 2) {
    lines.push(current);
  }
  if (lines.length === 2 && cleaned.length > lines.join(" ").length + 2) {
    lines[1] = `${lines[1].slice(0, Math.max(1, maxCharsPerLine - 1))}…`;
  }
  return lines;
}

export function buildShareCardFilename(payload: ShareCardPayload): string {
  const slug = payload.headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  const prefix =
    payload.variant === "streak_milestone"
      ? "devy-streak"
      : payload.variant === "profile_card"
        ? "devy-dev-card"
        : "devy-win";
  return `${prefix}-${slug || "card"}.png`;
}

/**
 * Generates a crisp 1200x630 Neo-Brutalist Arcade SVG trading card matching
 * the user's active Studio Theme Palette. Can be rasterized to PNG on Web Canvas.
 */
export function buildShareCardSvg(payload: ShareCardPayload): string {
  const paletteId: StudioPaletteId = payload.paletteId || "arcade";
  const paletteMeta = getStudioPaletteMeta(paletteId);
  const darkColors = getStudioColors("dark", paletteId);
  const accent = payload.accentColor || paletteMeta.accent;

  const headlineLines = wrapCardHeadline(payload.headline, 24);
  const eyebrow = escapeXml(payload.eyebrow.toUpperCase().slice(0, 48));
  const subtitle = escapeXml(
    (payload.subtitle || `LVL ${payload.rankLevel} · ${payload.rankTitle}`).slice(
      0,
      64,
    ),
  );
  const coderName = escapeXml(
    (payload.displayName?.trim() || "Devy Coder").slice(0, 26),
  );
  const rankBadge = escapeXml(
    `LVL ${payload.rankLevel} · ${payload.rankTitle.toUpperCase()}`.slice(0, 30),
  );
  const streakVal = escapeXml(
    `${payload.streakCount} ${payload.streakCount === 1 ? "DAY" : "DAYS"}`,
  );
  const xpVal = escapeXml(`${payload.xpPoints.toLocaleString()} XP`);
  const metric3Label = escapeXml(
    payload.metric3Label.toUpperCase().slice(0, 18),
  );
  const metric3Value = escapeXml(payload.metric3Value.slice(0, 20));
  const footerUrl = escapeXml(
    (payload.footerUrl || "devy.app").replace(/^https?:\/\//, "").slice(0, 46),
  );

  const variantTag =
    payload.variant === "streak_milestone"
      ? "STREAK MILESTONE"
      : payload.variant === "profile_card"
        ? "DEVELOPER CARD"
        : "MISSION CLEARED";

  const crtStatusCaption = escapeXml(
    payload.variant === "streak_milestone"
      ? "STREAK LOCKED IN"
      : payload.variant === "profile_card"
        ? `RANK LVL ${payload.rankLevel}`
        : "TESTS GREEN 100%",
  );

  const headlineSvg = headlineLines
    .map(
      (line, idx) =>
        `<text x="92" y="${236 + idx * 62}" fill="${darkColors.textPrimary}" font-family="'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-1">${escapeXml(line)}</text>`,
    )
    .join("");

  const subtitleY = headlineLines.length > 1 ? 340 : 292;

  // Build 12-week Cozy Pixel Garden mini-matrix SVG for the trading card
  const effectiveGardenMap = mergeStreakBaselineIntoHeatmap(
    payload.activityMap || getActivityHeatmapMap(),
    payload.streakCount,
  );
  const gardenSummary = buildPixelGardenGrid(
    effectiveGardenMap,
    DEFAULT_HEATMAP_WEEKS,
  );
  const gardenColors = getGardenTilePalette(true, paletteId);
  const gardenTilesSvg = gardenSummary.weeks
    .map((week, wIdx) =>
      week.cells
        .map((cell, dIdx) => {
          const x = 696 + wIdx * 7.5;
          const y = 363 + dIdx * 5.4;
          const opacity = cell.isFuture ? ' fill-opacity="0.25"' : "";
          return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="5.8" height="4.2" rx="1.2" fill="${gardenColors[cell.level]}"${opacity} />`;
        })
        .join(""),
    )
    .join("");
  const gardenStatCaption = escapeXml(
    `${gardenSummary.activeDays}D · ${gardenSummary.totalActions} WINS`,
  );

  const isPassportCard = payload.variant === "profile_card";
  const passportSerial = escapeXml(
    payload.passport?.serialNumber ||
      buildPassportSerial(payload.displayName || payload.headline, payload.rankLevel),
  );
  const passportRarity =
    payload.passport?.rarity || computePassportRarity(payload.rankLevel);
  const passportBonsai =
    payload.passport?.bonsai ||
    computePassportBonsaiStage(payload.streakCount, 0);
  const passportConstellationSvg =
    isPassportCard && payload.passport?.constellations?.length
      ? buildMiniConstellationSvgInner(payload.passport.constellations, 218, 92, 6.4)
      : "";
  const passportBonsaiSvg = isPassportCard
    ? buildBonsaiEmblemSvgInner(passportBonsai, paletteId)
    : "";
  const passportStampsBadge = payload.passport
    ? escapeXml(
        `STAMPS ${payload.passport.stampsEarnedCount}/${payload.passport.stamps.length} · CODEX ${payload.passport.codexIlluminated}/${payload.passport.codexTotal}`,
      )
    : escapeXml(`STAGE ${passportBonsai.stageNumber}/5 · ${passportBonsai.label}`);

  const rightEmblemSvg = isPassportCard
    ? `
  <!-- Right Side: Astral Dev Passport Observatory Emblem + Mini Constellation + Bonsai -->
  <g transform="translate(812, 100)">
    <!-- Passport Serial & Rarity Crown Pill -->
    <rect x="4" y="0" width="270" height="24" rx="7" fill="${darkColors.codeSurface}" stroke="${passportRarity.foilPrimary}" stroke-width="2" />
    <text x="16" y="16" fill="${passportRarity.foilPrimary}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="10.5" font-weight="900" letter-spacing="0.8">✦ ${passportSerial}</text>
    <text x="262" y="16" text-anchor="end" fill="${darkColors.textPrimary}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="10" font-weight="900">${escapeXml(passportRarity.badgeText)}</text>

    <!-- Observatory Shadow & Shell -->
    <rect x="10" y="36" width="270" height="266" rx="24" fill="#000000" />
    <rect x="4" y="30" width="270" height="266" rx="24" fill="${darkColors.surfaceElevated}" stroke="${passportRarity.foilPrimary}" stroke-width="3.5" />

    <!-- Star Chart Viewport -->
    <rect x="20" y="46" width="238" height="162" rx="16" fill="#090C16" stroke="${darkColors.codeBorder}" stroke-width="2.5" />
    <rect x="30" y="54" width="218" height="20" rx="6" fill="${darkColors.codeSurface}" />
    <text x="40" y="68" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="10.5" font-weight="900">● ${variantTag}</text>
    <text x="238" y="68" text-anchor="end" fill="#FFDE59" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="10" font-weight="900">${crtStatusCaption}</text>

    <!-- Illuminated Mini Constellation Map -->
    <g transform="translate(30, 76)">
      ${passportConstellationSvg}
    </g>

    <!-- Crisp Devy Emblem Stamp -->
    <text x="139" y="195" text-anchor="middle" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="10.5" font-weight="900" letter-spacing="0.6">[ &gt;_ DEVY ] · ASTRAL PASSPORT</text>

    <!-- Bottom Bonsai Growth Emblem + Stamps Telemetry -->
    <rect x="20" y="218" width="238" height="66" rx="12" fill="${darkColors.codeBg}" stroke="${darkColors.codeBorder}" stroke-width="2" />
    <g transform="translate(26, 221) scale(0.7)">
      ${passportBonsaiSvg}
    </g>
    <text x="92" y="241" fill="#6EE7B7" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="10" font-weight="900" letter-spacing="0.8">BONSAI STAGE ${passportBonsai.stageNumber}/5</text>
    <text x="92" y="259" fill="${darkColors.textPrimary}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="12.5" font-weight="900">${escapeXml(passportBonsai.label)}</text>
    <text x="92" y="275" fill="${darkColors.textSecondary}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="9.5" font-weight="800">${passportStampsBadge}</text>
  </g>`
    : `
  <!-- Right Side: Retro Devy CRT Terminal Emblem -->
  <g transform="translate(812, 108)">
    <!-- Twin Retro Signal Antennas -->
    <line x1="88" y1="22" x2="64" y2="2" stroke="${darkColors.border}" stroke-width="4" stroke-linecap="round" />
    <circle cx="64" cy="2" r="5" fill="${accent}" stroke="#111111" stroke-width="2" />
    <line x1="190" y1="22" x2="214" y2="2" stroke="${darkColors.border}" stroke-width="4" stroke-linecap="round" />
    <circle cx="214" cy="2" r="5" fill="#FF90E8" stroke="#111111" stroke-width="2" />

    <!-- TV Shadow & Shell -->
    <rect x="10" y="26" width="270" height="236" rx="28" fill="#000000" />
    <rect x="4" y="20" width="270" height="236" rx="28" fill="${darkColors.surfaceElevated}" stroke="${darkColors.border}" stroke-width="3.5" />

    <!-- Recessed CRT Tube -->
    <rect x="22" y="38" width="234" height="154" rx="18" fill="${darkColors.codeBg}" stroke="${darkColors.codeBorder}" stroke-width="3" />
    <rect x="34" y="48" width="210" height="20" rx="6" fill="${darkColors.codeSurface}" />
    <text x="46" y="62" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="11" font-weight="900">● ${variantTag}</text>

    <!-- Crisp Retro Terminal Code Emblem -->
    <text x="139" y="114" text-anchor="middle" fill="#C4B5FD" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="16" font-weight="900">&gt;&gt;&gt; python3.11</text>
    <text x="139" y="146" text-anchor="middle" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="24" font-weight="900">[ &gt;_ DEVY ]</text>
    <text x="139" y="176" text-anchor="middle" fill="#FFDE59" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="12" font-weight="800">${crtStatusCaption}</text>

    <!-- Bottom VHS Slot -->
    <rect x="24" y="204" width="166" height="32" rx="8" fill="${darkColors.codeBg}" stroke="${darkColors.codeBorder}" stroke-width="2.5" />
    <rect x="38" y="213" width="138" height="14" rx="4" fill="${accent}" stroke="#111111" stroke-width="2" />
    <circle cx="212" cy="220" r="7" fill="${accent}" stroke="#111111" stroke-width="2" />
    <text x="226" y="225" fill="${darkColors.textPrimary}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="13" font-weight="900">VHS</text>
  </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="devyDots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.4" fill="${darkColors.textPrimary}" fill-opacity="0.10" />
    </pattern>
  </defs>

  <!-- Outer Canvas -->
  <rect width="1200" height="630" fill="${darkColors.bg}" />
  <rect width="1200" height="630" fill="url(#devyDots)" />

  <!-- Decorative Ambient Corner Glows -->
  <circle cx="1050" cy="110" r="210" fill="${accent}" fill-opacity="0.12" />
  <circle cx="160" cy="540" r="180" fill="#FF90E8" fill-opacity="0.09" />

  <!-- Main Neo-Brutalist Card Hard Shadow -->
  <rect x="54" y="50" width="1104" height="540" rx="28" fill="#000000" />
  <!-- Main Card Shell -->
  <rect x="44" y="40" width="1104" height="540" rx="28" fill="${darkColors.surface}" stroke="${isPassportCard ? passportRarity.foilPrimary : darkColors.border}" stroke-width="4" />

  <!-- Top Colored Ribbon -->
  <path d="M48 68 C48 53 60 44 74 44 L1118 44 C1132 44 1144 53 1144 68 L1144 76 L48 76 Z" fill="${accent}" />
  <line x1="44" y1="76" x2="1148" y2="76" stroke="#111111" stroke-width="3" />

  <!-- Header Brand Pill + Level Pill -->
  <rect x="92" y="106" width="218" height="38" rx="10" fill="${darkColors.surfaceElevated}" stroke="${darkColors.border}" stroke-width="2.5" />
  <circle cx="114" cy="125" r="7" fill="${accent}" stroke="#111111" stroke-width="2" />
  <text x="132" y="131" fill="${darkColors.textPrimary}" font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, monospace" font-size="16" font-weight="900" letter-spacing="1.4">DEVY STUDIO</text>

  <rect x="326" y="106" width="268" height="38" rx="10" fill="${accent}" stroke="#111111" stroke-width="2.5" />
  <text x="344" y="131" fill="#111111" font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, monospace" font-size="15" font-weight="900" letter-spacing="1">${eyebrow}</text>

  <!-- Headline & Personalized Identity -->
  ${headlineSvg}
  <text x="92" y="${subtitleY}" fill="${darkColors.textSecondary}" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-size="24" font-weight="700">${subtitle}</text>

  <!-- Coder Handle Pill -->
  <rect x="92" y="360" width="390" height="44" rx="10" fill="${darkColors.codeSurface}" stroke="${darkColors.codeBorder}" stroke-width="2" />
  <text x="110" y="387" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, monospace" font-size="13.5" font-weight="800">@${coderName} · ${rankBadge}</text>

  <!-- 12-Week Cozy Pixel Garden Mini-Card -->
  <rect x="496" y="356" width="300" height="50" rx="10" fill="${darkColors.codeSurface}" stroke="${darkColors.codeBorder}" stroke-width="2" />
  <text x="510" y="376" fill="${darkColors.textPrimary}" font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, monospace" font-size="11" font-weight="900" letter-spacing="0.8">12W PIXEL GARDEN</text>
  <text x="510" y="395" fill="${gardenColors[3]}" font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, monospace" font-size="12" font-weight="900">${gardenStatCaption}</text>
  ${gardenTilesSvg}

  ${rightEmblemSvg}

  <!-- 3 Neo-Brutalist Stat Cards -->
  <!-- Stat 1: Streak -->
  <rect x="97" y="421" width="320" height="92" rx="14" fill="#000000" />
  <rect x="92" y="416" width="320" height="92" rx="14" fill="#FFDE59" stroke="#111111" stroke-width="3" />
  <text x="116" y="446" fill="#111111" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="14" font-weight="900" letter-spacing="1.2">DAILY STREAK</text>
  <text x="116" y="486" fill="#111111" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="30" font-weight="900">${streakVal}</text>

  <!-- Stat 2: Total XP -->
  <rect x="441" y="421" width="320" height="92" rx="14" fill="#000000" />
  <rect x="436" y="416" width="320" height="92" rx="14" fill="#FF90E8" stroke="#111111" stroke-width="3" />
  <text x="460" y="446" fill="#111111" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="14" font-weight="900" letter-spacing="1.2">TOTAL XP</text>
  <text x="460" y="486" fill="#111111" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="30" font-weight="900">${xpVal}</text>

  <!-- Stat 3: Context Metric -->
  <rect x="785" y="421" width="320" height="92" rx="14" fill="#000000" />
  <rect x="780" y="416" width="320" height="92" rx="14" fill="#6EE7B7" stroke="#111111" stroke-width="3" />
  <text x="804" y="446" fill="#111111" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="14" font-weight="900" letter-spacing="1.2">${metric3Label}</text>
  <text x="804" y="486" fill="#111111" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="30" font-weight="900">${metric3Value}</text>

  <!-- Footer Strip -->
  <text x="92" y="553" fill="${darkColors.textMuted}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="15" font-weight="800">PYTHON · ALGORITHMS · SYSTEM DESIGN · DEVY STUDIO</text>
  <text x="1100" y="553" text-anchor="end" fill="${accent}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="15" font-weight="900">${footerUrl}</text>
</svg>`;
}

async function svgToPngBlob(svgMarkup: string): Promise<Blob | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const svgBlob = new Blob([svgMarkup], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const img = new window.Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 1200;
          canvas.height = 630;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, 1200, 630);
          URL.revokeObjectURL(url);
          canvas.toBlob((blob) => resolve(blob), "image/png", 1);
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Generates a 1200x630 PNG visual share card on Web (uses native file share on mobile browsers
 * or instant PNG download on desktop), and falls back cleanly to rich text share on native mobile.
 */
export async function exportShareCardPng(options: {
  payload: ShareCardPayload;
  fallbackTitle: string;
  fallbackMessage: string;
  channel: string;
}): Promise<ShareCardExportOutcome> {
  const { payload, fallbackTitle, fallbackMessage, channel } = options;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const svg = buildShareCardSvg(payload);
    const pngBlob = await svgToPngBlob(svg);
    const filename = buildShareCardFilename(payload);

    if (pngBlob) {
      // 1. Touch devices with Web Share Files support -> open native share sheet with PNG attached
      try {
        const isTouchWeb =
          typeof navigator !== "undefined" &&
          ("maxTouchPoints" in navigator ? navigator.maxTouchPoints > 0 : false);
        if (
          isTouchWeb &&
          typeof File !== "undefined" &&
          typeof navigator !== "undefined" &&
          typeof navigator.share === "function" &&
          typeof navigator.canShare === "function"
        ) {
          const pngFile = new File([pngBlob], filename, { type: "image/png" });
          if (navigator.canShare({ files: [pngFile] })) {
            await navigator.share({
              title: fallbackTitle,
              text: fallbackMessage,
              files: [pngFile],
            });
            trackFunnelMilestone("share_triggered", {
              channel: `${channel}_png`,
            });
            return "shared";
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return "failed";
        }
      }

      // 2. Desktop / fallback Web -> download PNG file cleanly (+ best-effort clipboard image copy)
      try {
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(pngUrl), 2500);

        trackFunnelMilestone("share_triggered", {
          channel: `${channel}_png`,
        });
        return "downloaded";
      } catch {
        // Fall through to text share
      }
    }
  }

  return shareOrCopyText({
    title: fallbackTitle,
    message: fallbackMessage,
    channel,
  });
}
