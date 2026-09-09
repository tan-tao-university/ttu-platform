/**
 * Shared locale types and helpers.
 *
 * Default locale for TTU Platform is `vi` (Vietnamese).
 * `en` is supported as the secondary locale.
 *
 * Add more locales here when introducing them — never hardcode
 * locale strings in components.
 */
export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";

/**
 * Type guard for runtime locale strings (e.g. from URL params).
 */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Pick the first available locale from a candidate list, falling back to default.
 *
 * @example
 * pickLocale(['en', 'vi'], { en: 'Hello', vi: 'Xin chào' }) // 'Hello'
 * pickLocale(['jp'], { en: 'Hello', vi: 'Xin chào' })       // 'Xin chào' (fallback)
 */
export function pickLocale<L extends string>(
  candidates: readonly L[],
  translations: Partial<Record<L, string>>,
): L | undefined {
  for (const candidate of candidates) {
    if (translations[candidate]) {
      return candidate;
    }
  }
  return undefined;
}
