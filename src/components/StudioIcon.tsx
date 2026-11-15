import { Image } from "expo-image";
import React from "react";
import {
  Platform,
  Text as RNText,
  StyleSheet,
  TextProps,
  View,
  ViewStyle,
} from "react-native";

export type StudioIconName =
  | "crown"
  | "rocket"
  | "rain"
  | "coffee"
  | "lava"
  | "fish"
  | "flame"
  | "bolt"
  | "bug"
  | "paw"
  | "bulb"
  | "dice"
  | "lock"
  | "target"
  | "trophy"
  | "grad"
  | "party"
  | "python"
  | "search"
  | "arch"
  | "headphones"
  | "chat"
  | "medal"
  | "floppy"
  | "book"
  | "brain"
  | "sparkles"
  | "swords"
  | "toolbox"
  | "warning"
  | "cloud"
  | "gift"
  | "share"
  | "sound_on"
  | "sound_off"
  | "gem"
  | "shield"
  | "lab"
  | "scissors"
  | "scale"
  | "broom"
  | "stretch"
  | "boom"
  | "briefcase"
  | "eye"
  | "puzzle"
  | "point_right"
  | "moon"
  | "sun"
  | "keyboard"
  | "timer"
  | "star"
  | "check_box"
  | "terminal"
  | "cross_box"
  | "yellow_box"
  | "algo"
  | "practice_1"
  | "practice_2"
  | "practice_3"
  | "practice_4"
  | "devlearn_logo"
  | "menu_coding"
  | "menu_account_rank"
  | "menu_settings"
  | "pro_member"
  | "nav_skillmap"
  | "nav_studio"
  | "nav_bughunt"
  | "nav_blitz"
  | "nav_algolab"
  | "nav_showcase"
  | "nav_achievements"
  | "free_preview"
  | "crt_ch_kernel"
  | "crt_ch_telemetry"
  | "crt_ch_bytecat"
  | "crt_ch_lofi"
  | "crt_ch_brew"
  | "level_avatar_1"
  | "level_avatar_2"
  | "level_avatar_3"
  | "level_avatar_4"
  | "level_avatar_5"
  | "level_avatar_6"
  | "level_avatar_7"
  | "level_avatar_8"
  | "level_avatar_9"
  | "level_avatar_10";

export function getLevelAvatarIcon(level: number): StudioIconName {
  const clamped = Math.min(10, Math.max(1, Math.floor(level || 1)));
  return `level_avatar_${clamped}` as StudioIconName;
}

