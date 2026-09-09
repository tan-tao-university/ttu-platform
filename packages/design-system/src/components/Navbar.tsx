import { cn } from "../lib/cn";
import { Container } from "../primitives/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavDropdown } from "./NavDropdown";
import Link from "next/link";
import type { Locale } from "@ttu/shared";

export interface NavItem {
  label: string;
  href: string;
  /** Optional dropdown children — items render inside a NavDropdown panel. */
  children?: NavItem[];
}

export interface NavbarProps {
  /** Brand element shown centered above the nav row. */
  logo?: React.ReactNode;
  /** Main nav items. Items with `children` render as a NavDropdown. */
  items: NavItem[];
  /** Current locale — used by LanguageSwitcher. */
  locale: Locale;
  /** Available locales for switcher. */
  locales: readonly Locale[];
  /** Build href for language switcher. */
  buildLocaleHref: (locale: Locale) => string;
  /** Path for the search page (omit to disable the search button). */
  searchHref?: string;
  className?: string;
}

/**
 * Top navigation bar matching the Figma `Heading` frame
 * (file `Fekw3aQtCfQbHq2aoho859`, node 185:6802).
 *
 * Layout:
 *   - Centered logo on the top row.
 *   - Horizontal nav row below: items, then search button on the right.
 *   - Bottom border tinted with the brand green.
 *
 * Sticky to top of viewport. Mobile drawer is a follow-up.
 * Server Component — the dropdown interactivity lives in `NavDropdown`.
 */
export function Navbar({
  logo,
  items,
  locale,
  locales,
  buildLocaleHref,
  searchHref = "/search",
  className,
}: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-green/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <Container width="xl">
        {/* Top row — centered brand mark. */}
        <div className="flex h-[88px] items-center justify-center">
          <Link
            href="/"
            aria-label="TTU home"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
          >
            {logo ?? (
              <span className="text-xl font-bold text-primary">TTU</span>
            )}
          </Link>
        </div>

        {/* Nav row — items + right cluster. */}
        <nav
          className="flex items-center justify-between gap-4 pb-3"
          aria-label="Main navigation"
        >
          <ul className="hidden md:flex items-center gap-1">
            {items.map((item) =>
              item.children && item.children.length > 0 ? (
                <NavDropdown
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  children={item.children}
                />
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-md px-2 py-2 text-sm font-medium transition-colors",
                      "text-foreground/80 hover:text-primary",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="flex items-center gap-3">
            {searchHref ? (
              <Link
                href={searchHref}
                aria-label="Search"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-md",
                  "text-foreground/80 hover:bg-muted hover:text-primary transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                )}
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12.5 12.5L16 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            ) : null}
            <LanguageSwitcher
              current={locale}
              locales={locales}
              buildHref={buildLocaleHref}
            />
          </div>
        </nav>
      </Container>
    </header>
  );
}
