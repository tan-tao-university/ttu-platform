import { cn } from "../lib/cn";
import type { BackgroundToken, SpacingToken } from "@ttu/shared";
import { BACKGROUND_CLASSES, SPACING_VALUES } from "../tokens";

export interface SectionProps {
  children: React.ReactNode;
  /** Vertical padding token — top + bottom. */
  paddingY?: SpacingToken;
  /** Override top padding. */
  paddingTop?: SpacingToken;
  /** Override bottom padding. */
  paddingBottom?: SpacingToken;
  /** Background preset. */
  background?: BackgroundToken;
  /** Render as `<section>` (default) or other tag. */
  as?: "section" | "div" | "article" | "main";
  id?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * Top-level layout primitive for a content section.
 *
 * Handles background, vertical spacing (via tokens), and semantic element choice.
 * Pair with `<Container>` inside for max-width + horizontal padding.
 */
export function Section({
  children,
  paddingY = "lg",
  paddingTop,
  paddingBottom,
  background = "default",
  as: Tag = "section",
  id,
  className,
  ...rest
}: SectionProps) {
  const paddingTopValue = paddingTop ?? paddingY;
  const paddingBottomValue = paddingBottom ?? paddingY;

  return (
    <Tag
      id={id}
      className={cn(BACKGROUND_CLASSES[background], className)}
      style={{
        paddingTop: SPACING_VALUES[paddingTopValue],
        paddingBottom: SPACING_VALUES[paddingBottomValue],
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
