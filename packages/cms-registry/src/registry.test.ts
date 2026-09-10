import { beforeEach, describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { ComponentNotRegisteredError, SectionValidationError } from './errors';
import {
  getComponentDefinition,
  registerComponent,
  resetRegistry,
  validateSection,
  validateSectionContent,
  validateSectionStructure,
} from './registry';
import type { ComponentDefinition } from './types';

const testDefinition: ComponentDefinition<{ title: string }, { limit: number }, { align: string }> =
  {
    key: 'test-component',
    version: 1,
    name: 'Test Component',
    category: 'Others',
    contentSchema: z.object({ title: z.string().min(1) }).strict(),
    configSchema: z.object({ limit: z.number().int().min(1).max(12) }).strict(),
    styleSchema: z.object({ align: z.enum(['left', 'center', 'right']) }).strict(),
    defaultContent: { title: '' },
    defaultConfig: { limit: 6 },
    defaultStyle: { align: 'left' },
    variants: [],
    editorMetadata: { content: [], config: [], style: [] },
    lifecycle: 'active',
  };

describe('registerComponent / getComponentDefinition', () => {
  beforeEach(() => resetRegistry());

  it('registers a component and makes it retrievable by key and version', () => {
    registerComponent(testDefinition);
    expect(getComponentDefinition('test-component', 1)).toBe(testDefinition);
  });

  it('rejects re-registering the same key and version', () => {
    registerComponent(testDefinition);
    expect(() => registerComponent(testDefinition)).toThrow(/already registered/);
  });

  it('returns undefined for an unregistered version of a known key', () => {
    registerComponent(testDefinition);
    expect(getComponentDefinition('test-component', 2)).toBeUndefined();
  });
});

describe('validateSection', () => {
  beforeEach(() => {
    resetRegistry();
    registerComponent(testDefinition);
  });

  it('throws ComponentNotRegisteredError for an unknown component key', () => {
    expect(() =>
      validateSection({
        componentKey: 'does-not-exist',
        componentVersion: 1,
        content: {},
        config: {},
        style: {},
      }),
    ).toThrow(ComponentNotRegisteredError);
  });

  it('throws ComponentNotRegisteredError for a known key but unregistered version', () => {
    expect(() =>
      validateSection({
        componentKey: 'test-component',
        componentVersion: 99,
        content: {},
        config: {},
        style: {},
      }),
    ).toThrow(ComponentNotRegisteredError);
  });

  it('returns the parsed content/config/style when every part is valid', () => {
    const result = validateSection({
      componentKey: 'test-component',
      componentVersion: 1,
      content: { title: 'Hello' },
      config: { limit: 6 },
      style: { align: 'center' },
    });
    expect(result).toEqual({
      content: { title: 'Hello' },
      config: { limit: 6 },
      style: { align: 'center' },
    });
  });

  it('collects issues from content, config, and style in one SectionValidationError', () => {
    try {
      validateSection({
        componentKey: 'test-component',
        componentVersion: 1,
        content: { title: '' },
        config: { limit: 999 },
        style: { align: 'diagonal' },
      });
      throw new Error('expected validateSection to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(SectionValidationError);
      const issues = (error as SectionValidationError).issues;
      expect(issues.map((i) => i.field).sort()).toEqual([
        'config.limit',
        'content.title',
        'style.align',
      ]);
    }
  });

  it('rejects an unknown field instead of silently stripping it', () => {
    try {
      validateSection({
        componentKey: 'test-component',
        componentVersion: 1,
        content: { title: 'Hello', extraneous: true },
        config: { limit: 6 },
        style: { align: 'left' },
      });
      throw new Error('expected validateSection to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(SectionValidationError);
      expect((error as SectionValidationError).issues[0]?.field).toBe('content.extraneous');
    }
  });
});

describe('validateSectionStructure', () => {
  beforeEach(() => {
    resetRegistry();
    registerComponent(testDefinition);
  });

  it('validates config/style without requiring content to exist', () => {
    const result = validateSectionStructure({
      componentKey: 'test-component',
      componentVersion: 1,
      config: { limit: 6 },
      style: { align: 'left' },
    });
    expect(result).toEqual({ config: { limit: 6 }, style: { align: 'left' } });
  });

  it('rejects invalid config/style', () => {
    try {
      validateSectionStructure({
        componentKey: 'test-component',
        componentVersion: 1,
        config: { limit: 999 },
        style: { align: 'left' },
      });
      throw new Error('expected validateSectionStructure to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(SectionValidationError);
      expect((error as SectionValidationError).issues.map((i) => i.field)).toEqual([
        'config.limit',
      ]);
    }
  });
});

describe('validateSectionContent', () => {
  beforeEach(() => {
    resetRegistry();
    registerComponent(testDefinition);
  });

  it('validates content on its own', () => {
    expect(
      validateSectionContent({
        componentKey: 'test-component',
        componentVersion: 1,
        content: { title: 'Hi' },
      }),
    ).toEqual({ title: 'Hi' });
  });

  it('rejects an empty required field', () => {
    expect(() =>
      validateSectionContent({
        componentKey: 'test-component',
        componentVersion: 1,
        content: { title: '' },
      }),
    ).toThrow(SectionValidationError);
  });
});
