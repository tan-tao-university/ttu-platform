# Architecture: CMS & Page Builder

## 1. Controlled Component CMS Philosophy

The `ttu-platform` content management architecture implements a **Controlled Component CMS** model rather than an unconstrained page builder like Elementor or raw HTML fields.

- **Developer Controlled**: Component markup, semantic HTML structure, responsive breakpoints, accessibility (WCAG 2.1), and allowed style tokens are maintained strictly in TypeScript and React code within the monorepo.
- **Administrator Controlled**: Page composition, component selection, sort order, localized textual content, media asset selection, and pre-approved safe visual styling presets.
- **Strictly Prohibited**: Injection of custom CSS, JavaScript scripts, raw HTML tags, Tailwind class strings, or arbitrary pixel positioning.

![CMS Architecture](../assets/architecture-cms-page-builder.png)

## 2. Page → Section → Component Model

Pages are modeled as an ordered collection of discrete sections. A section does not contain rendered HTML; instead, it stores an instance reference to a registered component key, version, configuration, safe style tokens, and localized content:

### Logical Data Structure of a Section

```json
{
  "componentKey": "hero",
  "componentVersion": 1,
  "config": {
    "backgroundImageId": "e3b0c442-98fc-1c14-9afbf4c8996fb924",
    "primaryButtonUrl": "/gioi-thieu"
  },
  "style": {
    "contentWidth": "xl",
    "textAlign": "center",
    "paddingTop": "xl",
    "paddingBottom": "xl",
    "background": "primary"
  },
  "translations": {
    "vi": {
      "content": {
        "eyebrow": "Đại học Tân Tạo",
        "title": "Kiến tạo tương lai từ tri thức",
        "subtitle": "Môi trường giáo dục khai phóng chuẩn Hoa Kỳ",
        "primaryButtonLabel": "Khám phá TTU"
      }
    },
    "en": {
      "content": {
        "eyebrow": "Tan Tao University",
        "title": "Empowering the Future Through Knowledge",
        "subtitle": "US-accredited liberal arts education environment",
        "primaryButtonLabel": "Explore TTU"
      }
    }
  }
}
```

## 3. The Three Component Data Zones

Every component cleanly partitions its operational data into three isolated zones:

### 3.1 Content (Localized)

Contains human-readable editorial text that requires per-locale translation (headlines, body copy, call-to-action labels, subtitles). Stored per-locale in `page_section_translations`.

### 3.2 Config (Technical & Data Source)

Contains functional parameters that are language-agnostic: media asset UUIDs, navigation target URLs, query filters, item count limits, or display toggles. Stored once per section in `page_sections.config`.

### 3.3 Style (Safe Design Tokens)

Contains presentation preferences chosen by the editor. Only approved semantic tokens (e.g. `sm`, `md`, `xl`, `primary`, `center`) are permitted. Stored once per section in `page_sections.style`. The frontend design system handles translation of tokens into CSS.

## 4. Static vs Dynamic Components

### Static Components

Self-contained components whose content is stored directly within the section translations:

- `Hero`
- `RichText`
- `ImageText`
- `CallToAction`
- `Statistics`
- `Gallery`

### Dynamic Components

Components that act as queries against existing domain models. They store query configuration only and resolve real-time data during rendering:

- `NewsGrid`: Queries `contents` and `content_translations` where `type = 'NEWS'`.
- `EventList`: Queries `contents`, `content_translations`, and `events`.
- `ProgramGrid`: Queries `programs` and `program_translations`.
- `FacultyGrid`: Queries external faculty integration endpoints from `ttu-faculty-platform`.

Articles and domain records are **never duplicated** into `page_sections`.

## 5. Independent Per-Locale Lifecycle

Editorial workflows operate completely independently for Vietnamese (`vi`) and English (`en`):

```plain text
Page P001
├── vi → PUBLISHED → points to Immutable Revision vi #14
└── en → DRAFT     → points to Immutable Revision en #8 (if previously published)
```

1. **Draft**: Editing a draft in one locale never modifies or corrupts the live published revision of either locale.
2. **Preview**: Renders the exact draft state using the frontend component catalog under the requested locale.
3. **Publish**: Atomically captures an immutable snapshot of shared render state (section order, config, styles) along with that locale's section translations into `page_revisions`, updates `published_revision_id` in `page_translations`, and syncs `public_routes`.
4. **Rollback**: Clones a historical snapshot for the target locale to initialize a fresh draft, leaving historical revision records untouched.
