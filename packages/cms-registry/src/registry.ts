import { z } from 'zod';
import {
  ComponentNotRegisteredError,
  type SectionValidationIssue,
  SectionValidationError,
} from './errors';
import type { ComponentDefinition } from './types';

/** `key -> version -> definition`. A `(key, version)` pair is immutable once registered. */
const registry = new Map<string, Map<number, ComponentDefinition>>();

/**
 * Doc 03 §22: a component only enters the registry once its full contract exists — schemas,
 * defaults, and editor metadata together, never partially. Re-registering the same `(key, version)`
 * is a programming error (two components silently fighting over one identity), not a runtime
 * condition to tolerate.
 */
export function registerComponent(definition: ComponentDefinition): void {
  const versions = registry.get(definition.key) ?? new Map<number, ComponentDefinition>();
  if (versions.has(definition.version)) {
    throw new Error(
      `Component "${definition.key}" version ${definition.version} is already registered`,
    );
  }
  versions.set(definition.version, definition);
  registry.set(definition.key, versions);
}

export function getComponentDefinition(
  key: string,
  version: number,
): ComponentDefinition | undefined {
  return registry.get(key)?.get(version);
}

/** Doc 03 §21/§7: the full Component Library, e.g. for Admin's component picker UI. */
export function listComponents(): ComponentDefinition[] {
  return [...registry.values()].flatMap((versions) => [...versions.values()]);
}

/** Test-only: clears every registration so specs don't leak state into each other. */
export function resetRegistry(): void {
  registry.clear();
}

function requireDefinition(componentKey: string, componentVersion: number): ComponentDefinition {
  const definition = getComponentDefinition(componentKey, componentVersion);
  if (!definition) throw new ComponentNotRegisteredError(componentKey, componentVersion);
  return definition;
}

export interface SectionStructureInput {
  componentKey: string;
  componentVersion: number;
  config: unknown;
  style: unknown;
}

export interface ValidatedSectionStructure<
  TConfig = Record<string, unknown>,
  TStyle = Record<string, unknown>,
> {
  config: TConfig;
  style: TStyle;
}

/**
 * Doc 02 §4: `config`/`style` are locale-independent, set once when a section is created or edited
 * — validated on their own, without requiring `content` to already exist (a freshly created section
 * legitimately has no translation yet).
 */
export function validateSectionStructure(input: SectionStructureInput): ValidatedSectionStructure {
  const definition = requireDefinition(input.componentKey, input.componentVersion);
  const issues = [
    ...collectIssues('config', definition.configSchema, input.config),
    ...collectIssues('style', definition.styleSchema, input.style),
  ];
  if (issues.length > 0) throw new SectionValidationError(issues);
  return {
    config: definition.configSchema.parse(input.config),
    style: definition.styleSchema.parse(input.style),
  };
}

export interface SectionContentInput {
  componentKey: string;
  componentVersion: number;
  content: unknown;
}

/**
 * Doc 02 §5.1: `content` is the one part of a section that's set per locale, independently of
 * `config`/`style`.
 */
export function validateSectionContent<TContent = Record<string, unknown>>(
  input: SectionContentInput,
): TContent {
  const definition = requireDefinition(input.componentKey, input.componentVersion);
  const issues = collectIssues('content', definition.contentSchema, input.content);
  if (issues.length > 0) throw new SectionValidationError(issues);
  return definition.contentSchema.parse(input.content) as TContent;
}

export interface SectionInput {
  componentKey: string;
  componentVersion: number;
  content: unknown;
  config: unknown;
  style: unknown;
}

export interface ValidatedSection<
  TContent = Record<string, unknown>,
  TConfig = Record<string, unknown>,
  TStyle = Record<string, unknown>,
> {
  content: TContent;
  config: TConfig;
  style: TStyle;
}

/**
 * Doc 02 §11 / doc 03 §13: validates all three parts together — the full check
 * `PagePublishingService` runs at publish time (doc 03 §13: "ưu tiên reject khi publish để phát
 * hiện data drift sớm"), after `content` has actually been set for the locale being published.
 * Throws `ComponentNotRegisteredError` if `(componentKey, componentVersion)` isn't registered at
 * all, or `SectionValidationError` with every field-level issue at once (not just the first) if the
 * shapes don't match — unknown fields are rejected, not silently stripped, so schema drift is
 * caught immediately rather than propagating into a published snapshot.
 */
export function validateSection(input: SectionInput): ValidatedSection {
  const definition = requireDefinition(input.componentKey, input.componentVersion);

  const issues: SectionValidationIssue[] = [
    ...collectIssues('content', definition.contentSchema, input.content),
    ...collectIssues('config', definition.configSchema, input.config),
    ...collectIssues('style', definition.styleSchema, input.style),
  ];
  if (issues.length > 0) throw new SectionValidationError(issues);

  return {
    content: definition.contentSchema.parse(input.content),
    config: definition.configSchema.parse(input.config),
    style: definition.styleSchema.parse(input.style),
  };
}

function collectIssues(
  prefix: string,
  schema: z.ZodType<unknown>,
  value: unknown,
): SectionValidationIssue[] {
  const result = schema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.flatMap((issue): SectionValidationIssue[] => {
    // `.strict()` reports every rejected extra key as one issue with an empty `path` and a `keys`
    // list — expand it so each unknown field gets its own precise field pointer, same as any
    // other validation failure.
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => ({
        field: [prefix, key].join('.'),
        code: issue.code,
        message: `Unrecognized field "${key}"`,
      }));
    }
    return [
      {
        field: [prefix, ...issue.path.map(String)].join('.'),
        code: issue.code,
        message: issue.message,
      },
    ];
  });
}
