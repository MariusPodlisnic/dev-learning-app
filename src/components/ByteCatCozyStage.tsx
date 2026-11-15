import { Image } from "expo-image";
import React from "react";
import { Platform, View } from "react-native";
import {
  IDLE_BREAK_META,
  type IdleBreakAction,
  KEYCAP_PALETTE,
} from "../constants/byteCatData";

const BYTE_CAT_IMAGE = require("../../assets/images/byte-cat.jpg");

const COZY_STAGE_CSS = `
  @keyframes bcHeadBob {
    0%, 100% { transform: translateY(0px) rotate(-1.6deg); }
    50% { transform: translateY(3.8px) rotate(1.8deg); }
  }
  @keyframes bcBodyBreathe {
    0%, 100% { transform: scaleY(1) scaleX(1); }
    50% { transform: scaleY(1.028) scaleX(0.985); }
  }
  @keyframes bcPawTapLeft {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    45% { transform: translateY(-7.5px) rotate(-9deg); }
    55% { transform: translateY(2.5px) rotate(4deg); }
  }
  @keyframes bcPawTapRight {
    0%, 100% { transform: translateY(2.5px) rotate(4deg); }
    45% { transform: translateY(0px) rotate(0deg); }
    90% { transform: translateY(-7.5px) rotate(9deg); }
  }
  @keyframes bcTailSway {
    0%, 100% { transform: rotate(-11deg); }
    50% { transform: rotate(15deg); }
  }
  @keyframes bcEarTwitchL {
    0%, 82%, 100% { transform: rotate(0deg); }
    88% { transform: rotate(-10deg); }
    94% { transform: rotate(4deg); }
  }
  @keyframes bcEarTwitchR {
    0%, 58%, 100% { transform: rotate(0deg); }
    64% { transform: rotate(9deg); }
    71% { transform: rotate(-3deg); }
  }
  @keyframes bcSteamRise {
    0% { transform: translateY(0px) translateX(0px) scale(0.85); opacity: 0; }
    35% { opacity: 0.85; }
    100% { transform: translateY(-20px) translateX(5px) scale(1.2); opacity: 0; }
  }
  @keyframes bcRainSlide {
    0% { transform: translateY(-18px) translateX(7px); opacity: 0; }
    25% { opacity: 0.75; }
    100% { transform: translateY(48px) translateX(-10px); opacity: 0; }
  }
  @keyframes bcNoteFloat {
    0% { transform: translateY(0px) translateX(0px) scale(0.75); opacity: 0; }
    25% { opacity: 0.95; }
    100% { transform: translateY(-26px) translateX(12px) scale(1.12); opacity: 0; }
  }
  @keyframes bcLampGlow {
    0%, 100% { opacity: 0.22; }
    50% { opacity: 0.34; }
  }
  @keyframes bcFairyTwinkle {
    0%, 100% { opacity: 0.45; transform: scale(0.88); }
    50% { opacity: 1; transform: scale(1.16); }
  }
  @keyframes bcLavaBlob {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-10px) scale(1.18); }
  }
  @keyframes bcSipHead {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25%, 75% { transform: translateY(-4px) rotate(8deg); }
  }
  @keyframes bcSipMugLift {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
    25%, 75% { transform: translate(42px, -38px) rotate(24deg); }
  }
  @keyframes bcSipPawLeft {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
    25%, 75% { transform: translate(8px, -34px) rotate(20deg); }
  }
  @keyframes bcStretchBody {
    0%, 100% { transform: scaleY(1) scaleX(1) translateY(0px); }
    30%, 70% { transform: scaleY(1.16) scaleX(0.92) translateY(-6px); }
  }
  @keyframes bcStretchHead {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    30%, 70% { transform: translateY(-10px) rotate(-4deg); }
  }
  @keyframes bcStretchPawL {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
    28%, 72% { transform: translate(-14px, -68px) rotate(-25deg); }
  }
  @keyframes bcStretchPawR {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
    28%, 72% { transform: translate(14px, -68px) rotate(25deg); }
  }
  @keyframes bcSwatHead {
    0%, 100% { transform: translateX(0px) rotate(0deg); }
    20%, 70% { transform: translateX(-8px) rotate(-7deg); }
  }
  @keyframes bcSwatPawL {
    0%, 100% { transform: translate(0px, 0px); }
    35% { transform: translate(-52px, -28px) scale(1.1); }
    50% { transform: translate(-46px, -18px) scale(0.95); }
    65% { transform: translate(-54px, -26px) scale(1.12); }
  }
  @keyframes bcBugFlyOff {
    0%, 40% { transform: translate(0px, 0px) scale(1); opacity: 1; }
    55% { transform: translate(-6px, -4px) scale(1.25); opacity: 1; }
    100% { transform: translate(-35px, -42px) rotate(-180deg) scale(0.2); opacity: 0; }
  }
  @keyframes bcJamHead {
    0%, 100% { transform: translateY(0px) rotate(-6deg); }
    25% { transform: translateY(-7px) rotate(6deg); }
    50% { transform: translateY(0px) rotate(-6deg); }
    75% { transform: translateY(-7px) rotate(6deg); }
  }
  @keyframes bcJamPawL {
    0%, 100% { transform: translateY(0px); }
    25%, 75% { transform: translate(-8px, -46px) rotate(-18deg); }
    50% { transform: translate(-4px, -24px) rotate(-8deg); }
  }
  @keyframes bcJamPawR {
    0%, 100% { transform: translateY(0px); }
    25%, 75% { transform: translate(8px, -46px) rotate(18deg); }
    50% { transform: translate(4px, -24px) rotate(8deg); }
  }

  .bc-cat-head { animation: bcHeadBob 1.35s ease-in-out infinite; transform-origin: 120px 104px; }
  .bc-cat-body { animation: bcBodyBreathe 1.8s ease-in-out infinite; transform-origin: 120px 142px; }
  .bc-paw-l { animation: bcPawTapLeft 0.33s ease-in-out infinite; transform-origin: 92px 138px; }
  .bc-paw-r { animation: bcPawTapRight 0.33s ease-in-out infinite; transform-origin: 148px 138px; }
  .bc-cat-tail { animation: bcTailSway 1.65s ease-in-out infinite; transform-origin: 72px 144px; }
  .bc-ear-l { animation: bcEarTwitchL 3.7s ease-in-out infinite; transform-origin: 92px 62px; }
  .bc-ear-r { animation: bcEarTwitchR 4.4s ease-in-out infinite; transform-origin: 148px 62px; }
  .bc-steam-1 { animation: bcSteamRise 2.3s ease-out infinite; }
  .bc-steam-2 { animation: bcSteamRise 2.3s ease-out 0.85s infinite; }
  .bc-rain-1 { animation: bcRainSlide 1.05s linear infinite; }
  .bc-rain-2 { animation: bcRainSlide 1.05s linear 0.35s infinite; }
  .bc-rain-3 { animation: bcRainSlide 1.05s linear 0.7s infinite; }
  .bc-rain-4 { animation: bcRainSlide 1.05s linear 0.52s infinite; }
  .bc-note-1 { animation: bcNoteFloat 2.3s ease-out infinite; }
  .bc-note-2 { animation: bcNoteFloat 2.3s ease-out 1.15s infinite; }
  .bc-lamp-cone { animation: bcLampGlow 2.4s ease-in-out infinite; }
  .bc-bulb-1 { animation: bcFairyTwinkle 1.8s ease-in-out infinite; transform-origin: center; }
  .bc-bulb-2 { animation: bcFairyTwinkle 2.2s ease-in-out 0.6s infinite; transform-origin: center; }
  .bc-bulb-3 { animation: bcFairyTwinkle 1.9s ease-in-out 1.1s infinite; transform-origin: center; }
  .bc-lava-bubble { animation: bcLavaBlob 1.9s ease-in-out infinite; transform-origin: 202px 125px; }

  .bc-state-sip .bc-cat-head { animation: bcSipHead 2.4s ease-in-out forwards; }
  .bc-state-sip .bc-mug-group { animation: bcSipMugLift 2.4s ease-in-out forwards; transform-origin: 57px 140px; }
  .bc-state-sip .bc-paw-l { animation: bcSipPawLeft 2.4s ease-in-out forwards; }
  .bc-state-sip .bc-paw-r { animation: none; }

  .bc-state-stretch .bc-cat-body { animation: bcStretchBody 2.4s ease-in-out forwards; }
  .bc-state-stretch .bc-cat-head { animation: bcStretchHead 2.4s ease-in-out forwards; }
  .bc-state-stretch .bc-paw-l { animation: bcStretchPawL 2.4s ease-in-out forwards; }
  .bc-state-stretch .bc-paw-r { animation: bcStretchPawR 2.4s ease-in-out forwards; }
  .bc-state-stretch .bc-cat-tail { animation-duration: 0.4s; }

  .bc-state-swat .bc-cat-head { animation: bcSwatHead 2.2s ease-in-out forwards; }
  .bc-state-swat .bc-paw-l { animation: bcSwatPawL 2.2s ease-in-out forwards; }
  .bc-state-swat .bc-screen-bug { animation: bcBugFlyOff 2.2s ease-in-out forwards; transform-origin: 36px 115px; }

  .bc-state-jam .bc-cat-head { animation: bcJamHead 2.4s ease-in-out forwards; }
  .bc-state-jam .bc-paw-l { animation: bcJamPawL 2.4s ease-in-out forwards; }
  .bc-state-jam .bc-paw-r { animation: bcJamPawR 2.4s ease-in-out forwards; }
  .bc-state-jam .bc-cat-tail { animation-duration: 0.45s; }
`;

