/**
 * Section renderer — takes a `PageSection` and renders the matching
 * component from the registry.
 *
 * Used by pages to render any section list. Centralizes:
 * - Translation lookup with fallback to default locale.
 * - Safe error logging if component / version is unknown.
 * - A visible fallback for broken sections (admin can spot them).
 */
import { get } from "@ttu/cms-registry";
import { DEFAULT_LOCALE, type Locale, type PageSection } from "@ttu/shared";

export interface RenderSectionOptions {
  /** Current locale for translation lookup. */
  locale: Locale;
  /** Optional page slug for context in error logs. */
  pageSlug?: string;
}

export function pickTranslation(
  section: PageSection,
  locale: Locale,
): Record<string, unknown> {
  const direct = section.translations[locale];
  if (direct?.content) return direct.content;
  // Fallback to default locale
  const fallback = section.translations[DEFAULT_LOCALE];
  if (fallback?.content) return fallback.content;
  return {};
}

/**
 * Render a single section. Returns `null` if the component is missing —
 * callers can decide whether to render a fallback or skip.
 *
 * Errors during render are caught and surfaced as a visible (dev-only)
 * fallback so the page never crashes.
 */
export function renderSection(
  section: PageSection,
  options: RenderSectionOptions,
): React.ReactNode {
  const def = get(section.componentKey, section.componentVersion);
  if (!def) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[ttu] Missing component: ${section.componentKey}@${section.componentVersion}`,
        options,
      );
    }
    return (
      <div className="mx-auto my-4 max-w-2xl rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        ⚠ Unknown component:{" "}
        <code>
          {section.componentKey}@{section.componentVersion}
        </code>
      </div>
    );
  }

  // Default locale fallback for missing translations
  const content = pickTranslation(section, options.locale);

  try {
    const Component = def.Component;
    return (
      <Component
        content={content as never}
        config={section.config as never}
        style={section.style as never}
        locale={options.locale}
        variant={section.variant}
      />
    );
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[ttu] Render error in ${section.componentKey}@${section.componentVersion}`,
        err,
      );
    }
    return (
      <div className="mx-auto my-4 max-w-2xl rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        ⚠ Render error in component:{" "}
        <code>
          {section.componentKey}@{section.componentVersion}
        </code>
      </div>
    );
  }
}

/**
 * Render an array of sections in order.
 */
export function renderSections(
  sections: PageSection[],
  options: RenderSectionOptions,
): React.ReactNode[] {
  return sections.map((section) => (
    <div
      key={section.id}
      data-section-id={section.id}
      data-component-key={section.componentKey}
    >
      {renderSection(section, options)}
    </div>
  ));
}
