/**
 * Safe style tokens shared across components.
 *
 * Components accept these tokens as part of their `style` props; the
 * `@ttu/design-system` resolves them to actual CSS at render time.
 *
 * Database stores tokens, not CSS — that's the rule.
 */
import { z } from "zod";

export const SPACING_TOKENS = [
  "none",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
] as const;
export type SpacingToken = (typeof SPACING_TOKENS)[number];

export const WIDTH_TOKENS = ["sm", "md", "lg", "xl", "2xl", "full"] as const;
export type WidthToken = (typeof WIDTH_TOKENS)[number];

export const ALIGN_TOKENS = ["left", "center", "right"] as const;
export type AlignToken = (typeof ALIGN_TOKENS)[number];

export const BACKGROUND_TOKENS = [
  "default",
  "surface",
  "muted",
  "primary",
  "secondary",
  "dark",
] as const;
export type BackgroundToken = (typeof BACKGROUND_TOKENS)[number];

export const TYPOGRAPHY_TOKENS = ["sm", "md", "lg", "xl", "display"] as const;
export type TypographyToken = (typeof TYPOGRAPHY_TOKENS)[number];

export const RADIUS_TOKENS = ["none", "sm", "md", "lg", "xl"] as const;
export type RadiusToken = (typeof RADIUS_TOKENS)[number];

export const SHADOW_TOKENS = ["none", "sm", "md", "lg"] as const;
export type ShadowToken = (typeof SHADOW_TOKENS)[number];

export const COLUMN_TOKENS = [1, 2, 3, 4, 6] as const;
export type ColumnToken = (typeof COLUMN_TOKENS)[number];

/**
 * Numeric column option for Zod schema use.
 * Zod's `z.enum()` infers string literals; for numeric choices we use
 * `z.union` of literals instead so that the schema's output type matches
 * `ColumnToken` (number literal) without a coercion step at the boundary.
 */
export const ColumnTokenSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(6),
]);
