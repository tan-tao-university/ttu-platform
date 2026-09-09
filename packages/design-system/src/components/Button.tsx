import { cn } from "../lib/cn";
import { RADIUS_CLASSES } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary",
  outline:
    "border-2 border-primary text-primary hover:bg-primary/5 focus-visible:ring-primary",
  ghost: "text-primary hover:bg-primary/5 focus-visible:ring-primary",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: keyof typeof RADIUS_CLASSES;
  isLoading?: boolean;
  className?: string;
}

/**
 * Button primitive. Used by section components for CTA.
 *
 * For navigation that looks like a button, use a `<Link>` styled with
 * `buttonClasses()` instead — semantics matter.
 */
export function Button({
  variant = "primary",
  size = "md",
  radius = "md",
  isLoading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        RADIUS_CLASSES[radius],
        className,
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

/**
 * Helper to compose button-styled class names for non-button elements
 * (e.g. `<Link>` or `<a>`). Keeps visual consistency without breaking semantics.
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  radius: keyof typeof RADIUS_CLASSES = "md",
): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], RADIUS_CLASSES[radius]);
}
