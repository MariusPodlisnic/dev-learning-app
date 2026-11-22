export type NavigationIconName =
  | "devlearn_logo"
  | "menu_coding"
  | "menu_account_rank"
  | "menu_settings"
  | "pro_member"
  | "nav_home"
  | "nav_skillmap"
  | "nav_studio"
  | "nav_arcade"
  | "nav_bughunt"
  | "nav_blitz"
  | "nav_flashcards"
  | "nav_detective"
  | "nav_minibuilds"
  | "nav_algolab"
  | "nav_showcase"
  | "nav_achievements"
  | "nav_leaderboard"
  | "free_preview";

export const NAVIGATION_ICON_INNER_SVG: Record<NavigationIconName, string> = {
  // Devy Concept 1 brand mark: Cozy Byte-Cat Companion
  devlearn_logo: `
    <path d="M5.2 16 A10.8 10.8 0 0 1 26.8 16" fill="none" stroke="#FFDE59" stroke-width="2.6" stroke-linecap="round"/>
    <polygon points="8,11.5 10.6,4.2 14.8,9" fill="#F4F0E6" stroke="#111111" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="24,11.5 21.4,4.2 17.2,9" fill="#F4F0E6" stroke="#111111" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="9.6,10.2 11,6.4 13,8.9" fill="#FF90E8"/>
    <polygon points="22.4,10.2 21,6.4 19,8.9" fill="#FF90E8"/>
    <rect x="6.2" y="8.8" width="19.6" height="18.2" rx="7.2" fill="#F4F0E6" stroke="#111111" stroke-width="1.5"/>
    <rect x="9" y="11.6" width="14" height="9.8" rx="4" fill="#181B24" stroke="#6EE7B7" stroke-width="0.9"/>
    <path d="M11.6 16.4 Q13.1 14 14.6 16.4 M17.4 16.4 Q18.9 14 20.4 16.4" fill="none" stroke="#6EE7B7" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M14.7 18.9 Q16 20.1 17.3 18.9" fill="none" stroke="#6EE7B7" stroke-width="1.4" stroke-linecap="round"/>
    <rect x="3.2" y="13.2" width="3.8" height="7.4" rx="1.8" fill="#FFDE59" stroke="#111111" stroke-width="1.2"/>
    <rect x="25" y="13.2" width="3.8" height="7.4" rx="1.8" fill="#FFDE59" stroke="#111111" stroke-width="1.2"/>
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
  nav_home: `
    <path d="M5 15 L16 5 L27 15 V26 H5 Z" fill="#6EE7B7" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
    <rect x="12.5" y="17" width="7" height="9" rx="1.5" fill="#FFDE59" stroke="#111111" stroke-width="1.8"/>
    <circle cx="16" cy="11.5" r="2" fill="#FF90E8" stroke="#111111" stroke-width="1.4"/>
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
  nav_arcade: `
    <rect x="3.5" y="9" width="25" height="17" rx="7" fill="#111111" transform="translate(1.5,1.5)"/>
    <rect x="3.5" y="9" width="25" height="17" rx="7" fill="#FF90E8" stroke="#111111" stroke-width="2.2"/>
    <line x1="10.5" y1="14" x2="10.5" y2="21" stroke="#111111" stroke-width="2.8" stroke-linecap="round"/>
    <line x1="7" y1="17.5" x2="14" y2="17.5" stroke="#111111" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="20.5" cy="15.5" r="2.2" fill="#FFDE59" stroke="#111111" stroke-width="1.5"/>
    <circle cx="23.5" cy="19.5" r="2.2" fill="#B8FF3B" stroke="#111111" stroke-width="1.5"/>
    <path d="M16 9 V5.5 H19" fill="none" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
  nav_flashcards: `
    <rect x="7" y="4" width="19" height="21" rx="3.5" fill="#111111" transform="translate(1.6,1.6) rotate(7 16 14)"/>
    <rect x="7" y="4" width="19" height="21" rx="3.5" fill="#FF90E8" stroke="#111111" stroke-width="2" transform="rotate(7 16 14)"/>
    <rect x="4" y="6" width="19" height="21" rx="3.5" fill="#111111" transform="translate(1.4,1.4)"/>
    <rect x="4" y="6" width="19" height="21" rx="3.5" fill="#6EE7B7" stroke="#111111" stroke-width="2.1"/>
    <line x1="8" y1="12" x2="19" y2="12" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="8" y1="16.5" x2="16.5" y2="16.5" stroke="#111111" stroke-width="2" stroke-linecap="round"/>
    <polygon points="13.5,19.5 14.8,22 17.5,22.4 15.5,24.2 16,26.8 13.5,25.4 11,26.8 11.5,24.2 9.5,22.4 12.2,22" fill="#FFDE59" stroke="#111111" stroke-width="1.3" stroke-linejoin="round"/>
  `,
  nav_detective: `
    <line x1="20.5" y1="20.5" x2="27.5" y2="27.5" stroke="#111111" stroke-width="5.2" stroke-linecap="round"/>
    <line x1="20.5" y1="20.5" x2="27.5" y2="27.5" stroke="#FFDE59" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="14" cy="14" r="9.5" fill="#111111" transform="translate(1.4,1.4)"/>
    <circle cx="14" cy="14" r="9.5" fill="#38BDF8" stroke="#111111" stroke-width="2.2"/>
    <circle cx="14" cy="14" r="6" fill="#0F172A" stroke="#111111" stroke-width="1.5"/>
    <polyline points="11.2,12 13.8,14 11.2,16" fill="none" stroke="#6EE7B7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="15" y1="16" x2="17.8" y2="16" stroke="#FFDE59" stroke-width="1.8" stroke-linecap="round"/>
  `,
  nav_minibuilds: `
    <rect x="4" y="6" width="24" height="20" rx="4.5" fill="#111111" transform="translate(1.5,1.5)"/>
    <rect x="4" y="6" width="24" height="20" rx="4.5" fill="#C4B5FD" stroke="#111111" stroke-width="2.2"/>
    <rect x="7.5" y="10" width="9" height="12" rx="2" fill="#181B24" stroke="#111111" stroke-width="1.6"/>
    <line x1="9.5" y1="14" x2="14.5" y2="14" stroke="#6EE7B7" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="9.5" y1="18" x2="13" y2="18" stroke="#FFDE59" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="19" y="10" width="5.5" height="5.5" rx="1.5" fill="#FFDE59" stroke="#111111" stroke-width="1.5"/>
    <rect x="19" y="17" width="5.5" height="5" rx="1.5" fill="#B8FF3B" stroke="#111111" stroke-width="1.5"/>
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
  nav_leaderboard: `
    <rect x="3.5" y="16" width="7.5" height="12" rx="2" fill="#38BDF8" stroke="#111111" stroke-width="2"/>
    <rect x="12.2" y="10" width="7.6" height="18" rx="2" fill="#B8FF3B" stroke="#111111" stroke-width="2"/>
    <rect x="21" y="19" width="7.5" height="9" rx="2" fill="#FF90E8" stroke="#111111" stroke-width="2"/>
    <polygon points="16,2.5 17.6,5.6 21,6.1 18.5,8.4 19.1,11.6 16,10 12.9,11.6 13.5,8.4 11,6.1 14.4,5.6" fill="#FFDE59" stroke="#111111" stroke-width="1.4" stroke-linejoin="round"/>
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
};
