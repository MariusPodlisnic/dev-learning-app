export type CrtChannelIconName =
  | "crt_ch_kernel"
  | "crt_ch_telemetry"
  | "crt_ch_bytecat"
  | "crt_ch_lofi"
  | "crt_ch_brew";

export const CRT_CHANNEL_INNER_SVG: Record<CrtChannelIconName, string> = {
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
};
