// Omnify design tokens — a Stripe-inspired, restrained system.
// Single source of truth shared by the MUI theme and Tailwind (via CSS variables
// declared in index.css). Use semantic tokens, never raw hex, in components.

export const palette = {
  // Brand
  brand: "#635BFF", // Omnify indigo
  brandStrong: "#4B45D6",
  brandSoft: "#EEF0FF",
  ink: "#0A2540", // deep navy — headings & depth
  // Neutrals (light)
  bg: "#FFFFFF",
  bgMuted: "#F6F9FC",
  bgSubtle: "#FAFBFD",
  border: "#E3E8EF",
  borderStrong: "#CDD5E0",
  textPrimary: "#0A2540",
  textSecondary: "#425466",
  textMuted: "#697386",
  // Status
  success: "#00A86B",
  warning: "#F59E0B",
  error: "#DF1B41",
  info: "#635BFF",
  // Dark surfaces
  darkBg: "#0A1A2F",
  darkBgElevated: "#0F2742",
  darkBorder: "#1E3A5F",
  darkTextPrimary: "#E6EDF6",
  darkTextSecondary: "#9FB3C8",
} as const;

export const typography = {
  display: '"Space Grotesk", "Manrope", system-ui, sans-serif',
  body: '"Manrope", system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"Space Mono", ui-monospace, SFMono-Regular, monospace',
} as const;

// Product-app geometry — Stripe-like: soft, calm, lightly rounded.
export const radius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  pill: "999px",
} as const;

// Soft, layered shadows (paired with a 1px border) — no hard offsets.
export const shadow = {
  xs: "0 1px 1px rgba(10, 37, 64, 0.04), 0 1px 2px rgba(10, 37, 64, 0.06)",
  sm: "0 1px 3px rgba(10, 37, 64, 0.06), 0 4px 8px rgba(10, 37, 64, 0.05)",
  md: "0 4px 12px rgba(10, 37, 64, 0.08), 0 12px 24px rgba(10, 37, 64, 0.06)",
  lg: "0 12px 32px rgba(10, 37, 64, 0.12), 0 24px 48px rgba(10, 37, 64, 0.10)",
  ring: "0 0 0 3px rgba(99, 91, 255, 0.20)",
} as const;

export const motion = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "240ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "400ms cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const space = (n: number) => `${n * 4}px`;

export const tokens = { palette, typography, radius, shadow, motion, space };
export default tokens;