export default function CozyCodingByteCatStage({
  idleBreak,
  isBlinking,
  hyperPurrActive,
  activeKeyStep,
}: {
  idleBreak: IdleBreakAction;
  isBlinking: boolean;
  hyperPurrActive: boolean;
  activeKeyStep: number;
}) {
  if (Platform.OS !== "web") {
    return (
      <Image
        source={BYTE_CAT_IMAGE}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    );
  }

  const effectiveAction: IdleBreakAction = hyperPurrActive ? "jam" : idleBreak;
  const stageClass = effectiveAction ? `bc-state-${effectiveAction}` : "";
  const getKeyFill = (idx: number) =>
    !effectiveAction && idx === activeKeyStep
      ? "#FFFFFF"
      : KEYCAP_PALETTE[(idx + activeKeyStep) % KEYCAP_PALETTE.length];

  const activeFace =
    effectiveAction === "sip"
      ? "sip"
      : effectiveAction === "stretch"
        ? "stretch"
        : effectiveAction === "swat"
          ? "swat"
          : effectiveAction === "jam"
            ? "jam"
            : isBlinking
              ? "sip"
              : "happy";

  const bubbleLabel = effectiveAction
    ? IDLE_BREAK_META[effectiveAction].bubble
    : null;

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "#171522" }}>
      <style>{COZY_STAGE_CSS}</style>
      <svg
        viewBox="0 0 240 190"
        className={stageClass}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <radialGradient id="bcWarmRoomGlow" cx="58%" cy="48%" r="58%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.24" />
            <stop offset="65%" stopColor="#F97316" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#171522" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bcDeskWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9A3412" />
            <stop offset="100%" stopColor="#5C1D0B" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="240" height="190" fill="url(#bcWarmRoomGlow)" />

        {/* 1. Rainy Night Window with Bokeh & Moon */}
        <g>
          <rect
            x="12"
            y="16"
            width="66"
            height="68"
            rx="10"
            fill="#0B1120"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <circle cx="25" cy="64" r="4.5" fill="#FBBF24" opacity="0.35" />
          <circle cx="36" cy="60" r="3.5" fill="#F472B6" opacity="0.35" />
          <circle cx="52" cy="66" r="5" fill="#FB923C" opacity="0.3" />
          <circle cx="64" cy="59" r="3.5" fill="#6EE7B7" opacity="0.3" />
          <circle cx="60" cy="30" r="8" fill="#FFDE59" />
          <circle cx="63.5" cy="27.5" r="7" fill="#0B1120" />
          <line
            x1="28"
            y1="26"
            x2="21"
            y2="40"
            stroke="#7DD3FC"
            strokeWidth="2"
            strokeLinecap="round"
            className="bc-rain-1"
          />
          <line
            x1="44"
            y1="22"
            x2="37"
            y2="36"
            stroke="#7DD3FC"
            strokeWidth="2"
            strokeLinecap="round"
            className="bc-rain-2"
          />
          <line
            x1="62"
            y1="30"
            x2="55"
            y2="44"
            stroke="#7DD3FC"
            strokeWidth="2"
            strokeLinecap="round"
            className="bc-rain-3"
          />
          <line
            x1="35"
            y1="36"
            x2="28"
            y2="50"
            stroke="#BAE6FD"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="bc-rain-4"
          />
          <line
            x1="45"
            y1="16"
            x2="45"
            y2="84"
            stroke="#111111"
            strokeWidth="2.2"
          />
          <line
            x1="12"
            y1="50"
            x2="78"
            y2="50"
            stroke="#111111"
            strokeWidth="2.2"
          />
          <rect
            x="9"
            y="81"
            width="72"
            height="6"
            rx="2"
            fill="#92400E"
            stroke="#111111"
            strokeWidth="2"
          />
        </g>

        {/* 2. Wooden Bookshelf & Trailing Ivy */}
        <g>
          <rect
            x="150"
            y="42"
            width="76"
            height="5.5"
            rx="2"
            fill="#92400E"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect
            x="155"
            y="24"
            width="9"
            height="18"
            rx="1.5"
            fill="#FF90E8"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect
            x="165"
            y="27"
            width="8"
            height="15"
            rx="1.5"
            fill="#FFDE59"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect
            x="174"
            y="22"
            width="10"
            height="20"
            rx="1.5"
            fill="#C4B5FD"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect
            x="198"
            y="28"
            width="16"
            height="14"
            rx="3"
            fill="#EA580C"
            stroke="#111111"
            strokeWidth="2"
          />
          <ellipse
            cx="201"
            cy="25"
            rx="6"
            ry="4"
            fill="#4ADE80"
            stroke="#111111"
            strokeWidth="1.8"
          />
          <ellipse
            cx="211"
            cy="26"
            rx="6"
            ry="4"
            fill="#22C55E"
            stroke="#111111"
            strokeWidth="1.8"
          />
          <path
            d="M212 36 Q220 48 215 60"
            fill="none"
            stroke="#22C55E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="216"
            cy="54"
            r="3.5"
            fill="#4ADE80"
            stroke="#111111"
            strokeWidth="1.5"
          />
        </g>

        {/* 3. Twinkling Fairy String Lights */}
        <g>
          <path
            d="M6 8 Q70 22 135 10 Q188 22 234 7"
            fill="none"
            stroke="#111111"
            strokeWidth="2"
          />
          <circle cx="34" cy="13" r="4" fill="#FFDE59" className="bc-bulb-1" />
          <circle cx="72" cy="16" r="4" fill="#FDBA74" className="bc-bulb-2" />
          <circle cx="108" cy="13" r="4" fill="#FF90E8" className="bc-bulb-3" />
          <circle cx="144" cy="12" r="4" fill="#FFDE59" className="bc-bulb-1" />
          <circle cx="182" cy="16" r="4" fill="#6EE7B7" className="bc-bulb-2" />
          <circle cx="216" cy="11" r="4" fill="#FDBA74" className="bc-bulb-3" />
        </g>

        {/* 4. Brass Desk Lamp & Golden Light Cone */}
        <g>
          <polygon
            points="196,58 140,148 236,148"
            fill="#FFDE59"
            className="bc-lamp-cone"
          />
          <path
            d="M214 146 L224 68 L198 56"
            fill="none"
            stroke="#111111"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M184 62 Q196 44 210 58 Z"
            fill="#F59E0B"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <circle cx="197" cy="61" r="3.5" fill="#FEF08A" />
        </g>

        {/* 5. Side Code Monitor (+ Crawling Bug during Swat Event) */}
        <g>
          <rect
            x="12"
            y="96"
            width="48"
            height="38"
            rx="5"
            fill="#0F172A"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <rect
            x="30"
            y="134"
            width="12"
            height="12"
            fill="#334155"
            stroke="#111111"
            strokeWidth="2"
          />
          <rect x="18" y="103" width="22" height="3.5" rx="1.5" fill="#FF90E8" />
          <rect x="18" y="110" width="32" height="3.5" rx="1.5" fill="#6EE7B7" />
          <rect x="22" y="117" width="24" height="3.5" rx="1.5" fill="#FFDE59" />
          <rect x="18" y="124" width="16" height="3.5" rx="1.5" fill="#A3E635" />
          {effectiveAction === "swat" && (
            <g className="bc-screen-bug">
              <circle
                cx="38"
                cy="114"
                r="6"
                fill="#A3E635"
                stroke="#111111"
                strokeWidth="2"
              />
              <circle cx="36" cy="112" r="1.5" fill="#111111" />
              <circle cx="40" cy="112" r="1.5" fill="#111111" />
            </g>
          )}
        </g>

        {/* Floating Lo-Fi Notes */}
        <text
          x="166"
          y="64"
          fontSize="14"
          fontWeight="900"
          fill="#FFDE59"
          className="bc-note-1"
        >
          ♪
        </text>
        <text
          x="68"
          y="56"
          fontSize="13"
          fontWeight="900"
          fill="#FF90E8"
          className="bc-note-2"
        >
          ♫
        </text>

        {/* 6. ANIMATED BYTE-CAT RIG */}
        <g className="bc-cat-tail">
          <path
            d="M74 140 Q42 132 46 102"
            fill="none"
            stroke="#111111"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M74 140 Q42 132 46 102"
            fill="none"
            stroke="#F5EEDB"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <circle cx="48" cy="114" r="3" fill="#FFDE59" />
        </g>

        <g className="bc-cat-body">
          <rect
            x="72"
            y="90"
            width="96"
            height="56"
            rx="27"
            fill="#F5EEDB"
            stroke="#111111"
            strokeWidth="3"
          />
          <path
            d="M94 122 Q120 128 146 122"
            fill="none"
            stroke="#D6CCB8"
            strokeWidth="2"
          />
        </g>

        <g className="bc-cat-head">
          <path
            d="M68 82 A52 50 0 0 1 172 82"
            fill="none"
            stroke="#111111"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M68 82 A52 50 0 0 1 172 82"
            fill="none"
            stroke="#FFDE59"
            strokeWidth="6.5"
            strokeLinecap="round"
          />

          <g className="bc-ear-l">
            <polygon
              points="76,68 86,32 110,54"
              fill="#F5EEDB"
              stroke="#111111"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <polygon points="83,62 89,40 103,54" fill="#FF90E8" />
          </g>
          <g className="bc-ear-r">
            <polygon
              points="164,68 154,32 130,54"
              fill="#F5EEDB"
              stroke="#111111"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <polygon points="157,62 151,40 137,54" fill="#6EE7B7" />
          </g>

          <rect
            x="70"
            y="48"
            width="100"
            height="66"
            rx="31"
            fill="#F5EEDB"
            stroke="#111111"
            strokeWidth="3"
          />
          <rect
            x="57"
            y="66"
            width="17"
            height="34"
            rx="7.5"
            fill="#FFDE59"
            stroke="#111111"
            strokeWidth="3"
          />
          <rect
            x="166"
            y="66"
            width="17"
            height="34"
            rx="7.5"
            fill="#FFDE59"
            stroke="#111111"
            strokeWidth="3"
          />

          {/* Dark CRT Screen */}
          <rect
            x="82"
            y="59"
            width="76"
            height="44"
            rx="17"
            fill="#232936"
            stroke="#111111"
            strokeWidth="3"
          />
          <ellipse cx="97" cy="66" rx="6.5" ry="2" fill="#64748B" opacity="0.45" />

          {/* Rosy Cozy Blush */}
          <ellipse cx="91" cy="86" rx="5.5" ry="3" fill="#FB7185" opacity="0.75" />
          <ellipse cx="149" cy="86" rx="5.5" ry="3" fill="#FB7185" opacity="0.75" />

          {activeFace === "happy" && (
            <g>
              <path
                d="M93 80 Q100 70 107 80"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <path
                d="M133 80 Q140 70 147 80"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <path
                d="M114 85 Q117 89 120 85 Q123 89 126 85"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </g>
          )}

          {activeFace === "sip" && (
            <g>
              <path
                d="M92 78 Q99 83 107 78"
                fill="none"
                stroke="#FFDE59"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M133 78 Q140 83 148 78"
                fill="none"
                stroke="#FFDE59"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="120" cy="86" r="3" fill="#FF90E8" />
            </g>
          )}

          {activeFace === "stretch" && (
            <g>
              <polyline
                points="92,73 104,78 92,83"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="148,73 136,78 148,83"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ellipse
                cx="120"
                cy="86"
                rx="6"
                ry="7.5"
                fill="#FF90E8"
                stroke="#6EE7B7"
                strokeWidth="2"
              />
            </g>
          )}

          {activeFace === "swat" && (
            <g>
              <circle cx="95" cy="77" r="4.5" fill="#A3E635" />
              <circle cx="135" cy="77" r="4.5" fill="#A3E635" />
              <path
                d="M114 86 Q120 82 126 86"
                fill="none"
                stroke="#A3E635"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}

          {activeFace === "jam" && (
            <g>
              <text x="91" y="83" fontSize="14" fontWeight="900" fill="#FFDE59">
                ★
              </text>
              <text x="133" y="83" fontSize="14" fontWeight="900" fill="#FFDE59">
                ★
              </text>
              <path
                d="M111 83 Q120 93 129 83"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}
        </g>

        {/* Option D (Level 3 Perk): Cozy Neon Lava Lamp */}
        <g>
          <polygon
            points="194,142 210,142 206,102 198,102"
            fill="#312E81"
            stroke="#111111"
            strokeWidth="2.4"
          />
          <circle
            cx="202"
            cy="128"
            r="4.8"
            fill="#FF90E8"
            className="bc-lava-bubble"
          />
          <circle cx="202" cy="114" r="3.2" fill="#6EE7B7" />
          <polygon
            points="192,146 212,146 209,138 195,138"
            fill="#C4B5FD"
            stroke="#111111"
            strokeWidth="2.2"
          />
        </g>

        {/* 7. Warm Wooden Desk & Keyboard */}
        <rect
          x="4"
          y="144"
          width="232"
          height="42"
          rx="6"
          fill="url(#bcDeskWood)"
          stroke="#111111"
          strokeWidth="2.5"
        />
        <rect
          x="10"
          y="148"
          width="220"
          height="5"
          rx="2"
          fill="#B45309"
          opacity="0.65"
        />

        <rect
          x="78"
          y="136"
          width="84"
          height="15"
          rx="4.5"
          fill="#1E293B"
          stroke="#111111"
          strokeWidth="2.5"
        />
        <rect x="84" y="140" width="13" height="6" rx="1.5" fill={getKeyFill(0)} />
        <rect x="100" y="140" width="14" height="6" rx="1.5" fill={getKeyFill(1)} />
        <rect x="117" y="140" width="22" height="6" rx="1.5" fill={getKeyFill(2)} />
        <rect x="142" y="140" width="13" height="6" rx="1.5" fill={getKeyFill(3)} />

        {/* Steaming Paw-Mug (Lifts during Coffee Sip!) */}
        <g className="bc-mug-group">
          <path
            d="M54 126 Q57 117 52 110"
            fill="none"
            stroke="#F4F0E6"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="bc-steam-1"
          />
          <path
            d="M62 126 Q65 117 60 110"
            fill="none"
            stroke="#F4F0E6"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="bc-steam-2"
          />
          <rect
            x="46"
            y="130"
            width="22"
            height="20"
            rx="5"
            fill="#F43F5E"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <path
            d="M68 135 H73 A4.5 4.5 0 0 1 73 145 H68"
            fill="none"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <circle cx="57" cy="141" r="3" fill="#FFDE59" />
        </g>

        {/* Paws Rendered Over Keyboard & Mug */}
        <g className="bc-paw-l">
          <ellipse
            cx="92"
            cy="136"
            rx="12"
            ry="9"
            fill="#F5EEDB"
            stroke="#111111"
            strokeWidth="3"
          />
        </g>
        <g className="bc-paw-r">
          <ellipse
            cx="148"
            cy="136"
            rx="12"
            ry="9"
            fill="#F5EEDB"
            stroke="#111111"
            strokeWidth="3"
          />
        </g>

        {/* Floating Break Speech Pill */}
        {bubbleLabel && (
          <g>
            <rect
              x="54"
              y="14"
              width="132"
              height="22"
              rx="11"
              fill="#FFDE59"
              stroke="#111111"
              strokeWidth="2.2"
            />
            <circle
              cx="69"
              cy="25"
              r="6"
              fill={
                effectiveAction === "sip"
                  ? "#FF90E8"
                  : effectiveAction === "swat"
                    ? "#FF6B6B"
                    : "#6EE7B7"
              }
              stroke="#111111"
              strokeWidth="1.5"
            />
            <path
              d="M66.5 25 L68.5 27 L72 23"
              fill="none"
              stroke="#111111"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="126"
              y="29"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="900"
              fill="#111111"
            >
              {bubbleLabel}
            </text>
          </g>
        )}
      </svg>
    </View>
  );
}
