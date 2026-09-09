import { cn } from "../lib/cn";
import { RADIUS_CLASSES, SHADOW_CLASSES } from "../tokens";
import type { RadiusToken, ShadowToken, SpacingToken } from "@ttu/shared";

export interface CardProps {
  children: React.ReactNode;
  /** Inner padding token. */
  padding?: SpacingToken;
  /** Border radius token. */
  radius?: RadiusToken;
  /** Box-shadow token. */
  shadow?: ShadowToken;
  /** Add hover lift effect. */
  hover?: boolean;
  /** Render with border. Default true. */
  bordered?: boolean;
  className?: string;
  as?: "div" | "article" | "li";
}

const PAD_CLASS: Record<SpacingToken, string> = {
  none: "",
  xs: "p-3",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
  "2xl": "p-12",
};

/**
 * Generic card primitive.
 *
 * Sections like NewsGrid / EventList compose this for each item.
 */
export function Card({
  children,
  padding = "md",
  radius = "lg",
  shadow = "none",
  hover = false,
  bordered = true,
  className,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cn(
        "bg-surface text-foreground",
        PAD_CLASS[padding],
        RADIUS_CLASSES[radius],
        SHADOW_CLASSES[shadow],
        bordered ? "border border-border" : "",
        hover ? "transition-shadow hover:shadow-md" : "",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
