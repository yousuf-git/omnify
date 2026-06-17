import { createTheme, type Theme } from "@mui/material/styles";
import { palette, typography, radius, shadow } from "./tokens";

// Build the Omnify MUI theme for a given color mode. Bound to design tokens so the
// whole app (MUI + Tailwind) stays visually consistent.
export function createAppTheme(mode: "light" | "dark"): Theme {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: palette.brand, dark: palette.brandStrong, contrastText: "#FFFFFF" },
      secondary: { main: palette.ink, contrastText: "#FFFFFF" },
      success: { main: palette.success },
      warning: { main: palette.warning },
      error: { main: palette.error },
      info: { main: palette.info },
      background: {
        default: isDark ? palette.darkBg : palette.bgMuted,
        paper: isDark ? palette.darkBgElevated : palette.bg,
      },
      text: {
        primary: isDark ? palette.darkTextPrimary : palette.textPrimary,
        secondary: isDark ? palette.darkTextSecondary : palette.textSecondary,
      },
      divider: isDark ? palette.darkBorder : palette.border,
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: typography.body,
      fontSize: 14,
      h1: { fontFamily: typography.display, fontWeight: 700, fontSize: "2.25rem", letterSpacing: "-0.025em", lineHeight: 1.08 },
      h2: { fontFamily: typography.display, fontWeight: 700, fontSize: "1.75rem", letterSpacing: "-0.02em", lineHeight: 1.12 },
      h3: { fontFamily: typography.display, fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.018em", lineHeight: 1.18 },
      h4: { fontFamily: typography.display, fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.014em", lineHeight: 1.22 },
      h5: { fontFamily: typography.display, fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.01em" },
      h6: { fontFamily: typography.display, fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.005em" },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600, fontSize: "0.82rem" },
      body1: { fontSize: "0.9rem" },
      body2: { fontSize: "0.825rem" },
      caption: { fontSize: "0.75rem" },
      // Calm sans micro-label (section eyebrows / metadata). Not monospace.
      overline: {
        fontFamily: typography.body,
        fontWeight: 600,
        fontSize: "0.7rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        lineHeight: 1.6,
      },
      button: { fontWeight: 600, textTransform: "none", fontSize: "0.85rem", letterSpacing: 0 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true, size: "small" },
        styleOverrides: {
          root: { borderRadius: radius.md, paddingInline: "16px", paddingBlock: "7px", minHeight: 38 },
          sizeSmall: { paddingInline: "13px", paddingBlock: "6px", minHeight: 34 },
          containedPrimary: {
            boxShadow: shadow.xs,
            "&:hover": { boxShadow: shadow.sm },
          },
          outlined: {
            borderColor: isDark ? palette.darkBorder : palette.borderStrong,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: radius.lg },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            border: `1px solid ${isDark ? palette.darkBorder : palette.border}`,
            boxShadow: shadow.xs,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: { root: { padding: 20, "&:last-child": { paddingBottom: 20 } } },
      },
      MuiTextField: { defaultProps: { size: "small" } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: radius.sm },
          notchedOutline: { borderColor: isDark ? palette.darkBorder : palette.borderStrong },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: "0.875rem" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radius.sm, fontWeight: 600, fontSize: "0.72rem", letterSpacing: 0 },
          sizeSmall: { height: 22 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            paddingTop: 11,
            paddingBottom: 11,
            paddingLeft: 16,
            paddingRight: 16,
            fontSize: "0.85rem",
            borderColor: isDark ? palette.darkBorder : palette.border,
          },
          // Calm sans column headers — small, gray, light tracking (Stripe-like).
          head: {
            fontFamily: typography.body,
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: isDark ? palette.darkTextSecondary : palette.textMuted,
            paddingTop: 12,
            paddingBottom: 12,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: { backgroundColor: isDark ? palette.darkBgElevated : palette.bgSubtle },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: radius.sm, fontSize: 12, backgroundColor: palette.ink },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: radius.lg } },
      },
    },
  });
}

export default createAppTheme;
