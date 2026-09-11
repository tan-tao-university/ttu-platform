import { z } from 'zod';

/**
 * Level A safe style controls (design doc 03 §9): semantic tokens only, never raw CSS values or
 * Tailwind classes. The database stores the token name (`"xl"`, `"center"`, ...); mapping a token
 * to an actual CSS value is `packages/design-system`'s job, not this registry's.
 */
export const SPACING_TOKENS = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export const WIDTH_TOKENS = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
export const ALIGNMENT_TOKENS = ['left', 'center', 'right'] as const;
export const BACKGROUND_TOKENS = [
  'default',
  'surface',
  'muted',
  'primary',
  'secondary',
  'dark',
] as const;
export const TYPOGRAPHY_TOKENS = ['sm', 'md', 'lg', 'xl', 'display'] as const;
export const RADIUS_TOKENS = ['none', 'sm', 'md', 'lg', 'xl'] as const;
export const SHADOW_TOKENS = ['none', 'sm', 'md', 'lg'] as const;

export const spacingToken = z.enum(SPACING_TOKENS);
export const widthToken = z.enum(WIDTH_TOKENS);
export const alignmentToken = z.enum(ALIGNMENT_TOKENS);
export const backgroundToken = z.enum(BACKGROUND_TOKENS);
export const typographyToken = z.enum(TYPOGRAPHY_TOKENS);
export const radiusToken = z.enum(RADIUS_TOKENS);
export const shadowToken = z.enum(SHADOW_TOKENS);
