"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { cn } from "../lib/cn";
import type { NavItem } from "./Navbar";

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
 * - The chevron is a `<button>` that toggles the dropdown panel — useful
 *   on touch devices where `hover` does not fire.
 * - On desktop, the panel also opens on hover and `focus-within` (CSS).
 * - Closes on Escape, on outside pointer-down, and after clicking a child link.
 */
export function NavDropdown({
  label,
  href,
  children,
  className,
}: NavDropdownProps) {
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
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("group relative", className)}
      data-open={open ? "true" : "false"}
    >
      <div className="flex items-center gap-1">
        <Link
          href={href}
          className={cn(
            "rounded-md px-2 py-2 text-sm font-medium transition-colors",
            "text-foreground/80 hover:text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
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
            "inline-flex h-8 w-6 items-center justify-center rounded-md text-foreground/70 transition-colors",
            "hover:bg-muted hover:text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          <svg
            aria-hidden="true"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={cn("transition-transform", open && "rotate-180")}
          >
            <path
              d="M2 3.5L5 6.5L8 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        role="menu"
        aria-label={label}
        className={cn(
          "absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 min-w-[14rem]",
          "rounded-md border border-border bg-background shadow-ttu-500 p-1",
          // Open via JS state OR CSS hover/focus-within for desktop keyboard users.
          open ? "block" : "hidden group-hover:block group-focus-within:block",
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
                  "block rounded-sm px-3 py-2 text-sm",
                  "text-foreground/80 hover:bg-muted hover:text-primary",
                  "focus:outline-none focus-visible:bg-muted focus-visible:text-primary",
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
