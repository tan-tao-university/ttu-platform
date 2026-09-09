/**
 * Component registry — single source of truth shared across Web, Admin and API.
 *
 * Web uses `get(key, version)` to render a section.
 * Admin uses the same definition to build its inspector form.
 * API uses `contentSchema`, `configSchema`, `styleSchema` to validate input.
 */
import type { ComponentDefinition } from "./definition";

const definitions = new Map<string, Map<number, ComponentDefinition>>();

export function register<TContent, TConfig, TStyle>(
  definition: ComponentDefinition<TContent, TConfig, TStyle>,
): ComponentDefinition<TContent, TConfig, TStyle> {
  if (!definitions.has(definition.key)) {
    definitions.set(definition.key, new Map());
  }
  definitions
    .get(definition.key)!
    .set(definition.version, definition as unknown as ComponentDefinition);
  return definition;
}

/**
 * Look up a component definition by key + version.
 *
 * Returns `null` when not found — caller is responsible for graceful fallback
 * (the renderer logs and renders a safe placeholder, never crashes the page).
 */
export function get(key: string, version: number): ComponentDefinition | null {
  return definitions.get(key)?.get(version) ?? null;
}

/**
 * List all registered components, optionally filtered by category.
 */
export function list(
  category?: ComponentDefinition["category"],
): ComponentDefinition[] {
  const all: ComponentDefinition[] = [];
  definitions.forEach((byVersion) => {
    byVersion.forEach((def) => all.push(def));
  });
  return category ? all.filter((d) => d.category === category) : all;
}

/**
 * List all registered versions for a given key.
 */
export function versions(key: string): number[] {
  const byVersion = definitions.get(key);
  if (!byVersion) return [];
  return Array.from(byVersion.keys()).sort((a, b) => b - a);
}

/**
 * Test-only: clear the registry.
 */
export function __resetForTests(): void {
  definitions.clear();
}

import type { ComponentDefinition as _ComponentDefinition } from "./definition";
// re-export for convenience
export type { _ComponentDefinition as ComponentDefinition };
