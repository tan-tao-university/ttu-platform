import { cn } from "../lib/cn";
import type { WidthToken } from "@ttu/shared";
import { WIDTH_VALUES } from "../tokens";

export interface ContainerProps {
  children: React.ReactNode;
  /** Width token — defaults to `xl` (1280px). */
  width?: WidthToken;
  /** Disable horizontal padding. */
  flush?: boolean;
  className?: string;
}

/**
 * Centered, max-width container.
 *
 * Use inside `<Section>` or any block-level wrapper.
 */
export function Container({
  children,
  width = "xl",
  flush = false,
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        flush ? "" : "px-4 sm:px-6 lg:px-8",
        className,
      )}
      style={{ maxWidth: WIDTH_VALUES[width] }}
    >
      {children}
    </div>
  );
}
