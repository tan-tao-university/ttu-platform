/**
 * `cn` utility — combines `clsx` and `tailwind-merge` for safe class merging.
 *
 * Always use this when composing dynamic class names to avoid Tailwind conflicts.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
