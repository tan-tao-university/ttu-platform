import { cn } from "../lib/cn";
import { Container } from "../primitives/Container";
import { Grid } from "../primitives/Grid";
import Link from "next/link";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  /** Logo / brand mark. */
  logo?: React.ReactNode;
  /** Brand description. */
  description?: string;
  /** Link columns. */
  columns?: FooterColumn[];
  /** Bottom row — usually copyright + secondary links. */
  copyright?: string;
  className?: string;
}

/**
 * Site footer.
 *
 * Layout:
 * - Top: brand + columns (responsive grid)
 * - Bottom: copyright bar
 */
export function Footer({
  logo,
  description,
  columns = [],
  copyright,
  className,
}: FooterProps) {
  const year = new Date().getFullYear();
  const defaultCopyright =
    copyright ?? `© ${year} Trường Đại học Tân Tạo. All rights reserved.`;

  return (
    <footer className={cn("bg-foreground text-background", className)}>
      <Container width="xl" className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand block — spans 2 cols on md+ */}
          <div className="md:col-span-2">
            <div className="text-xl font-bold text-background">
              {logo ?? "Trường Đại học Tân Tạo"}
            </div>
            {description ? (
              <p className="mt-3 max-w-md text-sm text-background/70">
                {description}
              </p>
            ) : null}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-background/90">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-background/70 hover:text-background transition-colors"
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-background/10 pt-6 text-xs text-background/60 md:flex-row md:items-center md:justify-between">
          <span>{defaultCopyright}</span>
          <span>tan-tao.edu.vn</span>
        </div>
      </Container>
    </footer>
  );
}

// Suppress unused warning for Grid (kept available for footer variants)
void Grid;
