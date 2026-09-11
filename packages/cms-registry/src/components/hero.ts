import { z } from 'zod';
import { alignmentToken, backgroundToken, spacingToken, widthToken } from '../style-tokens';
import type { ComponentDefinition } from '../types';

/**
 * Doc 03 §3: the one component with a complete, worked example in the design docs — content,
 * config, style, and variants spelled out field-by-field. Every other name in doc 03 §21 is a
 * planned category placeholder only; adding one here requires the same complete contract doc 03 §22
 * demands, not just a name.
 */

const HERO_VARIANTS = ['default', 'centered', 'split', 'minimal'] as const;
const titleSizeToken = z.enum(['sm', 'md', 'lg', 'xl', 'display']);

const heroContentSchema = z
  .object({
    eyebrow: z.string().max(120).optional(),
    title: z.string().min(1).max(200),
    subtitle: z.string().max(500).optional(),
    primaryButtonLabel: z.string().max(60).optional(),
    secondaryButtonLabel: z.string().max(60).optional(),
  })
  .strict();

const heroConfigSchema = z
  .object({
    backgroundImageId: z.string().uuid().optional(),
    primaryButtonUrl: z.string().max(2000).optional(),
    secondaryButtonUrl: z.string().max(2000).optional(),
  })
  .strict();

const heroStyleSchema = z
  .object({
    contentWidth: widthToken,
    textAlign: alignmentToken,
    titleSize: titleSizeToken,
    paddingTop: spacingToken,
    paddingBottom: spacingToken,
    background: backgroundToken,
  })
  .strict();

type HeroContent = z.infer<typeof heroContentSchema>;
type HeroConfig = z.infer<typeof heroConfigSchema>;
type HeroStyle = z.infer<typeof heroStyleSchema>;

export const heroV1: ComponentDefinition<HeroContent, HeroConfig, HeroStyle> = {
  key: 'hero',
  version: 1,
  name: 'Hero',
  category: 'Marketing',
  description: 'Full-width lead section: eyebrow, title, subtitle, and up to two CTAs.',
  contentSchema: heroContentSchema,
  configSchema: heroConfigSchema,
  styleSchema: heroStyleSchema,
  defaultContent: { title: '' },
  defaultConfig: {},
  defaultStyle: {
    contentWidth: 'xl',
    textAlign: 'left',
    titleSize: 'xl',
    paddingTop: '2xl',
    paddingBottom: '2xl',
    background: 'default',
  },
  variants: HERO_VARIANTS,
  editorMetadata: {
    content: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', required: false },
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        helpText: 'Keep under 80 characters',
      },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', required: false },
      { name: 'primaryButtonLabel', label: 'Primary button label', type: 'text', required: false },
      {
        name: 'secondaryButtonLabel',
        label: 'Secondary button label',
        type: 'text',
        required: false,
      },
    ],
    config: [
      { name: 'backgroundImageId', label: 'Background image', type: 'image', required: false },
      {
        name: 'primaryButtonUrl',
        label: 'Primary button link',
        type: 'internal-link',
        required: false,
      },
      {
        name: 'secondaryButtonUrl',
        label: 'Secondary button link',
        type: 'internal-link',
        required: false,
      },
    ],
    style: [
      {
        name: 'contentWidth',
        label: 'Content width',
        type: 'segmented-control',
        options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
      },
      {
        name: 'textAlign',
        label: 'Text alignment',
        type: 'segmented-control',
        options: ['left', 'center', 'right'],
      },
      {
        name: 'titleSize',
        label: 'Title size',
        type: 'select',
        options: ['sm', 'md', 'lg', 'xl', 'display'],
      },
      {
        name: 'paddingTop',
        label: 'Spacing above',
        type: 'select',
        options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      },
      {
        name: 'paddingBottom',
        label: 'Spacing below',
        type: 'select',
        options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      },
      {
        name: 'background',
        label: 'Background',
        type: 'select',
        options: ['default', 'surface', 'muted', 'primary', 'secondary', 'dark'],
      },
    ],
  },
  lifecycle: 'active',
};
