import { cn } from "@ttu/design-system";

/**
 * Legacy sub-components for backward-compat with code that imported
 * `CardHeader`, `CardTitle`, etc. from `@ttu/ui/card`.
 *
 * New code should use `Card` from `@ttu/design-system` and compose
 * its own header/title structure — those sub-components were over-
 * specific for the new design system.
 */
export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-xl font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-1 text-muted-foreground", className)}>{children}</p>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-4 border-t border-border pt-4", className)}>
      {children}
    </div>
  );
}
