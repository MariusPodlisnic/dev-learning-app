export type LevelAvatarIconName =
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

export const LEVEL_AVATAR_INNER_SVG: Record<LevelAvatarIconName, string> = {
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

export function getLevelAvatarIcon(level: number): LevelAvatarIconName {
  const clamped = Math.min(10, Math.max(1, Math.floor(level || 1)));
  return `level_avatar_${clamped}` as LevelAvatarIconName;
}
