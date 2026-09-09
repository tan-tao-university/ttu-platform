/**
 * Resolve style tokens from a section's `style` payload into CSS class names.
 *
 * Components call this with the values from their `styleSchema` and get
 * back the Tailwind classes that correspond to the design system tokens.
 *
 * Database stores tokens (e.g. `"xl"`, `"primary"`); this module
 * is the bridge to CSS.
 */
import {
  ALIGN_CLASSES,
  BACKGROUND_CLASSES,
  RADIUS_CLASSES,
  SHADOW_CLASSES,
  TYPOGRAPHY_CLASSES,
} from "@ttu/design-system/tokens";
import type {
  AlignToken,
  BackgroundToken,
  RadiusToken,
  ShadowToken,
  SpacingToken,
  TypographyToken,
  WidthToken,
} from "@ttu/shared";

export function resolveBackground(token: unknown): string {
  return BACKGROUND_CLASSES[(token as BackgroundToken) ?? "default"];
}

export function resolveAlign(token: unknown): string {
  return ALIGN_CLASSES[(token as AlignToken) ?? "left"];
}

export function resolveTypography(token: unknown): string {
  return TYPOGRAPHY_CLASSES[(token as TypographyToken) ?? "md"];
}

export function resolveRadius(token: unknown): string {
  return RADIUS_CLASSES[(token as RadiusToken) ?? "md"];
}

export function resolveShadow(token: unknown): string {
  return SHADOW_CLASSES[(token as ShadowToken) ?? "none"];
}

import { SPACING_VALUES, WIDTH_VALUES } from "@ttu/design-system/tokens";
export function resolveSpacing(token: unknown): string {
  return SPACING_VALUES[(token as SpacingToken) ?? "md"];
}

export function resolveWidth(token: unknown): string {
  return WIDTH_VALUES[(token as WidthToken) ?? "xl"];
}

/**
 * Build the section-level style props (background + spacing) for the
 * `<Section>` primitive from a section's style payload.
 */
export function sectionStyleProps(style: Record<string, unknown> | undefined): {
  background: import("@ttu/shared").BackgroundToken;
  paddingTop: import("@ttu/shared").SpacingToken;
  paddingBottom: import("@ttu/shared").SpacingToken;
} {
  return {
    background:
      (style?.background as import("@ttu/shared").BackgroundToken) ?? "default",
    paddingTop:
      (style?.paddingTop as import("@ttu/shared").SpacingToken) ?? "lg",
    paddingBottom:
      (style?.paddingBottom as import("@ttu/shared").SpacingToken) ?? "lg",
  };
}
