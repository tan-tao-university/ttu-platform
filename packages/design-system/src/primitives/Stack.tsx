import { cn } from "../lib/cn";
import type { SpacingToken } from "@ttu/shared";

export interface StackProps {
  children: React.ReactNode;
  /** Gap between children — spacing token. */
  gap?: SpacingToken;
  /** Direction. Default is column. */
  direction?: "row" | "column";
  /** Wrap on overflow. */
  wrap?: boolean;
  /** Cross-axis alignment. */
  align?: "start" | "center" | "end" | "stretch";
  /** Main-axis alignment. */
  justify?: "start" | "center" | "end" | "between" | "around";
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
}

const GAP_CLASS: Record<SpacingToken, string> = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-8",
  lg: "gap-12",
  xl: "gap-16",
  "2xl": "gap-24",
};

const ALIGN_CLASS = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const JUSTIFY_CLASS = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const;

/**
 * Vertical (default) or horizontal stack with token-based gap.
 *
 * Use for any group of elements that need consistent spacing.
 */
export function Stack({
  children,
  gap = "md",
  direction = "column",
  wrap = false,
  align,
  justify,
  className,
  as: Tag = "div",
}: StackProps) {
  return (
    <Tag
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        wrap ? "flex-wrap" : "",
        GAP_CLASS[gap],
        align ? ALIGN_CLASS[align] : "",
        justify ? JUSTIFY_CLASS[justify] : "",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
