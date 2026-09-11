import type { z } from 'zod';

/** Doc 03 §7: Component Library groups are organized by business meaning, not by technical shape. */
export const COMPONENT_CATEGORIES = [
  'Layout',
  'Marketing',
  'Content',
  'University',
  'Media',
  'Others',
] as const;
export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

/**
 * Doc 03 §5: the standard field-type vocabulary Admin's editor generates a UI control from. Purely
 * descriptive (`editorMetadata`) — the actual validation is `contentSchema`/`configSchema`/
 * `styleSchema`, not this enum.
 */
export const FIELD_TYPES = [
  'text',
  'textarea',
  'rich-text',
  'image',
  'video',
  'file',
  'icon',
  'url',
  'internal-link',
  'cta',
  'select',
  'segmented-control',
  'checkbox',
  'switch',
  'number',
  'range',
  'repeater',
  'group',
  'reference',
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

/** Doc 03 §6: metadata for generating an Admin field editor, layered on top of the Zod schema. */
export interface EditorFieldMetadata {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: readonly string[];
}

/** Doc 03 §18: a component's position in its own support lifecycle. */
export const COMPONENT_LIFECYCLE_STATES = ['active', 'deprecated', 'unsupported'] as const;
export type ComponentLifecycleState = (typeof COMPONENT_LIFECYCLE_STATES)[number];

/**
 * The full contract for one `(key, version)` pair (doc 03 §3) — the shared source of truth Admin,
 * API, and Web all read from. `key`/`version` here must match the values passed to
 * `registerComponent` exactly; they are not derived from anything else.
 */
export interface ComponentDefinition<
  TContent = Record<string, unknown>,
  TConfig = Record<string, unknown>,
  TStyle = Record<string, unknown>,
> {
  key: string;
  version: number;
  name: string;
  category: ComponentCategory;
  description?: string;
  contentSchema: z.ZodType<TContent>;
  configSchema: z.ZodType<TConfig>;
  styleSchema: z.ZodType<TStyle>;
  defaultContent: TContent;
  defaultConfig: TConfig;
  defaultStyle: TStyle;
  /** Doc 03 §8: structural layout variants, distinct from Style controls. Empty if none. */
  variants: readonly string[];
  editorMetadata: {
    content: EditorFieldMetadata[];
    config: EditorFieldMetadata[];
    style: EditorFieldMetadata[];
  };
  lifecycle: ComponentLifecycleState;
}
