import { cn } from "../lib/cn";
import type { ColumnToken, SpacingToken } from "@ttu/shared";

export interface GridProps {
  children: React.ReactNode;
  /** Column count token — responsive breakpoints are decided by the grid component. */
  columns?: ColumnToken;
  /** Gap between cells. */
  gap?: SpacingToken;
  className?: string;
}

/**
 * Responsive grid primitive.
 *
 * Columns are mapped to Tailwind responsive classes:
 * - 1 col → always 1
 * - 2 col → 1 mobile / 2 tablet+
 * - 3 col → 1 mobile / 2 tablet / 3 desktop
 * - 4 col → 1 mobile / 2 tablet / 4 desktop
 * - 6 col → 1 mobile / 2 tablet / 3 desktop / 6 xl
 */
const COLS_CLASS: Record<ColumnToken, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

const GAP_CLASS: Record<SpacingToken, string> = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-10",
  "2xl": "gap-12",
};

export function Grid({
  children,
  columns = 3,
  gap = "md",
  className,
}: GridProps) {
  return (
    <div className={cn("grid", COLS_CLASS[columns], GAP_CLASS[gap], className)}>
      {children}
    </div>
  );
}