const STUDIO_ICON_INNER_SVG: Record<StudioIconName, string> = {
  crown: `
    <path d="M5 25 H27 L29 11 L22 16 L16 7 L10 16 L3 11 Z" fill="#111111" transform="translate(1.8, 1.8)"/>
    <path d="M5 25 H27 L29 11 L22 16 L16 7 L10 16 L3 11 Z" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="5" y="22" width="22" height="3.5" rx="1" fill="#F59E0B" stroke="#111111" stroke-width="1.8"/>
    <circle cx="16" cy="17.5" r="2.2" fill="#FF6B6B" stroke="#111111" stroke-width="1.5"/>
    <circle cx="10" cy="19" r="1.6" fill="#6EE7B7" stroke="#111111" stroke-width="1.3"/>
    <circle cx="22" cy="19" r="1.6" fill="#C4B5FD" stroke="#111111" stroke-width="1.3"/>
  `,
  rocket: `
    <path d="M16 3 C22 8 23 16 21 22 L11 22 C9 16 10 8 16 3 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M11 17 L5 22 L9 24 L12 22 Z" fill="#FF6B6B" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <path d="M21 17 L27 22 L23 24 L20 22 Z" fill="#FF6B6B" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <path d="M13 22 L16 29 L19 22 Z" fill="#FFDE59" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M16 3 C22 8 23 16 21 22 L11 22 C9 16 10 8 16 3 Z" fill="#F8FAFC" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M16 3 C19.5 6 21 10 21 10 L11 10 C11 10 12.5 6 16 3 Z" fill="#C4B5FD" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="15" r="3.2" fill="#38BDF8" stroke="#111111" stroke-width="2"/>
  `,
  rain: `
    <path d="M9 20 H23 A4.5 4.5 0 0 0 23.5 11 A6 6 0 0 0 12 9.5 A5 5 0 0 0 9 20 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M9 20 H23 A4.5 4.5 0 0 0 23.5 11 A6 6 0 0 0 12 9.5 A5 5 0 0 0 9 20 Z" fill="#C4B5FD" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <g stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round">
      <line x1="11" y1="23" x2="9.5" y2="27.5"/>
      <line x1="16.5" y1="23" x2="15" y2="27.5"/>
      <line x1="22" y1="23" x2="20.5" y2="27.5"/>
    </g>
  `,
  coffee: `
    <g stroke="#FFDE59" stroke-width="2.2" stroke-linecap="round" fill="none">
      <path d="M11 9 C11 6 13 6 13 3.5"/>
      <path d="M17 9 C17 6 19 6 19 3.5"/>
    </g>
    <rect x="6" y="12" width="15" height="14" rx="3.5" fill="#111111" transform="translate(1.8,1.8)"/>
    <path d="M21 14 H24.5 A3 3 0 0 1 24.5 21 H21" fill="none" stroke="#111111" stroke-width="4.2"/>
    <path d="M21 14 H24.5 A3 3 0 0 1 24.5 21 H21" fill="none" stroke="#FFDE59" stroke-width="2.2"/>
    <rect x="6" y="12" width="15" height="14" rx="3.5" fill="#FF90E8" stroke="#111111" stroke-width="2.2"/>
    <rect x="8.5" y="15" width="10" height="3" rx="1.5" fill="#FFFBEB"/>
  `,
  lava: `
    <path d="M12 4 H20 L23 19 L19 24 H13 L9 19 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M12 4 H20 L19 8 H13 Z" fill="#FFDE59" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <path d="M13 8 H19 L22 19 L19 23 H13 L10 19 Z" fill="#2E1065" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="16" cy="16.5" r="3" fill="#FF90E8"/>
    <circle cx="14.5" cy="11.5" r="1.8" fill="#6EE7B7"/>
    <path d="M11 23 H21 L23 28 H9 Z" fill="#FFDE59" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
  `,
  fish: `
    <path d="M22 16 L28 10 V22 Z" fill="#111111" transform="translate(1.5,1.5)"/>
    <ellipse cx="14.5" cy="16" rx="9.5" ry="6.5" fill="#111111" transform="translate(1.5,1.5)"/>
    <path d="M21 16 L28 10 V22 Z" fill="#FF90E8" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <ellipse cx="14" cy="16" rx="9.5" ry="6.5" fill="#38BDF8" stroke="#111111" stroke-width="2.2"/>
    <path d="M13 10.5 Q16 16 13 21.5" fill="none" stroke="#111111" stroke-width="2"/>
    <circle cx="9.5" cy="14.5" r="1.8" fill="#111111"/>
    <circle cx="9.2" cy="14.1" r="0.7" fill="#FFFFFF"/>
  `,
  flame: `
    <path d="M16 3 C23 10 26 16 24 22 C22.5 26.5 19.5 28 16 28 C12.5 28 9.5 26.5 8 22 C6 16 11 11 13 13 C12 9 14 6 16 3 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M16 3 C23 10 26 16 24 22 C22.5 26.5 19.5 28 16 28 C12.5 28 9.5 26.5 8 22 C6 16 11 11 13 13 C12 9 14 6 16 3 Z" fill="#FF6B6B" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M16 12 C19.5 16 20.5 19.5 19.5 23 C18.8 25.5 17.5 26.5 16 26.5 C14.5 26.5 13.2 25.5 12.5 23 C11.5 19.5 13.5 16 16 12 Z" fill="#FFDE59" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
  `,
  bolt: `
    <path d="M18 3 L7 18 H15.5 L13 29 L25 14 H16.5 Z" fill="#111111" transform="translate(1.8,1.8)"/>
    <path d="M18 3 L7 18 H15.5 L13 29 L25 14 H16.5 Z" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
  `,
  bug: `
    <g stroke="#111111" stroke-width="2.2" stroke-linecap="round">
      <line x1="5" y1="13" x2="10" y2="15"/>
      <line x1="4" y1="18" x2="10" y2="18"/>
      <line x1="5" y1="23" x2="10" y2="21"/>
      <line x1="27" y1="13" x2="22" y2="15"/>
      <line x1="28" y1="18" x2="22" y2="18"/>
      <line x1="27" y1="23" x2="22" y2="21"/>
    </g>
    <ellipse cx="16" cy="18.5" rx="7" ry="8" fill="#111111" transform="translate(1.5,1.5)"/>
    <circle cx="16" cy="10" r="4" fill="#111111" stroke="#111111" stroke-width="1.5"/>
    <ellipse cx="16" cy="18.5" rx="7" ry="8" fill="#A3E635" stroke="#111111" stroke-width="2.2"/>
    <line x1="16" y1="11" x2="16" y2="26.5" stroke="#111111" stroke-width="2"/>
    <circle cx="13" cy="16" r="1.4" fill="#111111"/>
    <circle cx="19" cy="16" r="1.4" fill="#111111"/>
    <circle cx="13.5" cy="21" r="1.2" fill="#111111"/>
    <circle cx="18.5" cy="21" r="1.2" fill="#111111"/>
  `,
  paw: `
    <g fill="#111111" transform="translate(1.5,1.5)">
      <ellipse cx="16" cy="20.5" rx="6.5" ry="5.2"/>
      <circle cx="8.5" cy="13.5" r="2.8"/>
      <circle cx="13.5" cy="10" r="2.8"/>
      <circle cx="19" cy="10" r="2.8"/>
      <circle cx="23.5" cy="13.5" r="2.8"/>
    </g>
    <g fill="#FF90E8" stroke="#111111" stroke-width="2">
      <ellipse cx="16" cy="20.5" rx="6.5" ry="5.2"/>
      <circle cx="8.5" cy="13.5" r="2.8"/>
      <circle cx="13.5" cy="10" r="2.8"/>
      <circle cx="19" cy="10" r="2.8"/>
      <circle cx="23.5" cy="13.5" r="2.8"/>
    </g>
  `,
  bulb: `
    <path d="M16 4 A8.5 8.5 0 0 0 11 19.5 L12 23 H20 L21 19.5 A8.5 8.5 0 0 0 16 4 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M16 4 A8.5 8.5 0 0 0 11 19.5 L12 23 H20 L21 19.5 A8.5 8.5 0 0 0 16 4 Z" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="12" y="23" width="8" height="4" rx="1.5" fill="#C4B5FD" stroke="#111111" stroke-width="2"/>
    <path d="M14 14 L16 11 L18 14" fill="none" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  dice: `
    <rect x="5" y="5" width="21" height="21" rx="4.5" fill="#111111" transform="translate(2,2)"/>
    <rect x="5" y="5" width="21" height="21" rx="4.5" fill="#6EE7B7" stroke="#111111" stroke-width="2.2"/>
    <circle cx="10.5" cy="10.5" r="2" fill="#111111"/>
    <circle cx="20.5" cy="10.5" r="2" fill="#111111"/>
    <circle cx="15.5" cy="15.5" r="2.2" fill="#FF6B6B" stroke="#111111" stroke-width="1.2"/>
    <circle cx="10.5" cy="20.5" r="2" fill="#111111"/>
    <circle cx="20.5" cy="20.5" r="2" fill="#111111"/>
  `,
  lock: `
    <rect x="7" y="14" width="18" height="14" rx="3.5" fill="#111111" transform="translate(1.8,1.8)"/>
    <path d="M11 14 V10 A5 5 0 0 1 21 10 V14" fill="none" stroke="#111111" stroke-width="4.2"/>
    <path d="M11 14 V10 A5 5 0 0 1 21 10 V14" fill="none" stroke="#C4B5FD" stroke-width="2.2"/>
    <rect x="7" y="14" width="18" height="14" rx="3.5" fill="#FFDE59" stroke="#111111" stroke-width="2.2"/>
    <circle cx="16" cy="20" r="2.2" fill="#111111"/>
    <path d="M16 21.5 V24.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
  `,
  target: `
    <circle cx="16" cy="16" r="11.5" fill="#111111" transform="translate(1.8,1.8)"/>
    <circle cx="16" cy="16" r="11.5" fill="#FF6B6B" stroke="#111111" stroke-width="2.2"/>
    <circle cx="16" cy="16" r="7.5" fill="#F8FAFC" stroke="#111111" stroke-width="2"/>
    <circle cx="16" cy="16" r="3.6" fill="#FFDE59" stroke="#111111" stroke-width="2"/>
  `,
  trophy: `
    <path d="M9 5 H23 V14 A7 7 0 0 1 9 14 Z" fill="#111111" transform="translate(1.8,1.8)"/>
    <path d="M9 7 H5 V12 A4 4 0 0 0 9 15 M23 7 H27 V12 A4 4 0 0 1 23 15" fill="none" stroke="#111111" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M9 5 H23 V14 A7 7 0 0 1 9 14 Z" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="14" y="20" width="4" height="5" fill="#F59E0B" stroke="#111111" stroke-width="2"/>
    <rect x="9" y="24" width="14" height="4" rx="1.5" fill="#C4B5FD" stroke="#111111" stroke-width="2"/>
  `,
  grad: `
    <polygon points="16,5 30,12 16,19 2,12" fill="#111111" transform="translate(1.6,1.8)"/>
    <path d="M8 15 V22 C8 25 24 25 24 22 V15" fill="#242034" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polygon points="16,5 30,12 16,19 2,12" fill="#C4B5FD" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M26 14 V23" stroke="#FFDE59" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="26" cy="24" r="2" fill="#FFDE59" stroke="#111111" stroke-width="1.4"/>
  `,
  party: `
    <polygon points="6,26 14,9 23,18" fill="#111111" transform="translate(1.6,1.6)"/>
    <polygon points="6,26 14,9 23,18" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M10 18 L18 21" stroke="#FF6B6B" stroke-width="2.5"/>
    <circle cx="20" cy="7" r="2.2" fill="#FF90E8" stroke="#111111" stroke-width="1.5"/>
    <circle cx="26" cy="12" r="2" fill="#6EE7B7" stroke="#111111" stroke-width="1.5"/>
    <circle cx="13" cy="5" r="1.8" fill="#38BDF8" stroke="#111111" stroke-width="1.4"/>
  `,
  python: `
    <g fill="#111111" transform="translate(1.8,1.8)">
      <path d="M10 9.5 H15.5 V11 H9.5 C6 11 4.5 13 4.5 16.5 C4.5 20 6 21.5 9.5 21.5 H11.5 V18 C11.5 15.5 13.2 14 15.8 14 H21.5 C23.2 14 24.5 12.7 24.5 11 V7.5 C24.5 5.2 22 4 17.2 4 C12.5 4 10 5.2 10 7.5 Z"/>
      <path d="M22 22.5 H16.5 V21 H22.5 C26 21 27.5 19 27.5 15.5 C27.5 12 26 10.5 22.5 10.5 H20.5 V14 C20.5 16.5 18.8 18 16.2 18 H10.5 C8.8 18 7.5 19.3 7.5 21 V24.5 C7.5 26.8 10 28 14.8 28 C19.5 28 22 26.8 22 24.5 Z"/>
    </g>
    <path d="M10 9.5 H15.5 V11 H9.5 C6 11 4.5 13 4.5 16.5 C4.5 20 6 21.5 9.5 21.5 H11.5 V18 C11.5 15.5 13.2 14 15.8 14 H21.5 C23.2 14 24.5 12.7 24.5 11 V7.5 C24.5 5.2 22 4 17.2 4 C12.5 4 10 5.2 10 7.5 Z" fill="#38BDF8" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <path d="M22 22.5 H16.5 V21 H22.5 C26 21 27.5 19 27.5 15.5 C27.5 12 26 10.5 22.5 10.5 H20.5 V14 C20.5 16.5 18.8 18 16.2 18 H10.5 C8.8 18 7.5 19.3 7.5 21 V24.5 C7.5 26.8 10 28 14.8 28 C19.5 28 22 26.8 22 24.5 Z" fill="#FFDE59" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="13.5" cy="7.3" r="1.4" fill="#111111"/>
    <circle cx="18.5" cy="24.7" r="1.4" fill="#111111"/>
  `,
  algo: `
    <g fill="#111111" transform="translate(1.6,1.6)">
      <circle cx="16" cy="7.5" r="4"/>
      <circle cx="7.5" cy="17" r="3.8"/>
      <circle cx="24.5" cy="17" r="3.8"/>
      <circle cx="16" cy="25.5" r="3.8"/>
    </g>
    <line x1="16" y1="7.5" x2="7.5" y2="17" stroke="#111111" stroke-width="3.2" stroke-linecap="round"/>
    <line x1="16" y1="7.5" x2="24.5" y2="17" stroke="#111111" stroke-width="3.2" stroke-linecap="round"/>
    <line x1="7.5" y1="17" x2="24.5" y2="17" stroke="#111111" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="7.5" y1="17" x2="16" y2="25.5" stroke="#111111" stroke-width="3.2" stroke-linecap="round"/>
    <line x1="24.5" y1="17" x2="16" y2="25.5" stroke="#111111" stroke-width="3.2" stroke-linecap="round"/>
    <line x1="16" y1="7.5" x2="7.5" y2="17" stroke="#B8FF3B" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="7.5" y1="17" x2="16" y2="25.5" stroke="#B8FF3B" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="16" cy="7.5" r="4" fill="#B8FF3B" stroke="#111111" stroke-width="2"/>
    <circle cx="7.5" cy="17" r="3.8" fill="#C4B5FD" stroke="#111111" stroke-width="2"/>
    <circle cx="24.5" cy="17" r="3.8" fill="#38BDF8" stroke="#111111" stroke-width="2"/>
    <circle cx="16" cy="25.5" r="3.8" fill="#FFDE59" stroke="#111111" stroke-width="2"/>
    <circle cx="15" cy="6.6" r="1.1" fill="#FFFFFF"/>
  `,
  search: `
    <circle cx="14" cy="14" r="8.5" fill="#111111" transform="translate(1.6,1.6)"/>
    <line x1="20" y1="20" x2="27" y2="27" stroke="#111111" stroke-width="5.5" stroke-linecap="round" transform="translate(1.5,1.5)"/>
    <line x1="20" y1="20" x2="27" y2="27" stroke="#FF6B6B" stroke-width="4" stroke-linecap="round"/>
    <circle cx="14" cy="14" r="8.5" fill="#38BDF8" stroke="#111111" stroke-width="2.2"/>
    <path d="M10.5 11 A4.5 4.5 0 0 1 16.5 9.5" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  `,
  arch: `
    <polygon points="16,4 28,11 4,11" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="5" y="24" width="22" height="4" rx="1" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="7.5" y="11" width="3.5" height="13" fill="#C4B5FD" stroke="#111111" stroke-width="1.8"/>
    <rect x="14.2" y="11" width="3.5" height="13" fill="#C4B5FD" stroke="#111111" stroke-width="1.8"/>
    <rect x="21" y="11" width="3.5" height="13" fill="#C4B5FD" stroke="#111111" stroke-width="1.8"/>
    <polygon points="16,4 28,11 4,11" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="5" y="24" width="22" height="4" rx="1" fill="#6EE7B7" stroke="#111111" stroke-width="2"/>
  `,
  headphones: `
    <path d="M6 18 V15 A10 10 0 0 1 26 15 V18" fill="none" stroke="#111111" stroke-width="4.5" stroke-linecap="round" transform="translate(1.5,1.5)"/>
    <path d="M6 18 V15 A10 10 0 0 1 26 15 V18" fill="none" stroke="#C4B5FD" stroke-width="2.8" stroke-linecap="round"/>
    <rect x="4" y="15" width="5.5" height="10" rx="2.5" fill="#FF90E8" stroke="#111111" stroke-width="2"/>
    <rect x="22.5" y="15" width="5.5" height="10" rx="2.5" fill="#FF90E8" stroke="#111111" stroke-width="2"/>
  `,
  chat: `
    <path d="M5 7 H27 A2 2 0 0 1 29 9 V20 A2 2 0 0 1 27 22 H14 L8 27 V22 H5 A2 2 0 0 1 3 20 V9 A2 2 0 0 1 5 7 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M5 7 H27 A2 2 0 0 1 29 9 V20 A2 2 0 0 1 27 22 H14 L8 27 V22 H5 A2 2 0 0 1 3 20 V9 A2 2 0 0 1 5 7 Z" fill="#6EE7B7" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="11" cy="14.5" r="1.8" fill="#111111"/>
    <circle cx="16" cy="14.5" r="1.8" fill="#111111"/>
    <circle cx="21" cy="14.5" r="1.8" fill="#111111"/>
  `,
  medal: `
    <polygon points="10,4 16,13 13,13 7,4" fill="#FF6B6B" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
    <polygon points="22,4 16,13 19,13 25,4" fill="#38BDF8" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="16" cy="19.5" r="7.5" fill="#111111" transform="translate(1.6,1.6)"/>
    <circle cx="16" cy="19.5" r="7.5" fill="#FFDE59" stroke="#111111" stroke-width="2.2"/>
    <circle cx="16" cy="19.5" r="3.5" fill="#F59E0B" stroke="#111111" stroke-width="1.5"/>
  `,
  floppy: `
    <path d="M6 5 H23 L27 9 V26 H6 Z" fill="#111111" transform="translate(1.8,1.8)"/>
    <path d="M6 5 H23 L27 9 V26 H6 Z" fill="#C4B5FD" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="10" y="5" width="10" height="7" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <rect x="9.5" y="16" width="13" height="10" fill="#F8FAFC" stroke="#111111" stroke-width="1.8"/>
  `,
  book: `
    <path d="M4 7 Q10 5 16 8 Q22 5 28 7 V24 Q22 22 16 25 Q10 22 4 24 Z" fill="#111111" transform="translate(1.6,1.8)"/>
    <path d="M4 7 Q10 5 16 8 Q22 5 28 7 V24 Q22 22 16 25 Q10 22 4 24 Z" fill="#F8FAFC" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <line x1="16" y1="8" x2="16" y2="25" stroke="#111111" stroke-width="2.2"/>
    <rect x="18.5" y="7" width="3.5" height="9" fill="#FF90E8" stroke="#111111" stroke-width="1.5"/>
  `,
  brain: `
    <path d="M16 7 C11 6 7 10 8 15 C6 18 8 23 13 23 H16 V7 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M16 7 C21 6 25 10 24 15 C26 18 24 23 19 23 H16 V7 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M16 7 C11 6 7 10 8 15 C6 18 8 23 13 23 H16 V7 Z" fill="#FF90E8" stroke="#111111" stroke-width="2.1" stroke-linejoin="round"/>
    <path d="M16 7 C21 6 25 10 24 15 C26 18 24 23 19 23 H16 V7 Z" fill="#C4B5FD" stroke="#111111" stroke-width="2.1" stroke-linejoin="round"/>
  `,
  sparkles: `
    <path d="M14 4 L16.5 11.5 L24 14 L16.5 16.5 L14 24 L11.5 16.5 L4 14 L11.5 11.5 Z" fill="#111111" transform="translate(1.5,1.5)"/>
    <path d="M14 4 L16.5 11.5 L24 14 L16.5 16.5 L14 24 L11.5 16.5 L4 14 L11.5 11.5 Z" fill="#FFDE59" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="24.5" cy="7.5" r="2.5" fill="#6EE7B7" stroke="#111111" stroke-width="1.6"/>
    <circle cx="24" cy="23.5" r="2" fill="#FF90E8" stroke="#111111" stroke-width="1.5"/>
  `,
  swords: `
    <path d="M6 6 L25 25 M26 6 L7 25" stroke="#111111" stroke-width="5" stroke-linecap="round" transform="translate(1.4,1.4)"/>
    <path d="M6 6 L22 22 M26 6 L10 22" stroke="#F8FAFC" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="24" cy="24" r="2.8" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <circle cx="8" cy="24" r="2.8" fill="#FF6B6B" stroke="#111111" stroke-width="1.8"/>
  `,
  toolbox: `
    <rect x="4" y="11" width="24" height="15" rx="3" fill="#111111" transform="translate(1.8,1.8)"/>
    <path d="M11 11 V8 H21 V11" fill="none" stroke="#111111" stroke-width="2.4"/>
    <rect x="4" y="11" width="24" height="15" rx="3" fill="#FF6B6B" stroke="#111111" stroke-width="2.2"/>
    <line x1="4" y1="18" x2="28" y2="18" stroke="#111111" stroke-width="2"/>
    <rect x="13" y="15.5" width="6" height="5" rx="1" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
  `,
  warning: `
    <polygon points="16,4 29,26 3,26" fill="#111111" transform="translate(1.8,1.8)"/>
    <polygon points="16,4 29,26 3,26" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <line x1="16" y1="11.5" x2="16" y2="18.5" stroke="#111111" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="16" cy="22.2" r="1.5" fill="#111111"/>
  `,
  cloud: `
    <path d="M9 22 H23.5 A4.5 4.5 0 0 0 24 13 A6 6 0 0 0 12 11.5 A5 5 0 0 0 9 22 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M9 22 H23.5 A4.5 4.5 0 0 0 24 13 A6 6 0 0 0 12 11.5 A5 5 0 0 0 9 22 Z" fill="#38BDF8" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
  `,
  gift: `
    <rect x="6" y="12" width="20" height="15" rx="2.5" fill="#111111" transform="translate(1.8,1.8)"/>
    <rect x="6" y="12" width="20" height="15" rx="2.5" fill="#FF90E8" stroke="#111111" stroke-width="2.2"/>
    <rect x="14" y="12" width="4" height="15" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <rect x="5" y="9" width="22" height="5" rx="1.5" fill="#FFDE59" stroke="#111111" stroke-width="2"/>
  `,
  share: `
    <rect x="6" y="15" width="20" height="11" rx="2.5" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="6" y="15" width="20" height="11" rx="2.5" fill="#6EE7B7" stroke="#111111" stroke-width="2.2"/>
    <path d="M16 19 V5 M11 10 L16 5 L21 10" fill="none" stroke="#111111" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  sound_on: `
    <polygon points="6,13 12,13 18,7 18,25 12,19 6,19" fill="#111111" transform="translate(1.5,1.5)"/>
    <polygon points="6,13 12,13 18,7 18,25 12,19 6,19" fill="#6EE7B7" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M22 12 A5 5 0 0 1 22 20 M25 9 A9 9 0 0 1 25 23" fill="none" stroke="#FFDE59" stroke-width="2.4" stroke-linecap="round"/>
  `,
  sound_off: `
    <polygon points="6,13 12,13 18,7 18,25 12,19 6,19" fill="#111111" transform="translate(1.5,1.5)"/>
    <polygon points="6,13 12,13 18,7 18,25 12,19 6,19" fill="#FF6B6B" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M22 13 L27 19 M27 13 L22 19" stroke="#FFDE59" stroke-width="2.4" stroke-linecap="round"/>
  `,
  gem: `
    <polygon points="10,6 22,6 28,13 16,27 4,13" fill="#111111" transform="translate(1.6,1.6)"/>
    <polygon points="10,6 22,6 28,13 16,27 4,13" fill="#38BDF8" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polyline points="4,13 28,13" stroke="#111111" stroke-width="1.8"/>
    <polyline points="10,6 16,27 22,6" fill="none" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
  `,
  shield: `
    <path d="M16 4 L26 8 V16 C26 22 21 26 16 28 C11 26 6 22 6 16 V8 Z" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M16 4 L26 8 V16 C26 22 21 26 16 28 C11 26 6 22 6 16 V8 Z" fill="#6EE7B7" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M16 6 V26" stroke="#111111" stroke-width="1.8"/>
  `,
  lab: `
    <path d="M13 5 H19 M14 5 V12 L7 25 A2 2 0 0 0 9 27 H23 A2 2 0 0 0 25 25 L18 12 V5" fill="#111111" transform="translate(1.6,1.6)"/>
    <path d="M14 5 V12 L7 25 A2 2 0 0 0 9 27 H23 A2 2 0 0 0 25 25 L18 12 V5 Z" fill="#F8FAFC" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M10 19 H22 L24.5 25.5 H7.5 Z" fill="#A3E635" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
  `,
  scissors: `
    <circle cx="9" cy="22" r="4" fill="#FF90E8" stroke="#111111" stroke-width="2.2"/>
    <circle cx="23" cy="22" r="4" fill="#FF90E8" stroke="#111111" stroke-width="2.2"/>
    <path d="M12 19 L24 6 M20 19 L8 6" stroke="#111111" stroke-width="2.6" stroke-linecap="round"/>
  `,
  scale: `
    <line x1="16" y1="5" x2="16" y2="26" stroke="#111111" stroke-width="2.6" stroke-linecap="round"/>
    <line x1="6" y1="10" x2="26" y2="10" stroke="#111111" stroke-width="2.4" stroke-linecap="round"/>
    <polygon points="7,18 3,18 5,11" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <polygon points="29,18 25,18 27,11" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <rect x="10" y="25" width="12" height="3" rx="1" fill="#C4B5FD" stroke="#111111" stroke-width="1.8"/>
  `,
  broom: `
    <line x1="23" y1="5" x2="14" y2="17" stroke="#111111" stroke-width="3" stroke-linecap="round"/>
    <polygon points="11,15 18,20 12,27 5,22" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
  `,
  stretch: `
    <circle cx="16" cy="16" r="10" fill="#111111" transform="translate(1.6,1.6)"/>
    <circle cx="16" cy="16" r="10" fill="#6EE7B7" stroke="#111111" stroke-width="2.2"/>
    <path d="M11 18 Q16 10 21 18" fill="none" stroke="#111111" stroke-width="2.4" stroke-linecap="round"/>
  `,
  boom: `
    <polygon points="16,3 20,10 28,8 23,15 29,22 20,21 17,29 13,21 4,23 9,15 4,8 12,10" fill="#111111" transform="translate(1.6,1.6)"/>
    <polygon points="16,3 20,10 28,8 23,15 29,22 20,21 17,29 13,21 4,23 9,15 4,8 12,10" fill="#FF6B6B" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="16" r="4.5" fill="#FFDE59" stroke="#111111" stroke-width="1.6"/>
  `,
  briefcase: `
    <rect x="4" y="10" width="24" height="16" rx="3" fill="#111111" transform="translate(1.8,1.8)"/>
    <path d="M11 10 V7 H21 V10" fill="none" stroke="#111111" stroke-width="2.2"/>
    <rect x="4" y="10" width="24" height="16" rx="3" fill="#C4B5FD" stroke="#111111" stroke-width="2.2"/>
    <rect x="13" y="15" width="6" height="4" rx="1" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
  `,
  eye: `
    <path d="M3 16 Q16 6 29 16 Q16 26 3 16 Z" fill="#111111" transform="translate(1.5,1.5)"/>
    <path d="M3 16 Q16 6 29 16 Q16 26 3 16 Z" fill="#F8FAFC" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="16" cy="16" r="4.5" fill="#6EE7B7" stroke="#111111" stroke-width="2"/>
    <circle cx="16" cy="16" r="1.8" fill="#111111"/>
  `,
  puzzle: `
    <rect x="6" y="6" width="20" height="20" rx="4" fill="#111111" transform="translate(1.8,1.8)"/>
    <rect x="6" y="6" width="20" height="20" rx="4" fill="#A3E635" stroke="#111111" stroke-width="2.2"/>
    <circle cx="16" cy="6" r="3.2" fill="#A3E635" stroke="#111111" stroke-width="2"/>
    <circle cx="26" cy="16" r="3.2" fill="#A3E635" stroke="#111111" stroke-width="2"/>
  `,
  point_right: `
    <rect x="4" y="11" width="16" height="10" rx="3" fill="#111111" transform="translate(1.5,1.5)"/>
    <polygon points="18,8 28,16 18,24" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="4" y="11" width="15" height="10" rx="3" fill="#FFDE59" stroke="#111111" stroke-width="2.2"/>
  `,
  moon: `
    <path d="M21 6 A10 10 0 1 0 26 21 A8 8 0 0 1 21 6 Z" fill="#111111" transform="translate(1.5,1.5)"/>
    <path d="M21 6 A10 10 0 1 0 26 21 A8 8 0 0 1 21 6 Z" fill="#C4B5FD" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
  `,
  sun: `
    <circle cx="16" cy="16" r="6.5" fill="#111111" transform="translate(1.5,1.5)"/>
    <circle cx="16" cy="16" r="6.5" fill="#FFDE59" stroke="#111111" stroke-width="2.2"/>
    <g stroke="#111111" stroke-width="2.2" stroke-linecap="round">
      <line x1="16" y1="4" x2="16" y2="6.5"/>
      <line x1="16" y1="25.5" x2="16" y2="28"/>
      <line x1="4" y1="16" x2="6.5" y2="16"/>
      <line x1="25.5" y1="16" x2="28" y2="16"/>
    </g>
  `,
  keyboard: `
    <rect x="3" y="9" width="26" height="15" rx="3" fill="#111111" transform="translate(1.8,1.8)"/>
    <rect x="3" y="9" width="26" height="15" rx="3" fill="#C4B5FD" stroke="#111111" stroke-width="2.2"/>
    <rect x="6.5" y="12.5" width="3" height="2.8" rx="0.8" fill="#FFDE59"/>
    <rect x="11.5" y="12.5" width="3" height="2.8" rx="0.8" fill="#111111"/>
    <rect x="16.5" y="12.5" width="3" height="2.8" rx="0.8" fill="#111111"/>
    <rect x="21.5" y="12.5" width="4" height="2.8" rx="0.8" fill="#FF90E8"/>
    <rect x="9" y="18" width="14" height="3" rx="1" fill="#6EE7B7" stroke="#111111" stroke-width="1.2"/>
  `,
  timer: `
    <circle cx="16" cy="17.5" r="10" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="13" y="3.5" width="6" height="3" rx="1" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <circle cx="16" cy="17.5" r="10" fill="#F8FAFC" stroke="#111111" stroke-width="2.2"/>
    <polyline points="16,12 16,17.5 20.5,19.5" fill="none" stroke="#FF6B6B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  check_box: `
    <rect x="5" y="5" width="22" height="22" rx="4" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="5" y="5" width="22" height="22" rx="4" fill="#A3E635" stroke="#111111" stroke-width="2.2"/>
    <polyline points="10,16.5 14.5,21 22,11.5" fill="none" stroke="#111111" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  cross_box: `
    <rect x="5" y="5" width="22" height="22" rx="4" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="5" y="5" width="22" height="22" rx="4" fill="#FF6B6B" stroke="#111111" stroke-width="2.2"/>
    <path d="M11 11 L21 21 M21 11 L11 21" stroke="#111111" stroke-width="2.6" stroke-linecap="round"/>
  `,
  yellow_box: `
    <rect x="5" y="5" width="22" height="22" rx="4" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="5" y="5" width="22" height="22" rx="4" fill="#FFDE59" stroke="#111111" stroke-width="2.2"/>
  `,
  star: `
    <polygon points="16,4 19.6,11.6 28,12.8 22,18.7 23.4,27 16,23.1 8.6,27 10,18.7 4,12.8 12.4,11.6" fill="#111111" transform="translate(1.8,1.8)"/>
    <polygon points="16,4 19.6,11.6 28,12.8 22,18.7 23.4,27 16,23.1 8.6,27 10,18.7 4,12.8 12.4,11.6" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="16" cy="16.5" r="2.6" fill="#FFFBEB" stroke="#111111" stroke-width="1.4"/>
  `,
  terminal: `
    <rect x="4" y="6" width="24" height="20" rx="4" fill="#111111" transform="translate(1.8,1.8)"/>
    <rect x="4" y="6" width="24" height="20" rx="4" fill="#1A1A18" stroke="#111111" stroke-width="2.2"/>
    <rect x="4" y="6" width="24" height="6" rx="3" fill="#2E2E2A" stroke="#111111" stroke-width="2"/>
    <circle cx="8" cy="9" r="1.2" fill="#FF6B6B"/>
    <circle cx="11.5" cy="9" r="1.2" fill="#FFDE59"/>
    <circle cx="15" cy="9" r="1.2" fill="#A3E635"/>
    <polyline points="9,16.5 13,19.5 9,22.5" fill="none" stroke="#B8FF3B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="15.5" y1="22.5" x2="22.5" y2="22.5" stroke="#B8FF3B" stroke-width="2.4" stroke-linecap="round"/>
  `,
  practice_1: `
    <rect x="4" y="4" width="24" height="24" rx="6" fill="#111111" transform="translate(1.8,1.8)"/>
    <rect x="4" y="4" width="24" height="24" rx="6" fill="#6EE7B7" stroke="#111111" stroke-width="2.2"/>
    <polyline points="12.5,11 8.5,16 12.5,21" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="19.5,11 23.5,16 19.5,21" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="16" cy="16" r="2.2" fill="#FFDE59" stroke="#111111" stroke-width="1.5"/>
  `,
  practice_2: `
    <polygon points="16,3 28.5,16 16,29 3.5,16" fill="#111111" transform="translate(1.8,1.8)"/>
    <polygon points="16,3 28.5,16 16,29 3.5,16" fill="#38BDF8" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polyline points="10.5,12 15.5,16 10.5,20" fill="none" stroke="#111111" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="16.5,12 21.5,16 16.5,20" fill="none" stroke="#B8FF3B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  practice_3: `
    <polygon points="16,3 27,9.2 27,22.8 16,29 5,22.8 5,9.2" fill="#111111" transform="translate(1.8,1.8)"/>
    <polygon points="16,3 27,9.2 27,22.8 16,29 5,22.8 5,9.2" fill="#C4B5FD" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polygon points="17.5,7.5 11,17 15.8,17 14,24.5 21.5,14.5 16.5,14.5" fill="#FFDE59" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
  `,
  practice_4: `
    <path d="M5 7 H27 V17 C27 23 16 29 16 29 C16 29 5 23 5 17 Z" fill="#111111" transform="translate(1.8,1.8)"/>
    <path d="M5 7 H27 V17 C27 23 16 29 16 29 C16 29 5 23 5 17 Z" fill="#FF6B6B" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polygon points="10,12 13,8.5 16,12 19,8.5 22,12 21,17 11,17" fill="#FFDE59" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
    <polygon points="16,19.5 19.2,22 16,25 12.8,22" fill="#FFFBEB" stroke="#111111" stroke-width="1.5" stroke-linejoin="round"/>
  `,
  devlearn_logo: `
    <rect x="3" y="5" width="26" height="22" rx="5" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="3" y="5" width="26" height="22" rx="5" fill="#B8FF3B" stroke="#111111" stroke-width="2.2"/>
    <rect x="6" y="8" width="20" height="16" rx="2.5" fill="#18181B" stroke="#111111" stroke-width="1.6"/>
    <polyline points="9.5,12.5 14,16 9.5,19.5" fill="none" stroke="#B8FF3B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="16" y1="19.5" x2="22" y2="19.5" stroke="#FFDE59" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="22.5" cy="11.5" r="1.6" fill="#FF90E8"/>
  `,
  menu_coding: `
    <polygon points="16,4 27,10 16,16 5,10" fill="#6EE7B7" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="5,10 16,16 16,28 5,22" fill="#38BDF8" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="27,10 16,16 16,28 27,22" fill="#C4B5FD" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
  `,
  menu_account_rank: `
    <polygon points="16,3 27,8.5 25,22 16,29 7,22 5,8.5" fill="#111111" transform="translate(1.6,1.6)"/>
    <polygon points="16,3 27,8.5 25,22 16,29 7,22 5,8.5" fill="#C4B5FD" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polyline points="11,18 16,12.5 21,18" fill="none" stroke="#FFDE59" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="11,22.5 16,17 21,22.5" fill="none" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="16" cy="8.5" r="2" fill="#FFDE59" stroke="#111111" stroke-width="1.4"/>
  `,
  menu_settings: `
    <path d="M13.5 4 H18.5 L19.4 7.2 A9 9 0 0 1 22.1 8.4 L25 6.8 L28.2 10 L26.5 12.9 A9 9 0 0 1 27.7 15.6 L30 16.5 V21.5 L27.7 22.4 A9 9 0 0 1 26.5 25.1 L28.2 28 L25 31.2 L22.1 29.5 A9 9 0 0 1 19.4 30.7 L18.5 33 H13.5" fill="none"/>
    <circle cx="16" cy="16" r="10.5" fill="#111111" transform="translate(1.5,1.5)"/>
    <path d="M14 4 H18 L19 7.2 L22.2 8.5 L25.2 6.8 L28 9.6 L26.3 12.6 L27.6 15.8 L30.8 16.8 V20.8 L27.6 21.8 L26.3 25 L28 28 L25.2 30.8" fill="none"/>
    <circle cx="16" cy="16" r="10" fill="#38BDF8" stroke="#111111" stroke-width="2.2"/>
    <g stroke="#111111" stroke-width="3" stroke-linecap="round">
      <line x1="16" y1="3.5" x2="16" y2="6.2"/>
      <line x1="16" y1="25.8" x2="16" y2="28.5"/>
      <line x1="3.5" y1="16" x2="6.2" y2="16"/>
      <line x1="25.8" y1="16" x2="28.5" y2="16"/>
      <line x1="7.2" y1="7.2" x2="9.1" y2="9.1"/>
      <line x1="22.9" y1="22.9" x2="24.8" y2="24.8"/>
      <line x1="24.8" y1="7.2" x2="22.9" y2="9.1"/>
      <line x1="9.1" y1="22.9" x2="7.2" y2="24.8"/>
    </g>
    <circle cx="16" cy="16" r="4.5" fill="#FFDE59" stroke="#111111" stroke-width="2"/>
  `,
  pro_member: `
    <polygon points="16,2 28,9 26,23 16,30 6,23 4,9" fill="#111111" transform="translate(1.8,1.8)"/>
    <polygon points="16,2 28,9 26,23 16,30 6,23 4,9" fill="#FFDE59" stroke="#111111" stroke-width="2.1" stroke-linejoin="round"/>
    <polygon points="16,2 28,9 16,15 4,9" fill="#FF90E8" stroke="#111111" stroke-width="1.6" stroke-linejoin="round"/>
    <polygon points="4,9 16,15 16,30 6,23" fill="#38BDF8" stroke="#111111" stroke-width="1.6" stroke-linejoin="round"/>
    <polygon points="16,8.5 22,15.5 16,23.5 10,15.5" fill="#111111" stroke="#111111" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="16,10.2 19.6,15.5 16,21.5 12.4,15.5" fill="#B8FF3B"/>
    <circle cx="16" cy="5.8" r="1.4" fill="#FFFFFF" stroke="#111111" stroke-width="1"/>
    <path d="M25.5 4.2 L26.5 6 L28.3 7 L26.5 8 L25.5 9.8 L24.5 8 L22.7 7 L24.5 6 Z" fill="#FFFFFF" stroke="#111111" stroke-width="0.9" stroke-linejoin="round"/>
  `,
  nav_skillmap: `
    <line x1="8" y1="24" x2="16" y2="16" stroke="#111111" stroke-width="3" stroke-linecap="round"/>
    <line x1="16" y1="16" x2="24" y2="8" stroke="#111111" stroke-width="3" stroke-linecap="round"/>
    <line x1="16" y1="16" x2="24" y2="23" stroke="#111111" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="8" cy="24" r="4.2" fill="#6EE7B7" stroke="#111111" stroke-width="2"/>
    <circle cx="16" cy="16" r="4.2" fill="#38BDF8" stroke="#111111" stroke-width="2"/>
    <circle cx="24" cy="8" r="4.5" fill="#FFDE59" stroke="#111111" stroke-width="2"/>
    <circle cx="24" cy="23" r="3.5" fill="#FF90E8" stroke="#111111" stroke-width="2"/>
  `,
  nav_studio: `
    <rect x="3" y="5" width="26" height="22" rx="4" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="3" y="5" width="26" height="22" rx="4" fill="#1A1A1E" stroke="#111111" stroke-width="2.2"/>
    <rect x="3" y="5" width="26" height="6.5" rx="3" fill="#38BDF8" stroke="#111111" stroke-width="2"/>
    <line x1="8" y1="16.5" x2="17" y2="16.5" stroke="#B8FF3B" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="8" y1="21.5" x2="14" y2="21.5" stroke="#FFDE59" stroke-width="2.4" stroke-linecap="round"/>
    <polygon points="20,15 26,18.5 20,22" fill="#B8FF3B" stroke="#111111" stroke-width="1.4" stroke-linejoin="round"/>
  `,
  nav_bughunt: `
    <circle cx="16" cy="16" r="11" fill="#111111" transform="translate(1.5,1.5)"/>
    <circle cx="16" cy="16" r="11" fill="#FF6B6B" stroke="#111111" stroke-width="2.2"/>
    <circle cx="16" cy="16" r="6" fill="#1A1A1E" stroke="#111111" stroke-width="1.8"/>
    <circle cx="16" cy="16" r="2.6" fill="#FFDE59"/>
    <g stroke="#111111" stroke-width="2.2" stroke-linecap="round">
      <line x1="16" y1="3" x2="16" y2="7.5"/>
      <line x1="16" y1="24.5" x2="16" y2="29"/>
      <line x1="3" y1="16" x2="7.5" y2="16"/>
      <line x1="24.5" y1="16" x2="29" y2="16"/>
    </g>
  `,
  nav_blitz: `
    <circle cx="15" cy="17" r="10.5" fill="#111111" transform="translate(1.5,1.5)"/>
    <rect x="12" y="3.5" width="6" height="3" rx="1" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <circle cx="15" cy="17" r="10.5" fill="#B8FF3B" stroke="#111111" stroke-width="2.2"/>
    <polygon points="16.5,9.5 11,17.5 15.2,17.5 13.5,24.5 20,15.5 15.8,15.5" fill="#FFDE59" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
    <polygon points="24,6 28,9.5 24,12.5" fill="#FF90E8" stroke="#111111" stroke-width="1.4" stroke-linejoin="round"/>
  `,
  nav_algolab: `
    <rect x="4" y="5" width="24" height="22" rx="4" fill="#111111" transform="translate(1.5,1.5)"/>
    <rect x="4" y="5" width="24" height="22" rx="4" fill="#C4B5FD" stroke="#111111" stroke-width="2.2"/>
    <rect x="7.5" y="16" width="4" height="8" rx="1" fill="#38BDF8" stroke="#111111" stroke-width="1.5"/>
    <rect x="14" y="10" width="4" height="14" rx="1" fill="#FFDE59" stroke="#111111" stroke-width="1.5"/>
    <rect x="20.5" y="13" width="4" height="11" rx="1" fill="#B8FF3B" stroke="#111111" stroke-width="1.5"/>
  `,
  nav_showcase: `
    <rect x="5" y="4" width="22" height="24" rx="4" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="5" y="4" width="22" height="24" rx="4" fill="#FFDE59" stroke="#111111" stroke-width="2.2"/>
    <rect x="9" y="8" width="14" height="6" rx="1.5" fill="#38BDF8" stroke="#111111" stroke-width="1.6"/>
    <line x1="9" y1="18" x2="23" y2="18" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="9" y1="22.5" x2="18" y2="22.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
  `,
  nav_achievements: `
    <polygon points="16,4 25,9 25,18 16,28 7,18 7,9" fill="#111111" transform="translate(1.5,1.5)"/>
    <polygon points="16,4 25,9 25,18 16,28 7,18 7,9" fill="#6EE7B7" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polygon points="16,9.5 18,13.8 22.5,14.5 19.2,17.6 20,22 16,19.8 12,22 12.8,17.6 9.5,14.5 14,13.8" fill="#FFDE59" stroke="#111111" stroke-width="1.6" stroke-linejoin="round"/>
  `,
  free_preview: `
    <rect x="3" y="6" width="26" height="20" rx="4.5" fill="#111111" transform="translate(1.6,1.6)"/>
    <rect x="3" y="6" width="26" height="20" rx="4.5" fill="#FFDE59" stroke="#111111" stroke-width="2.1"/>
    <rect x="6.5" y="9.5" width="19" height="13" rx="2.5" fill="#1A1A1E" stroke="#111111" stroke-width="1.5"/>
    <polygon points="13,12.2 21,16 13,19.8" fill="#B8FF3B" stroke="#38BDF8" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M25.5 3 L26.5 5 L28.5 6 L26.5 7 L25.5 9 L24.5 7 L22.5 6 L24.5 5 Z" fill="#FF90E8" stroke="#111111" stroke-width="1" stroke-linejoin="round"/>
  `,
  crt_ch_kernel: `
    <g stroke="#111111" stroke-width="2" stroke-linecap="round">
      <line x1="11" y1="3.5" x2="11" y2="6.5"/>
      <line x1="16" y1="3.5" x2="16" y2="6.5"/>
      <line x1="21" y1="3.5" x2="21" y2="6.5"/>
      <line x1="11" y1="25.5" x2="11" y2="28.5"/>
      <line x1="16" y1="25.5" x2="16" y2="28.5"/>
      <line x1="21" y1="25.5" x2="21" y2="28.5"/>
    </g>
    <rect x="6" y="6.5" width="20" height="19" rx="4" fill="#111111" transform="translate(1.4,1.4)"/>
    <rect x="6" y="6.5" width="20" height="19" rx="4" fill="#FFDE59" stroke="#111111" stroke-width="2"/>
    <rect x="9.5" y="10" width="13" height="12" rx="2" fill="#1A1A1E" stroke="#111111" stroke-width="1.4"/>
    <polyline points="11.5,14 14.5,16 11.5,18" fill="none" stroke="#B8FF3B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="16.5" y1="18" x2="20" y2="18" stroke="#38BDF8" stroke-width="1.9" stroke-linecap="round"/>
  `,
  crt_ch_telemetry: `
    <circle cx="16" cy="16" r="11.5" fill="#111111" transform="translate(1.4,1.4)"/>
    <circle cx="16" cy="16" r="11.5" fill="#1A1A1E" stroke="#111111" stroke-width="2.1"/>
    <rect x="8.8" y="16" width="3.4" height="5.8" rx="1" fill="#38BDF8"/>
    <rect x="14.3" y="11.5" width="3.4" height="10.3" rx="1" fill="#6EE7B7"/>
    <rect x="19.8" y="8.8" width="3.4" height="13" rx="1" fill="#B8FF3B"/>
    <circle cx="21.5" cy="6.8" r="1.8" fill="#FFDE59" stroke="#111111" stroke-width="1"/>
  `,
  crt_ch_bytecat: `
    <path d="M6 12 L8.5 5 L13.5 9.5 H18.5 L23.5 5 L26 12 V23 C26 25.5 23.8 27 21 27 H11 C8.2 27 6 25.5 6 23 Z" fill="#111111" transform="translate(1.4,1.4)"/>
    <path d="M6 12 L8.5 5 L13.5 9.5 H18.5 L23.5 5 L26 12 V23 C26 25.5 23.8 27 21 27 H11 C8.2 27 6 25.5 6 23 Z" fill="#C4B5FD" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <rect x="9.5" y="13" width="13" height="9.5" rx="2.5" fill="#1A1A1E" stroke="#111111" stroke-width="1.4"/>
    <path d="M11.8 17.5 Q13.2 15.6 14.5 17.5" fill="none" stroke="#B8FF3B" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M17.5 17.5 Q18.8 15.6 20.2 17.5" fill="none" stroke="#B8FF3B" stroke-width="1.8" stroke-linecap="round"/>
    <polygon points="15,19.4 17,19.4 16,20.8" fill="#FF90E8"/>
  `,
  crt_ch_lofi: `
    <rect x="4" y="8.5" width="24" height="16" rx="3.5" fill="#111111" transform="translate(1.4,1.4)"/>
    <rect x="4" y="8.5" width="24" height="16" rx="3.5" fill="#FF90E8" stroke="#111111" stroke-width="2"/>
    <rect x="7" y="11" width="18" height="7" rx="1.5" fill="#FEF9C3" stroke="#111111" stroke-width="1.4"/>
    <circle cx="11.5" cy="14.5" r="2.1" fill="#1A1A1E" stroke="#111111" stroke-width="1.1"/>
    <circle cx="20.5" cy="14.5" r="2.1" fill="#1A1A1E" stroke="#111111" stroke-width="1.1"/>
    <polygon points="10,24.5 22,24.5 20.5,21 11.5,21" fill="#C4B5FD" stroke="#111111" stroke-width="1.3" stroke-linejoin="round"/>
    <circle cx="24" cy="5.5" r="2" fill="#38BDF8" stroke="#111111" stroke-width="1.2"/>
    <line x1="25.6" y1="5.5" x2="25.6" y2="2" stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round"/>
  `,
  crt_ch_brew: `
    <g stroke="#FFDE59" stroke-width="1.9" stroke-linecap="round" fill="none">
      <path d="M12.5 9.5 C12.5 7.2 14.5 7 14 4.5"/>
      <path d="M18 9.5 C18 7.2 20 7 19.5 4.5"/>
    </g>
    <ellipse cx="16" cy="25.5" rx="10.5" ry="2.6" fill="#FDBA74" stroke="#111111" stroke-width="1.8"/>
    <path d="M8 13 H22 V19.5 C22 23 19.3 25 15 25 C10.7 25 8 23 8 19.5 Z" fill="#F8FAFC" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="15" cy="13.2" rx="6.2" ry="1.8" fill="#6EE7B7" stroke="#111111" stroke-width="1.3"/>
    <path d="M22 14.8 H24.5 A2.4 2.4 0 0 1 24.5 19.8 H22" fill="none" stroke="#111111" stroke-width="2" stroke-linecap="round"/>
  `,
  level_avatar_1: `
    <rect width="64" height="64" rx="12" fill="#253341"/>
    <circle cx="50" cy="14" r="3" fill="#FFDE59" opacity="0.75"/>
    <path d="M10 14 H20" stroke="#7CA5B8" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <path d="M16 58 C16 45 48 45 48 58 Z" fill="#475569" stroke="#111111" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="13" y="15" width="38" height="31" rx="7" fill="#D6B88D" stroke="#111111" stroke-width="2.4"/>
    <path d="M17 15 L23 8 L28 15 M47 15 L41 8 L36 15" fill="#D6B88D" stroke="#111111" stroke-width="2.3" stroke-linejoin="round"/>
    <rect x="27" y="12" width="10" height="5" rx="1" fill="#FFDE59" stroke="#111111" stroke-width="1.6" transform="rotate(-6 32 14)"/>
    <rect x="19" y="22" width="26" height="19" rx="5" fill="#F8FAFC" stroke="#111111" stroke-width="2.1"/>
    <circle cx="26.5" cy="30.5" r="3.2" fill="#111111"/>
    <circle cx="37.5" cy="30.5" r="3.2" fill="#111111"/>
    <circle cx="25.5" cy="29.3" r="1.1" fill="#FFFFFF"/>
    <circle cx="36.5" cy="29.3" r="1.1" fill="#FFFFFF"/>
    <polygon points="30.5,34.5 33.5,34.5 32,36.6" fill="#FF90E8"/>
    <path d="M29 38.2 Q32 40 35 38.2" fill="none" stroke="#111111" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="37" y="44" width="20" height="14" rx="3" fill="#FFDE59" stroke="#111111" stroke-width="2"/>
    <polyline points="41,53 43.5,48.5 46,53" fill="none" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M53.5 49.2 A2.5 2.5 0 1 0 53.5 52.8" fill="none" stroke="#111111" stroke-width="1.8" stroke-linecap="round"/>
  `,
  level_avatar_2: `
    <rect width="64" height="64" rx="12" fill="#2E261B"/>
    <ellipse cx="32" cy="17" rx="22" ry="6" fill="none" stroke="#FFDE59" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M16 58 C16 44 48 44 48 58 Z" fill="#F59E0B" stroke="#111111" stroke-width="2.4"/>
    <polygon points="22,47 32,56 42,47" fill="#FF6B6B" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="32" cy="34" r="15.5" fill="#FFFBEB" stroke="#111111" stroke-width="2.4"/>
    <polygon points="19,26 20,14 28,22" fill="#FFFBEB" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polygon points="45,26 44,14 36,22" fill="#FFFBEB" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <ellipse cx="32" cy="19" rx="21" ry="4.8" fill="#D97706" stroke="#111111" stroke-width="2.2"/>
    <path d="M23 18 L25 9 Q32 7 39 9 L41 18 Z" fill="#F59E0B" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="26.5" cy="32" r="2.7" fill="#111111"/>
    <circle cx="37.5" cy="32" r="2.7" fill="#111111"/>
    <circle cx="25.8" cy="31" r="0.9" fill="#FFFFFF"/>
    <circle cx="36.8" cy="31" r="0.9" fill="#FFFFFF"/>
    <polygon points="30.5,35.5 33.5,35.5 32,37.5" fill="#FB7185"/>
    <path d="M28.5 39.5 Q32 42 35.5 39.5" fill="none" stroke="#111111" stroke-width="1.9" stroke-linecap="round"/>
    <circle cx="46" cy="52" r="2.2" fill="#FFDE59"/>
    <circle cx="51" cy="52" r="2.2" fill="#FFDE59"/>
  `,
  level_avatar_3: `
    <rect width="64" height="64" rx="12" fill="#2A1D2E"/>
    <path d="M13 58 L20 43 H44 L51 58 Z" fill="#64748B" stroke="#111111" stroke-width="2.4" stroke-linejoin="round"/>
    <polygon points="21,43 27,51 32,46 37,51 43,43" fill="#475569" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="31" cy="32" r="14.5" fill="#F1F5F9" stroke="#111111" stroke-width="2.4"/>
    <path d="M16 24 Q31 11 46 24 Z" fill="#C084FC" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M12 24 H50 L45 27 H17 Z" fill="#FF90E8" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="25.5" cy="31.5" r="2.5" fill="#111111"/>
    <circle cx="38" cy="32" r="6.8" fill="#38BDF8" fill-opacity="0.32" stroke="#111111" stroke-width="2.4"/>
    <circle cx="38" cy="32" r="4.2" fill="#111111"/>
    <circle cx="36.8" cy="30.6" r="1.4" fill="#FFFFFF"/>
    <line x1="43" y1="37" x2="52" y2="47" stroke="#FFDE59" stroke-width="3.6" stroke-linecap="round"/>
    <line x1="43" y1="37" x2="52" y2="47" stroke="#111111" stroke-width="1.6" stroke-linecap="round"/>
    <polygon points="29.5,35.5 32.5,35.5 31,37.4" fill="#FF90E8"/>
    <line x1="27" y1="39.5" x2="33" y2="39.5" stroke="#111111" stroke-width="1.9" stroke-linecap="round"/>
  `,
  level_avatar_4: `
    <rect width="64" height="64" rx="12" fill="#172B27"/>
    <path d="M15 58 C15 44 49 44 49 58 Z" fill="#10B981" stroke="#111111" stroke-width="2.4"/>
    <circle cx="32" cy="33" r="15" fill="#FEF3C7" stroke="#111111" stroke-width="2.4"/>
    <path d="M15 28 C15 14 49 14 49 28 Z" fill="#6EE7B7" stroke="#111111" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="29" y="13" width="6" height="14" rx="2" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <rect x="19" y="27" width="26" height="10" rx="5" fill="#1A1A1E" stroke="#111111" stroke-width="2.2"/>
    <path d="M23.5 32 C23.5 29.3 27.5 29.3 29.5 32 C31.5 34.7 32.5 34.7 34.5 32 C36.5 29.3 40.5 29.3 40.5 32 C40.5 34.7 36.5 34.7 34.5 32 C32.5 29.3 31.5 29.3 29.5 32 C27.5 34.7 23.5 34.7 23.5 32 Z" fill="none" stroke="#38BDF8" stroke-width="2"/>
    <rect x="37" y="38" width="8.5" height="3.8" rx="1.4" fill="#FFFFFF" stroke="#111111" stroke-width="1.4" transform="rotate(-14 41 40)"/>
    <path d="M28 41.5 H35" stroke="#111111" stroke-width="2" stroke-linecap="round"/>
    <rect x="42" y="45" width="12" height="11" rx="2.5" fill="#F8FAFC" stroke="#111111" stroke-width="2"/>
    <path d="M54 47.5 H57 A2 2 0 0 1 57 52.5 H54" fill="none" stroke="#111111" stroke-width="2"/>
    <path d="M46 43 Q47 40 46 38 M50 43 Q51 40 50 38" stroke="#FFDE59" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  `,
  level_avatar_5: `
    <rect width="64" height="64" rx="12" fill="#231E38"/>
    <circle cx="13" cy="18" r="2.2" fill="#C4B5FD"/>
    <circle cx="52" cy="24" r="2" fill="#FFDE59"/>
    <path d="M14 58 C14 43 50 43 50 58 Z" fill="#7C3AED" stroke="#111111" stroke-width="2.4"/>
    <path d="M13 38 C13 15 51 15 51 38 L47 47 H17 Z" fill="#A78BFA" stroke="#111111" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="32" cy="34" r="13" fill="#FFF1F2" stroke="#111111" stroke-width="2.2"/>
    <path d="M24 32 Q26.5 29.5 29 32" fill="none" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M35 32 Q37.5 29.5 40 32" fill="none" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="24" cy="36" r="2.2" fill="#FF90E8" opacity="0.7"/>
    <circle cx="40" cy="36" r="2.2" fill="#FF90E8" opacity="0.7"/>
    <path d="M29.5 38 Q32 40.5 34.5 38" fill="none" stroke="#111111" stroke-width="1.9" stroke-linecap="round"/>
    <circle cx="44" cy="18" r="6" fill="#FF6B6B" stroke="#111111" stroke-width="2"/>
    <path d="M40.5 14.5 H47.5 L44 12 Z" fill="#111111"/>
    <line x1="44" y1="15" x2="44" y2="24" stroke="#111111" stroke-width="1.6"/>
    <circle cx="41.8" cy="18.2" r="1.1" fill="#111111"/>
    <circle cx="46.2" cy="19.2" r="1.1" fill="#111111"/>
  `,
  level_avatar_6: `
    <rect width="64" height="64" rx="12" fill="#1A2918"/>
    <path d="M16 58 C16 44 48 44 48 58 Z" fill="#3F6212" stroke="#111111" stroke-width="2.4"/>
    <circle cx="32" cy="36" r="13.5" fill="#F8FAFC" stroke="#111111" stroke-width="2.3"/>
    <path d="M12 27 H52 L45 22 L35 6 L20 22 Z" fill="#65A30D" stroke="#111111" stroke-width="2.3" stroke-linejoin="round"/>
    <rect x="20" y="21" width="24" height="4.5" rx="1.5" fill="#B8FF3B" stroke="#111111" stroke-width="1.8"/>
    <polygon points="34,11 35.5,14.5 39,15 36.2,17.3 37,20.5 34,18.7 31,20.5 31.8,17.3 29,15 32.5,14.5" fill="#FFDE59"/>
    <polygon points="23,33 29,34.5 23,36" fill="#B8FF3B" stroke="#111111" stroke-width="1.4"/>
    <polygon points="41,33 35,34.5 41,36" fill="#B8FF3B" stroke="#111111" stroke-width="1.4"/>
    <path d="M29 40.5 Q32 42.8 35 40.5" fill="none" stroke="#111111" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="48" cy="48" r="9.5" fill="#111111"/>
    <circle cx="48" cy="48" r="7.5" fill="#B8FF3B" stroke="#38BDF8" stroke-width="2"/>
    <circle cx="45.6" cy="48" r="2.2" fill="none" stroke="#111111" stroke-width="1.7"/>
    <line x1="50.5" y1="45.6" x2="50.5" y2="50.6" stroke="#111111" stroke-width="1.8" stroke-linecap="round"/>
  `,
  level_avatar_7: `
    <rect width="64" height="64" rx="12" fill="#331E14"/>
    <path d="M51 44 L54 20" stroke="#B8FF3B" stroke-width="2" stroke-dasharray="3 2"/>
    <path d="M54 10 L58 19 H50 Z" fill="#F8FAFC" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
    <polygon points="51.5,19 56.5,19 54,25" fill="#FFDE59"/>
    <path d="M14 58 C14 44 46 44 46 58 Z" fill="#C2410C" stroke="#111111" stroke-width="2.4"/>
    <circle cx="29" cy="34" r="14.5" fill="#FED7AA" stroke="#111111" stroke-width="2.4"/>
    <ellipse cx="29" cy="21" rx="20" ry="4.5" fill="#FB923C" stroke="#111111" stroke-width="2.2"/>
    <path d="M19 20 L22 10 L29 12.5 L36 10 L39 20 Z" fill="#EA580C" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="17" y="29" width="10.5" height="7" rx="2.5" fill="#111111" stroke="#FFDE59" stroke-width="1.5"/>
    <rect x="30.5" y="29" width="10.5" height="7" rx="2.5" fill="#111111" stroke="#FFDE59" stroke-width="1.5"/>
    <line x1="27.5" y1="31.5" x2="30.5" y2="31.5" stroke="#FFDE59" stroke-width="1.8"/>
    <line x1="19" y1="31.5" x2="25" y2="31.5" stroke="#B8FF3B" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="32.5" y1="31.5" x2="38.5" y2="31.5" stroke="#B8FF3B" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M25 40.5 Q31 43.5 35 39" fill="none" stroke="#111111" stroke-width="2" stroke-linecap="round"/>
  `,
  level_avatar_8: `
    <rect width="64" height="64" rx="12" fill="#0F2233"/>
    <circle cx="32" cy="33" r="24" fill="#38BDF8" opacity="0.14"/>
    <rect x="6" y="10" width="11" height="9" rx="2.2" fill="#FFDE59" stroke="#111111" stroke-width="1.8" transform="rotate(-10 11.5 14.5)"/>
    <line x1="8.5" y1="14.5" x2="14.5" y2="14.5" stroke="#111111" stroke-width="1.6" stroke-linecap="round" transform="rotate(-10 11.5 14.5)"/>
    <rect x="47" y="10" width="11" height="9" rx="2.2" fill="#B8FF3B" stroke="#111111" stroke-width="1.8" transform="rotate(10 52.5 14.5)"/>
    <line x1="49.5" y1="14.5" x2="55.5" y2="14.5" stroke="#111111" stroke-width="1.6" stroke-linecap="round" transform="rotate(10 52.5 14.5)"/>
    <path d="M15 58 C15 44 49 44 49 58 Z" fill="#0284C7" stroke="#111111" stroke-width="2.4"/>
    <path d="M16 33 C16 20 48 20 48 33" fill="none" stroke="#38BDF8" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M16 33 C16 20 48 20 48 33" fill="none" stroke="#111111" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="32" cy="35" r="14" fill="#F8FAFC" stroke="#111111" stroke-width="2.4"/>
    <polygon points="20,25 22,14 29,21" fill="#F8FAFC" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <polygon points="44,25 42,14 35,21" fill="#F8FAFC" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="11" y="28" width="8" height="13" rx="3" fill="#38BDF8" stroke="#111111" stroke-width="2"/>
    <rect x="45" y="28" width="8" height="13" rx="3" fill="#38BDF8" stroke="#111111" stroke-width="2"/>
    <rect x="13" y="31" width="4" height="7" rx="1" fill="#FF90E8"/>
    <rect x="47" y="31" width="4" height="7" rx="1" fill="#B8FF3B"/>
    <circle cx="27" cy="34" r="2.7" fill="#111111"/>
    <circle cx="37" cy="34" r="2.7" fill="#111111"/>
    <circle cx="26.2" cy="33" r="1" fill="#38BDF8"/>
    <circle cx="36.2" cy="33" r="1" fill="#38BDF8"/>
    <polygon points="30.5,37.2 33.5,37.2 32,39.2" fill="#FF90E8"/>
    <path d="M29 41 Q32 43.2 35 41" fill="none" stroke="#111111" stroke-width="1.9" stroke-linecap="round"/>
  `,
  level_avatar_9: `
    <rect width="64" height="64" rx="12" fill="#2A162B"/>
    <ellipse cx="32" cy="31" rx="25" ry="11" fill="none" stroke="#FFDE59" stroke-width="2" transform="rotate(-18 32 31)"/>
    <circle cx="10" cy="28" r="3.4" fill="#38BDF8" stroke="#111111" stroke-width="1.6"/>
    <circle cx="54" cy="32" r="3.4" fill="#B8FF3B" stroke="#111111" stroke-width="1.6"/>
    <path d="M15 58 C15 44 49 44 49 58 Z" fill="#DB2777" stroke="#111111" stroke-width="2.4"/>
    <circle cx="32" cy="32" r="15.5" fill="#FDF2F8" stroke="#111111" stroke-width="2.4"/>
    <rect x="20" y="24" width="24" height="14" rx="7" fill="#1A1A1E" stroke="#111111" stroke-width="2"/>
    <circle cx="27" cy="31" r="2.7" fill="#F472B6"/>
    <circle cx="37" cy="31" r="2.7" fill="#38BDF8"/>
    <path d="M29.5 34.5 Q32 36.2 34.5 34.5" fill="none" stroke="#FFDE59" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M22 18 L25 11 L32 15 L39 11 L42 18 Z" fill="#F472B6" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
  `,
  level_avatar_10: `
    <rect width="64" height="64" rx="12" fill="#111816"/>
    <polygon points="32,4 54,16 54,44 32,56 10,44 10,16" fill="#1B2A24" stroke="#B8FF3B" stroke-width="2"/>
    <path d="M15 58 L22 44 H42 L49 58 Z" fill="#FFDE59" stroke="#111111" stroke-width="2.4" stroke-linejoin="round"/>
    <polygon points="27,44 32,53 37,44" fill="#38BDF8" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="32" cy="33" r="13.5" fill="#FEF9C3" stroke="#111111" stroke-width="2.4"/>
    <polygon points="19,22 21,10 27.5,16 32,7 36.5,16 43,10 45,22" fill="#FFDE59" stroke="#111111" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="32" cy="14.5" r="2.2" fill="#FF90E8" stroke="#111111" stroke-width="1.2"/>
    <polygon points="21,29 43,29 41,36 23,36" fill="#111111" stroke="#B8FF3B" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="27" cy="32.5" r="2.3" fill="#B8FF3B"/>
    <circle cx="37" cy="32.5" r="2.3" fill="#38BDF8"/>
    <path d="M29 39.5 Q32 42 35 39.5" fill="none" stroke="#111111" stroke-width="2" stroke-linecap="round"/>
    <path d="M10 12 L12 15 L15 16 L12 17 L10 20 L8 17 L5 16 L8 15 Z" fill="#FFDE59"/>
    <path d="M54 12 L56 15 L59 16 L56 17 L54 20 L52 17 L49 16 L52 15 Z" fill="#FF90E8"/>
  `,
};

export const EMOJI_TO_STUDIO_ICON: Record<string, StudioIconName> = {
  "👑": "crown",
  "🚀": "rocket",
  "🌧️": "rain",
  "🌧": "rain",
  "☕": "coffee",
  "🔮": "lava",
  "🐟": "fish",
  "🔥": "flame",
  "⚡": "bolt",
  "🪲": "bug",
  "🐛": "bug",
  "🐾": "paw",
  "💡": "bulb",
  "🎲": "dice",
  "🔒": "lock",
  "🔓": "lock",
  "🎯": "target",
  "🏆": "trophy",
  "🎓": "grad",
  "🎉": "party",
  "🐍": "python",
  "🔍": "search",
  "🏗️": "arch",
  "🏗": "arch",
  "🏛️": "arch",
  "🏛": "arch",
  "🎧": "headphones",
  "💬": "chat",
  "🏅": "medal",
  "🥇": "medal",
  "🥈": "medal",
  "💾": "floppy",
  "📖": "book",
  "📚": "book",
  "🧠": "brain",
  "✨": "sparkles",
  "⚔️": "swords",
  "⚔": "swords",
  "🧰": "toolbox",
  "🛠️": "toolbox",
  "🛠": "toolbox",
  "🔧": "toolbox",
  "⚠️": "warning",
  "⚠": "warning",
  "🚨": "warning",
  "☁️": "cloud",
  "☁": "cloud",
  "🎁": "gift",
  "📤": "share",
  "🔊": "sound_on",
  "🔇": "sound_off",
  "💎": "gem",
  "🛡️": "shield",
  "🛡": "shield",
  "🔬": "lab",
  "🧪": "lab",
  "✂️": "scissors",
  "✂": "scissors",
  "⚖️": "scale",
  "⚖": "scale",
  "🧹": "broom",
  "🙆‍♂️": "stretch",
  "💥": "boom",
  "💼": "briefcase",
  "👁": "eye",
  "🙈": "eye",
  "🧩": "puzzle",
  "👉": "point_right",
  "☾": "moon",
  "☀": "sun",
  "☀️": "sun",
  "⌨️": "keyboard",
  "⌨": "keyboard",
  "💻": "terminal",
  "🖥️": "terminal",
  "🖥": "terminal",
  "⏱️": "timer",
  "⏱": "timer",
  "⏰": "timer",
  "✅": "check_box",
  "🟩": "check_box",
  "🟥": "cross_box",
  "🟨": "yellow_box",
  "🧬": "algo",
};

const SORTED_EMOJI_KEYS = Object.keys(EMOJI_TO_STUDIO_ICON).sort(
  (a, b) => b.length - a.length,
);

const ESCAPED_EMOJI_ALTERNATIVES = SORTED_EMOJI_KEYS.map((k) =>
  k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
).join("|");

const EMOJI_SPLIT_REGEX = new RegExp(`(${ESCAPED_EMOJI_ALTERNATIVES})`, "g");
const EMOJI_TEST_REGEX = new RegExp(`(${ESCAPED_EMOJI_ALTERNATIVES})`);

function buildFullSvgString(name: StudioIconName): string {
  const inner = STUDIO_ICON_INNER_SVG[name] || STUDIO_ICON_INNER_SVG.sparkles;
  const isLevelAvatar = name.startsWith("level_avatar_");
  const viewBox = isLevelAvatar ? "0 0 64 64" : "2 2 28 28";
  const overflow = isLevelAvatar ? "hidden" : "visible";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%" style="display:block;overflow:${overflow}">${inner}</svg>`;
}

