/**
 * Spacing scale (px values).
 *
 * Source of truth for the design system. Components reference these via
 * CSS variables `--ttu-spacing-{token}` defined in `globals.css`.
 */
import type { SpacingToken } from "@ttu/shared";

export const SPACING_VALUES: Record<SpacingToken, string> = {
  none: "0",
  xs: "8px",
  sm: "16px",
  md: "32px",
  lg: "48px",
  xl: "64px",
  "2xl": "96px",
};

/**
 * Width tokens mapped to max-width CSS values (Tailwind scale).
 */
import type { WidthToken } from "@ttu/shared";

export const WIDTH_VALUES: Record<WidthToken, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  full: "100%",
};

/**
 * Background presets → CSS classes / variables.
 * Resolved by `Section` primitive.
 */
import type { BackgroundToken } from "@ttu/shared";

export const BACKGROUND_CLASSES: Record<BackgroundToken, string> = {
  default: "bg-background text-foreground",
  surface: "bg-surface text-foreground",
  muted: "bg-muted text-foreground",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  dark: "bg-foreground text-background",
};

/**
 * Typography scale for titles.
 */
import type { TypographyToken } from "@ttu/shared";

export const TYPOGRAPHY_CLASSES: Record<TypographyToken, string> = {
  sm: "text-2xl md:text-3xl font-semibold tracking-tight",
  md: "text-3xl md:text-4xl font-semibold tracking-tight",
  lg: "text-4xl md:text-5xl font-bold tracking-tight",
  xl: "text-5xl md:text-6xl font-bold tracking-tight",
  display: "text-5xl md:text-7xl font-bold tracking-tight",
};

/**
 * Radius scale.
 */
import type { RadiusToken } from "@ttu/shared";

export const RADIUS_CLASSES: Record<RadiusToken, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
};

/**
 * Shadow scale.
 */
import type { ShadowToken } from "@ttu/shared";

export const SHADOW_CLASSES: Record<ShadowToken, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

/**
 * Align tokens.
 */
import type { AlignToken } from "@ttu/shared";

export const ALIGN_CLASSES: Record<AlignToken, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};
