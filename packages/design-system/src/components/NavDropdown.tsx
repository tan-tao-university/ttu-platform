'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { cn } from '../lib/cn';
import type { NavItem } from './Navbar';

export interface NavDropdownProps {
  /** Section label shown in the top-level nav row. */
  label: string;
  /** Section landing URL — the label links here directly. */
  href: string;
  /** Dropdown items. */
  children: NavItem[];
  className?: string;
}

/**
 * Top-level nav item with a dropdown panel.
 *
 * - The label is a real `<Link>` to the section landing page.
 * - The chevron is a `<button>` that toggles the dropdown panel — useful on touch devices where
 *   `hover` does not fire.
 * - On desktop, the panel also opens on hover and `focus-within` (CSS).
 * - Closes on Escape, on outside pointer-down, and after clicking a child link.
 */
export function NavDropdown({ label, href, children, className }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('group relative h-[43px]', className)}
      data-open={open ? 'true' : 'false'}
    >
      <div className="flex h-[43px] items-center">
        <Link
          href={href}
          className={cn(
            'inline-flex min-h-[43px] items-center rounded-md px-[14px] py-[10px] text-[16px] font-semibold leading-normal whitespace-nowrap transition-colors',
            'text-[#1F664C] hover:text-[#229A68]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF794A] focus-visible:ring-offset-2',
          )}
        >
          {label}
        </Link>
        <button
          type="button"
          aria-label={`${label} menu`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            'inline-flex h-[43px] w-5 items-center justify-center rounded-md p-0 text-[#1F664C] transition-colors',
            'hover:text-[#229A68]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF794A] focus-visible:ring-offset-2',
          )}
        >
          <img
            aria-hidden="true"
            src="https://www.figma.com/api/mcp/asset/1200e309-566e-4188-9011-e3ffbe4cd8e4.svg"
            alt=""
            className={cn(
              'h-[10px] w-[10px] rotate-90 object-contain transition-transform',
              open && 'rotate-[270deg]',
            )}
          />
        </button>
      </div>

      <div
        role="menu"
        aria-label={label}
        className={cn(
          'absolute left-1/2 top-full z-50 mt-0 min-w-[14rem] -translate-x-1/2',
          'rounded-md border border-[#E2E8F0] bg-white p-1 shadow-ttu-500',
          // Open via JS state OR CSS hover/focus-within for desktop keyboard users.
          open ? 'block' : 'hidden group-hover:block group-focus-within:block',
        )}
      >
        <ul className="flex flex-col">
          {children.map((child) => (
            <li key={child.href} role="none">
              <Link
                role="menuitem"
                href={child.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block rounded-sm px-3 py-2 text-sm',
                  'text-[#1F664C]/80 hover:bg-[#F2F2F2] hover:text-[#229A68]',
                  'focus:outline-none focus-visible:bg-[#F2F2F2] focus-visible:text-[#229A68]',
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
