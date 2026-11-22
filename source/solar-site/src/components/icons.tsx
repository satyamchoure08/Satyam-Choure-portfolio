import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaultIconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/**
 * Arkavolt brand mark: sun rising over a roof of solar panels (no box around it).
 */
export const BrandMark = (props: IconProps) => (
  <svg width="44" height="30" viewBox="0 0 44 30" fill="none" aria-hidden {...props}>
    <circle cx="22" cy="13" r="7" fill="#F59E0B" />
    <path d="M22 1.5v2.5M11.4 5.4l1.8 1.8M32.6 5.4l-1.8 1.8M6.5 13h2.5M35 13h2.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 28 22 15.5 41 28Z" fill="#0B3B8C" />
    <path d="M14.5 20.4 22 28M22 15.5V28M29.5 20.4 22 28M9 24h26" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.2" />
  </svg>
);

export const Droplet = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M5 5l14 14" />
  </svg>
);

export const FileCheck = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 15l2 2 4-4" />
  </svg>
);

export const Ruler = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
);

export const Shield = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const Check = (props: IconProps) => (
  <svg {...defaultIconProps} strokeWidth={2.2} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Phone = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const WhatsApp = (props: IconProps) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.07 16.29C4.24 14.97 3.8 13.46 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.57 14.41C16.32 14.29 15.11 13.69 14.88 13.61C14.66 13.52 14.5 13.48 14.33 13.73C14.17 13.97 13.7 14.54 13.56 14.71C13.41 14.87 13.27 14.89 13.02 14.77C12.78 14.65 11.99 14.39 11.06 13.56C10.33 12.91 9.84 12.11 9.7 11.86C9.55 11.62 9.68 11.48 9.8 11.36C9.91 11.26 10.05 11.08 10.17 10.94C10.29 10.8 10.33 10.7 10.41 10.54C10.5 10.37 10.45 10.23 10.39 10.11C10.33 9.99 9.84 8.78 9.63 8.29C9.43 7.81 9.23 7.87 9.08 7.86H8.61C8.45 7.86 8.18 7.92 7.96 8.17C7.73 8.41 7.1 9.01 7.1 10.23C7.1 11.45 7.99 12.63 8.11 12.79C8.24 12.96 9.86 15.45 12.33 16.52C12.92 16.77 13.38 16.93 13.73 17.04C14.32 17.23 14.86 17.2 15.29 17.14C15.77 17.07 16.76 16.54 16.97 15.97C17.17 15.39 17.17 14.9 17.11 14.79C17.05 14.69 16.82 14.53 16.57 14.41Z" />
  </svg>
);

export const Menu = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const Close = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Plus = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const Star = (props: IconProps) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
    <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
  </svg>
);

export const Sun = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const Bolt = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const XCircle = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6M9 9l6 6" />
  </svg>
);

export const CheckCircle = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

export const AlertTriangle = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const Hammer = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M14.5 9.5 4 20" />
    <path d="m12.5 3.5 8 8-2.5 2.5-8-8z" />
  </svg>
);

export const Wind = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

export const ArrowsVertical = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" />
  </svg>
);

export const SteelFrame = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M4 21V8M20 21V8M2 8h20M4 8l8 6 8-6M4 14h16" />
  </svg>
);

export const ChevronLeft = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronRight = (props: IconProps) => (
  <svg {...defaultIconProps} {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const Pause = (props: IconProps) => (
  <svg {...defaultIconProps} fill="currentColor" stroke="none" {...props}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

export const Play = (props: IconProps) => (
  <svg {...defaultIconProps} fill="currentColor" stroke="none" {...props}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);