const SVG_DATA_URI_CACHE: Partial<Record<StudioIconName, string>> = {};

function getSvgDataUri(name: StudioIconName): string {
  const cached = SVG_DATA_URI_CACHE[name];
  if (cached) return cached;
  const raw = buildFullSvgString(name).replace(/\s+/g, " ").trim();
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
  SVG_DATA_URI_CACHE[name] = uri;
  return uri;
}

export interface StudioIconProps {
  name: StudioIconName;
  size?: number;
  inline?: boolean;
  style?: ViewStyle;
}

export function StudioIcon({
  name,
  size = 20,
  inline = false,
  style,
}: StudioIconProps) {
  if (Platform.OS === "web") {
    const svgHtml = buildFullSvgString(name);
    if (inline) {
      return React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${size}px`,
          height: `${size}px`,
          verticalAlign: "-0.28em",
          marginLeft: "1px",
          marginRight: "2.5px",
          flexShrink: 0,
        },
        dangerouslySetInnerHTML: { __html: svgHtml },
      });
    }
    return (
      <View style={[{ width: size, height: size }, style]}>
        {React.createElement("div", {
          style: { width: "100%", height: "100%", display: "flex" },
          dangerouslySetInnerHTML: { __html: svgHtml },
        })}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: getSvgDataUri(name) }}
      style={[{ width: size, height: size }, style as any]}
      contentFit="contain"
    />
  );
}

function replaceEmojisInNode(
  node: React.ReactNode,
  iconSize: number,
  keyPrefix = "st",
): React.ReactNode {
  if (typeof node === "string") {
    if (!EMOJI_TEST_REGEX.test(node)) {
      return node;
    }
    const parts = node.split(EMOJI_SPLIT_REGEX);
    return parts.map((part, idx) => {
      const iconName = EMOJI_TO_STUDIO_ICON[part];
      if (iconName) {
        return (
          <StudioIcon
            key={`${keyPrefix}-ic-${idx}`}
            name={iconName}
            size={iconSize}
            inline
          />
        );
      }
      return part;
    });
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) =>
      replaceEmojisInNode(child, iconSize, `${keyPrefix}-${idx}`),
    );
  }

  if (React.isValidElement(node) && node.type === React.Fragment) {
    const frag = node as React.ReactElement<{ children?: React.ReactNode }>;
    return replaceEmojisInNode(frag.props.children, iconSize, `${keyPrefix}-fr`);
  }

  return node;
}

export function Text({ children, style, ...rest }: TextProps) {
  const flatStyle = StyleSheet.flatten(style) as
    | { fontSize?: number }
    | undefined;
  const baseFontSize = flatStyle?.fontSize || 13;
  const iconSize = Math.max(18, Math.round(baseFontSize * 1.55));

  return (
    <RNText style={style} {...rest}>
      {replaceEmojisInNode(children, iconSize)}
    </RNText>
  );
}

export default StudioIcon;
