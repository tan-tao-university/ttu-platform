import { cn } from "../lib/cn";
import type { Locale } from "@ttu/shared";
import Link from "next/link";

export interface LanguageSwitcherProps {
  /** Current locale. */
  current: Locale;
  /** Target locales to render. */
  locales: readonly Locale[];
  /** Build the target URL for a given locale — usually keep the same path. */
  buildHref: (locale: Locale) => string;
  className?: string;
}

const LABEL: Record<Locale, string> = {
  vi: "VI",
  en: "EN",
};

/**
 * Renders a small group of language toggles.
 *
 * Server Component. Pass `buildHref` to control the URL shape
 * (e.g. with or without locale prefix).
 */
export function LanguageSwitcher({
  current,
  locales,
  buildHref,
  className,
}: LanguageSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1 text-sm",
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      {locales.map((loc) => {
        const isActive = loc === current;
        return (
          <Link
            key={loc}
            href={buildHref(loc)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "inline-flex h-7 min-w-7 items-center justify-center rounded-sm px-2 font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
            hrefLang={loc}
          >
            {LABEL[loc]}
          </Link>
        );
      })}
    </div>
  );
}
