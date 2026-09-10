# Architecture: Component Registry & Design System

> **Status:** infrastructure implemented — `packages/cms-registry` ships the registry engine, the Level A style-token vocabulary, and one fully-specified component (`hero` v1). Consumed today only by `apps/api/src/cms/` (validation at write and publish time); Admin's dynamic form inspectors and Web's React renderers don't exist yet. `packages/design-system` (token → CSS mapping) is not built — see §3.

## 1. Role of the Component Registry

The Component Registry (`packages/cms-registry`) acts as the **single source of truth and contract** shared across all three applications in the monorepo:

- **Admin Dashboard (`apps/admin`)**: Uses component definitions to automatically generate form inspectors, field controls, and validation rules.
- **Backend API (`apps/api`)**: Uses runtime schemas (e.g. Zod) to validate section configurations, styles, and content during save and publish requests.
- **Public Website (`apps/web`)**: Maps registered component keys and versions to concrete React 19 component implementations.

![Component Registry Architecture](../assets/architecture-component-registry.png)

## 2. Component Definition Anatomy

A registered component exports a strongly typed definition (`packages/cms-registry/src/types.ts`):

```ts
export interface ComponentDefinition<TContent, TConfig, TStyle> {
  key: string;
  version: number;
  name: string;
  category: 'Layout' | 'Marketing' | 'Content' | 'University' | 'Media' | 'Others';
  description?: string;
  contentSchema: z.ZodType<TContent>;
  configSchema: z.ZodType<TConfig>;
  styleSchema: z.ZodType<TStyle>;
  defaultContent: TContent;
  defaultConfig: TConfig;
  defaultStyle: TStyle;
  variants: readonly string[];
  editorMetadata: {
    content: EditorFieldMetadata[];
    config: EditorFieldMetadata[];
    style: EditorFieldMetadata[];
  };
  lifecycle: 'active' | 'deprecated' | 'unsupported';
}
```

`registerComponent()` throws if the same `(key, version)` pair is registered twice — a `(key, version)` is immutable once shipped (§5). `validateSectionStructure()`/`validateSectionContent()`/`validateSection()` are the three entry points `apps/api/src/cms/` calls: the first two check `config`+`style` or `content` alone (a freshly created section legitimately has no translation yet); the third checks all three together, the full check `PagePublishingService` runs at publish time.

## 3. Safe Style Controls — Level A

To ensure robust visual governance, styling options are restricted to semantic design tokens:

### Spacing Tokens

```plain text
none | xs | sm | md | lg | xl | 2xl
```

Mapped by the design system into responsive padding/margin (e.g. `sm = 16px`, `md = 32px`, `lg = 48px`, `xl = 64px`).

### Width Tokens

```plain text
sm | md | lg | xl | 2xl | full
```

### Alignment Tokens

```plain text
left | center | right
```

### Background Presets

```plain text
default | surface | muted | primary | secondary | dark
```

### Typography Presets

```plain text
sm | md | lg | xl | display
```

### Radius Presets

```plain text
none | sm | md | lg | xl
```

### Shadow Presets

```plain text
none | sm | md | lg
```

The relational database stores only the token identifiers (`"xl"`, `"primary"`). The frontend design system resolves tokens to CSS variables and Tailwind classes.

## 4. Component Catalog (design doc 03 §21)

20 names are planned; only `hero` has the full field-level contract (content/config/style schemas, defaults, editor metadata) doc 03 §22 requires before a component can actually be registered. The rest are category placeholders, not yet buildable without inventing their schemas — see [`../../apps/api/IMPLEMENTATION_STATUS.md`](../../apps/api/IMPLEMENTATION_STATUS.md) §3.11 and §4.1.

| Category | Component Key | Primary Purpose | Status |
| :-- | :-- | :-- | :-- |
| **Marketing** | `hero` | Landing page banner with title, subtitle, CTAs, and background media | ✅ Registered (v1) |
| **Marketing** | `cta` | High-conversion prompt with button actions and background options | ⚪ Planned |
| **Marketing** | `image-banner` | Visual editorial banner with overlaid messaging | ⚪ Planned |
| **Marketing** | `statistics` | Numerical achievements counter (students, faculty count, international partners) | ⚪ Planned |
| **Layout** | `rich-text` | Structured prose, formatted paragraphs, blockquotes, and lists | ⚪ Planned |
| **Layout** | `image-text` | Two-column split layout pairing imagery with descriptive narrative | ⚪ Planned |
| **Layout** | `columns` | Multi-column grid container for nested content presentation | ⚪ Planned |
| **Layout** | `spacer` | Managed vertical spacing between sections | ⚪ Planned |
| **Content** | `news-grid` | Dynamic grid query displaying latest news articles by category | ⚪ Planned |
| **Content** | `announcement-list` | Vertical list of official university notices and admissions deadlines | ⚪ Planned |
| **Content** | `event-list` | Chronological event cards with dates, locations, and registration links | ⚪ Planned |
| **Content** | `featured-article` | Full-width highlighted spotlight story | ⚪ Planned |
| **University** | `faculty-grid` | Navigation grid linking to TTU's 7 faculties | ⚪ Planned |
| **University** | `program-grid` | Degree showcase (Undergraduate, Graduate, Medical degrees) | ⚪ Planned |
| **University** | `people-grid` | Leadership and notable faculty directory cards | ⚪ Planned |
| **University** | `research-highlight` | Key research publications, laboratory achievements, and patents | ⚪ Planned |
| **Media / Other** | `gallery` | Responsive media gallery grid with lightbox modal | ⚪ Planned |
| **Media / Other** | `video` | Embedded or self-hosted video player | ⚪ Planned |
| **Media / Other** | `partner-logos` | Horizontal carousel / grid of academic and healthcare partner logos | ⚪ Planned |
| **Media / Other** | `quick-links` | Curated shortcut list to frequently visited pages | ⚪ Planned |

## 5. Component Versioning & Lifecycle

Every component definition carries an explicit integer version (`component_version`):

- **Patch / Non-breaking**: Bug fixes, responsive tweaks, and accessibility updates keep the version unchanged.
- **Breaking Changes**: Adding required fields, changing schema structures, or removing properties increments `version` (e.g. `v1` → `v2`).
- **Lifecycle Progression**: `active` → `deprecated` (old pages render safely; new insertions blocked in Admin) → `unsupported` (retired after migrations).
