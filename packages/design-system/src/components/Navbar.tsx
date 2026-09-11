import { cn } from '../lib/cn';
import { NavDropdown } from './NavDropdown';
import Link from 'next/link';

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
  /** Path for the search page (omit to disable the search button). */
  searchHref?: string;
  className?: string;
}

/**
 * Top navigation bar matching the Figma `Heading` frame (file `Fekw3aQtCfQbHq2aoho859`, node
 * 185:6802).
 *
 * Pixel-perfect values pulled from `get_metadata`:
 *
 * - Header height: 174px.
 * - Logo: 285x51px at y=26px.
 * - Menu row: y=79px, item height 43px.
 * - Bottom border: 2px in `#229A68`.
 *
 * Dropdown interactivity lives in `NavDropdown`.
 */
export function Navbar({ logo, items, searchHref = '/search', className }: NavbarProps) {
  return (
    <header className={cn('relative z-40 w-full border-b-2 border-[#229A68] bg-white', className)}>
      <div className="relative mx-auto h-[172px] w-full max-w-[1280px] px-5 pt-[26px]">
        <div className="flex h-[51px] items-start justify-center">
          <Link
            href="/"
            aria-label="TTU home"
            className="inline-flex h-[51px] w-[285px] items-start rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF794A] focus-visible:ring-offset-2"
          >
            {logo ?? <span className="text-xl font-bold text-[#1F664C]">TTU</span>}
          </Link>
        </div>

        <nav
          className="absolute inset-x-5 top-[79px] flex h-[44px] items-start justify-center"
          aria-label="Main navigation"
        >
          <div className="relative flex h-[44px] w-full max-w-[1165px] items-start justify-center">
            <ul className="flex h-[43px] min-w-0 items-start justify-center max-[1150px]:pr-[44px]">
              {items.map((item) =>
                item.children && item.children.length > 0 ? (
                  <li className="mr-[-2px] shrink-0" key={item.href}>
                    <NavDropdown label={item.label} href={item.href} children={item.children} />
                  </li>
                ) : (
                  <li className="mr-[-2px] shrink-0" key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex min-h-[43px] items-center rounded-md px-[14px] py-[10px] text-[16px] font-semibold leading-normal whitespace-nowrap transition-colors',
                        'text-[#1F664C] hover:text-[#229A68]',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF794A] focus-visible:ring-offset-2',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>

            {searchHref ? (
              <Link
                href={searchHref}
                aria-label="Search"
                className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md p-[10px] text-[#1F664C] transition-colors hover:text-[#229A68] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF794A] focus-visible:ring-offset-2 max-[1150px]:absolute max-[1150px]:right-0"
              >
                <span aria-hidden="true" className="relative block h-5 w-5">
                  <span className="absolute left-0 top-0 block h-[13px] w-[13px] rounded-full border-2 border-current" />
                  <span className="absolute left-[12px] top-[12px] block h-2 w-0.5 rotate-[-45deg] rounded-full bg-current" />
                </span>
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
