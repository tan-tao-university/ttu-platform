import { cn } from "../lib/cn";
import { TYPOGRAPHY_CLASSES, ALIGN_CLASSES } from "../tokens";
import type { AlignToken, TypographyToken } from "@ttu/shared";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: AlignToken;
  titleSize?: TypographyToken;
  className?: string;
}

/**
 * Standardized section heading.
 *
 * Sections use this so heading hierarchy and rhythm stay consistent.
 * Admin can swap eyebrow / title / description via CMS content.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  titleSize = "lg",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(ALIGN_CLASSES[align], className)}>
      {eyebrow ? (
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={TYPOGRAPHY_CLASSES[titleSize]}>{title}</h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
