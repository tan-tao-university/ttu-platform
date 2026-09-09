/**
 * Component definition contract.
 *
 * Each section component must export a definition that conforms to this
 * shape. The registry validates both runtime data (via Zod schemas) and
 * the React renderer (via `Component`).
 *
 * Note: schema fields use `{ parse: (x: unknown) => unknown }` (Zod's interface)
 * rather than `ZodType<T>` to sidestep TypeScript variance issues that arise
 * when schemas use `.default()`. The actual Zod instance is still used
 * at runtime for validation.
 */
export type ComponentCategory =
  "layout" | "marketing" | "content" | "university" | "media" | "other";

export interface FieldMetadata {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "rich-text"
    | "image"
    | "video"
    | "file"
    | "icon"
    | "url"
    | "internal-link"
    | "cta"
    | "select"
    | "segmented-control"
    | "checkbox"
    | "switch"
    | "number"
    | "range"
    | "repeater"
    | "group"
    | "reference";
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  default?: unknown;
}

/**
 * Minimal Zod-like interface accepted for schema fields.
 * Any Zod schema instance satisfies this at runtime.
 */
type ZodParser = { parse: (x: unknown) => unknown };

export interface ComponentDefinition<
  TContent = unknown,
  TConfig = unknown,
  TStyle = unknown,
> {
  key: string;
  version: number;
  name: string;
  category: ComponentCategory;
  description: string;
  /** Zod schema for translatable content. */
  contentSchema: ZodParser;
  /** Zod schema for functional config. */
  configSchema: ZodParser;
  /** Zod schema for safe style tokens. */
  styleSchema: ZodParser;
  defaultContent: TContent;
  defaultConfig: TConfig;
  defaultStyle: TStyle;
  variants: string[];
  allowedPages?: string[];
  editorMetadata: FieldMetadata[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
}
